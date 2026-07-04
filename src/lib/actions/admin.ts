"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { paymentProvider } from "@/lib/payments";
import { paypalRefund } from "@/lib/payments/paypal";
import { requireAdmin } from "@/lib/auth/guard";
import { parseProductsCsv } from "@/lib/core/csv-import";
import { slugify } from "@/lib/core/slug";

// Mutaciones del panel. Cada acción exige rol admin y registra un AuditLog.

async function audit(action: string, entity: string, entityId?: string, metadata: object = {}) {
  const { userId } = await requireAdmin();
  await prisma.auditLog.create({
    data: { userId: userId ?? undefined, action, entity, entityId, metadata },
  });
}

const productSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  price: z.coerce.number().min(0), // euros
  sku: z.string().min(1),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().optional(),
});

export async function createProductAction(formData: FormData) {
  await requireAdmin();
  const data = productSchema.parse(Object.fromEntries(formData));

  const location = await prisma.location.findFirst();
  const product = await prisma.product.create({
    data: {
      slug: `${slugify(data.title)}-${Date.now().toString(36)}`,
      title: data.title,
      description: data.description,
      status: data.status,
      publishedAt: data.status === "ACTIVE" ? new Date() : null,
      ...(data.categoryId && { categories: { create: [{ categoryId: data.categoryId }] } }),
      variants: {
        create: [
          {
            sku: data.sku,
            priceAmount: Math.round(data.price * 100),
            currency: "EUR",
            ...(location && { stockLevels: { create: [{ locationId: location.id, available: data.stock }] } }),
          },
        ],
      },
    },
  });

  await audit("product.create", "Product", product.id, { title: data.title });
  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export type ImportResult = { created: number; updated: number; errors: { line: number; message: string }[] };

export async function importProductsAction(_prev: ImportResult | null, formData: FormData): Promise<ImportResult> {
  await requireAdmin();
  const csv = String(formData.get("csv") ?? "");
  const { products, errors } = parseProductsCsv(csv);

  const location = await prisma.location.findFirst();
  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const catBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  let created = 0;
  let updated = 0;

  for (const p of products) {
    const categoryId = p.category ? catBySlug.get(p.category) : undefined;
    const existing = await prisma.productVariant.findUnique({
      where: { sku: p.sku },
      select: { id: true, productId: true },
    });

    if (existing) {
      // Actualiza variante (precio/stock) y producto existentes
      await prisma.productVariant.update({
        where: { id: existing.id },
        data: { priceAmount: p.price, compareAt: p.compareAt ?? undefined },
      });
      await prisma.product.update({
        where: { id: existing.productId },
        data: { title: p.title, description: p.description, status: p.status },
      });
      if (location) {
        await prisma.stockLevel.upsert({
          where: { variantId_locationId: { variantId: existing.id, locationId: location.id } },
          update: { available: p.stock },
          create: { variantId: existing.id, locationId: location.id, available: p.stock },
        });
      }
      updated++;
    } else {
      await prisma.product.create({
        data: {
          slug: `${slugify(p.title)}-${Date.now().toString(36)}-${created}`,
          title: p.title,
          description: p.description,
          status: p.status,
          publishedAt: p.status === "ACTIVE" ? new Date() : null,
          ...(categoryId ? { categories: { create: [{ categoryId }] } } : {}),
          variants: {
            create: [
              {
                sku: p.sku,
                priceAmount: p.price,
                compareAt: p.compareAt ?? undefined,
                currency: "EUR",
                ...(location && { stockLevels: { create: [{ locationId: location.id, available: p.stock }] } }),
              },
            ],
          },
        },
      });
      created++;
    }
  }

  await audit("product.import", "Product", undefined, { created, updated, errors: errors.length });
  revalidatePath("/admin/productos");
  return { created, updated, errors };
}

export async function updateProductStatusAction(formData: FormData) {
  await requireAdmin();
  const { id, status } = z
    .object({ id: z.string().min(1), status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]) })
    .parse(Object.fromEntries(formData));

  await prisma.product.update({
    where: { id },
    data: { status, publishedAt: status === "ACTIVE" ? new Date() : undefined },
  });
  await audit("product.status", "Product", id, { status });
  revalidatePath("/admin/productos");
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const { id, status } = z
    .object({
      id: z.string().min(1),
      status: z.enum(["PENDING", "PAID", "FULFILLING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
    })
    .parse(Object.fromEntries(formData));

  await prisma.order.update({ where: { id }, data: { status } });
  await audit("order.status", "Order", id, { status });
  revalidatePath(`/admin/pedidos/${id}`);
}

export async function refundOrderAction(formData: FormData) {
  await requireAdmin();
  const { id, amount } = z
    .object({ id: z.string().min(1), amount: z.coerce.number().min(0) })
    .parse(Object.fromEntries(formData));

  const order = await prisma.order.findUnique({ where: { id }, include: { payments: true } });
  if (!order) throw new Error("Pedido no encontrado");

  const cents = Math.round(amount * 100);
  const payment = order.payments[0];
  if (payment) {
    if (payment.provider === "PAYPAL") {
      await paypalRefund(payment.providerRef, cents, payment.currency);
    } else {
      await paymentProvider.refund(payment.providerRef, cents);
    }
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        refunded: { increment: cents },
        status: cents >= payment.amount ? "REFUNDED" : "PARTIALLY_REFUNDED",
      },
    });
  }
  await prisma.order.update({
    where: { id },
    data: { status: cents >= order.total ? "REFUNDED" : order.status },
  });
  await audit("order.refund", "Order", id, { amount: cents });
  revalidatePath(`/admin/pedidos/${id}`);
}

export async function createCouponAction(formData: FormData) {
  await requireAdmin();
  const data = z
    .object({
      code: z.string().min(1).max(40),
      type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
      value: z.coerce.number().min(0),
    })
    .parse(Object.fromEntries(formData));

  await prisma.discount.create({
    data: {
      code: data.code.trim().toUpperCase(),
      type: data.type,
      // PERCENTAGE: 0-100; FIXED_AMOUNT: euros -> céntimos
      value: data.type === "FIXED_AMOUNT" ? Math.round(data.value * 100) : Math.round(data.value),
    },
  });
  await audit("coupon.create", "Discount", undefined, { code: data.code });
  revalidatePath("/admin/cupones");
}
