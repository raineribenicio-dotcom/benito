import { prisma } from "@/lib/db/client";
import { paymentProvider } from "@/lib/payments";
import { computeTotals } from "./pricing";
import { computeShipping } from "./shipping";
import { nextOrderDate } from "./subscription-schedule";
import { sendOrderConfirmation } from "./notifications";

// Facturación recurrente de suscripciones. Lo dispara un cron. Para cada
// suscripción vencida: genera un pedido, cobra off-session vía el proveedor
// (stub o Stripe) y avanza nextOrderAt. Reutiliza nuestra canalización de
// pedidos (no depende de la facturación propia de Stripe).

const TAX_RATE = 0.21;

async function nextOrderNumber(): Promise<string> {
  const count = await prisma.order.count();
  return `#${1001 + count}`;
}

export async function processDueSubscriptions(
  now: Date = new Date(),
): Promise<{ charged: number; failed: number; skipped: number }> {
  const due = await prisma.subscription.findMany({
    where: { status: "ACTIVE", nextOrderAt: { lte: now } },
    include: {
      user: { select: { id: true, email: true } },
      variant: {
        include: {
          product: { select: { title: true } },
          stockLevels: true,
        },
      },
    },
    take: 200,
  });

  let charged = 0;
  let failed = 0;
  let skipped = 0;

  for (const sub of due) {
    const available = sub.variant.stockLevels.reduce((s, l) => s + l.available, 0);
    if (available < sub.quantity) {
      skipped++; // sin stock: se reintenta en el siguiente ciclo
      continue;
    }

    const unitPrice = sub.variant.priceAmount;
    const currency = sub.variant.currency;
    const subtotal = unitPrice * sub.quantity;
    const shippingAmount = computeShipping({ subtotal });
    const totals = computeTotals({
      items: [{ unitPrice, quantity: sub.quantity }],
      shippingAmount,
      taxRate: TAX_RATE,
    });

    const number = await nextOrderNumber();

    try {
      const order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            number,
            userId: sub.userId,
            email: sub.user.email,
            status: "PENDING",
            currency,
            subtotal: totals.subtotal,
            discountTotal: totals.discountTotal,
            shippingTotal: totals.shippingTotal,
            taxTotal: totals.taxTotal,
            total: totals.total,
            notes: `Suscripción ${sub.id}`,
            items: {
              create: [
                {
                  variantId: sub.variantId,
                  title: sub.variant.product.title,
                  sku: sub.variant.sku,
                  quantity: sub.quantity,
                  unitPrice,
                  total: subtotal,
                },
              ],
            },
          },
        });
        const level = await tx.stockLevel.findFirst({ where: { variantId: sub.variantId } });
        if (level) {
          await tx.stockLevel.update({
            where: { id: level.id },
            data: { available: { decrement: sub.quantity }, reserved: { increment: sub.quantity } },
          });
        }
        return created;
      });

      const result = await paymentProvider.chargeRecurring({
        amount: totals.total,
        currency,
        orderId: order.id,
        customerEmail: sub.user.email,
      });

      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: "STRIPE",
          providerRef: result.id,
          status: result.status === "succeeded" ? "SUCCEEDED" : "FAILED",
          amount: totals.total,
          currency,
        },
      });

      if (result.status === "succeeded") {
        await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { nextOrderAt: nextOrderDate(sub.interval, now) },
        });
        await sendOrderConfirmation(order.id);
        charged++;
      } else {
        // Cobro fallido: cancela el pedido y devuelve el stock reservado
        await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
        const level = await prisma.stockLevel.findFirst({ where: { variantId: sub.variantId } });
        if (level) {
          await prisma.stockLevel.update({
            where: { id: level.id },
            data: { available: { increment: sub.quantity }, reserved: { decrement: sub.quantity } },
          });
        }
        failed++;
      }
    } catch (err) {
      console.error("[subscriptions] error en", sub.id, (err as Error).message);
      failed++;
    }
  }

  return { charged, failed, skipped };
}
