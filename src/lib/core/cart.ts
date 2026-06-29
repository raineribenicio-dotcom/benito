import { cookies } from "next/headers";
import { prisma } from "@/lib/db/client";
import { getCurrentUserId } from "@/lib/auth/session";
import { computeTotals, type DiscountInput } from "./pricing";
import { computeShipping } from "./shipping";

// Carrito persistente. Invitados: token en cookie httpOnly. Usuarios: ligado a
// User. Lecturas tolerantes a fallos; las mutaciones viven en route handlers /
// server actions (donde sí se pueden escribir cookies).

const COOKIE = "cart_token";
const TAX_RATE = 0.21; // IVA general; en producción según país/categoría

export type CartView = {
  id: string;
  items: {
    id: string;
    variantId: string;
    sku: string;
    title: string;
    variantTitle: string | null;
    slug: string;
    imageUrl: string | null;
    unitPrice: number;
    quantity: number;
    available: number;
    lineTotal: number;
  }[];
  couponCode: string | null;
  currency: string;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  itemCount: number;
};

async function discountInputFor(code: string | null, subtotal: number): Promise<DiscountInput | null> {
  if (!code) return null;
  const d = await prisma.discount.findUnique({ where: { code } });
  if (!d || !d.isActive) return null;
  if (d.startsAt && d.startsAt > new Date()) return null;
  if (d.endsAt && d.endsAt < new Date()) return null;
  if (d.usageLimit != null && d.usageCount >= d.usageLimit) return null;
  if (d.minSubtotal != null && subtotal < d.minSubtotal) return null;
  return { type: d.type, value: d.value, minSubtotal: d.minSubtotal ?? undefined } as DiscountInput;
}

/** Lectura de solo lectura para Server Components. No crea carrito ni cookies. */
export async function getActiveCart(): Promise<CartView | null> {
  try {
    const userId = await getCurrentUserId();
    const token = cookies().get(COOKIE)?.value;
    if (!userId && !token) return null;

    const cart = await prisma.cart.findFirst({
      where: { status: "ACTIVE", ...(userId ? { userId } : { token }) },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { include: { media: { orderBy: { position: "asc" }, take: 1 } } },
                stockLevels: true,
                optionValues: { include: { optionValue: true } },
              },
            },
          },
        },
      },
    });
    if (!cart) return null;

    const items = cart.items.map((it) => ({
      id: it.id,
      variantId: it.variantId,
      sku: it.variant.sku,
      title: it.variant.product.title,
      variantTitle: it.variant.optionValues.map((o) => o.optionValue.value).join(" / ") || null,
      slug: it.variant.product.slug,
      imageUrl: it.variant.product.media[0]?.url ?? null,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      available: it.variant.stockLevels.reduce((s, l) => s + l.available, 0),
      lineTotal: it.unitPrice * it.quantity,
    }));

    const lineItems = items.map((i) => ({ unitPrice: i.unitPrice, quantity: i.quantity }));
    const subtotal = lineItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const discount = await discountInputFor(cart.couponCode, subtotal);
    const shippingAmount = computeShipping({ subtotal: subtotal - 0 });
    const totals = computeTotals({ items: lineItems, discount, shippingAmount, taxRate: TAX_RATE });

    return {
      id: cart.id,
      items,
      couponCode: cart.couponCode,
      currency: cart.currency,
      ...totals,
      itemCount: items.reduce((s, i) => s + i.quantity, 0),
    };
  } catch (err) {
    console.warn("[cart] DB no disponible:", (err as Error).message);
    return null;
  }
}

/** Resuelve o crea el carrito de la petición. Usar en route handlers / actions. */
export async function getOrCreateCartId(): Promise<string> {
  const userId = await getCurrentUserId();
  const jar = cookies();
  const token = jar.get(COOKIE)?.value;

  let cart = await prisma.cart.findFirst({
    where: { status: "ACTIVE", ...(userId ? { userId } : { token: token ?? "__none__" }) },
  });

  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: userId ?? undefined } });
    jar.set(COOKIE, cart.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }
  return cart.id;
}

export async function addItem(variantId: string, quantity: number) {
  const cartId = await getOrCreateCartId();
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { stockLevels: true },
  });
  if (!variant) throw new Error("Variante no encontrada");

  const available = variant.stockLevels.reduce((s, l) => s + l.available, 0);
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId, variantId } },
  });
  const nextQty = (existing?.quantity ?? 0) + quantity;
  if (nextQty > available) throw new Error("Stock insuficiente");

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId, variantId } },
    update: { quantity: nextQty },
    create: { cartId, variantId, quantity, unitPrice: variant.priceAmount },
  });
}

export async function updateItemQty(itemId: string, quantity: number) {
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return;
  }
  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
}

export async function removeItem(itemId: string) {
  await prisma.cartItem.delete({ where: { id: itemId } });
}

export async function applyCoupon(code: string): Promise<{ ok: boolean; message: string }> {
  const cartId = await getOrCreateCartId();
  const normalized = code.trim().toUpperCase();
  const d = await prisma.discount.findUnique({ where: { code: normalized } });
  if (!d || !d.isActive) return { ok: false, message: "Cupón no válido" };
  await prisma.cart.update({ where: { id: cartId }, data: { couponCode: normalized } });
  return { ok: true, message: "Cupón aplicado" };
}
