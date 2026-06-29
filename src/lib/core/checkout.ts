import { prisma } from "@/lib/db/client";
import { paymentProvider } from "@/lib/payments";
import { getActiveCart } from "./cart";
import { getCurrentUserId } from "@/lib/auth/session";

// Conversión de carrito a pedido: snapshot de líneas, reserva de stock, creación
// del pago (proveedor con fallback stub) y marcado del carrito como convertido.
// Todo en una transacción para mantener la integridad.

export type CheckoutContact = {
  email: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  province?: string;
  country: string;
  phone?: string;
};

export type CheckoutResult =
  | { ok: true; orderNumber: string; paymentStatus: string }
  | { ok: false; error: string };

async function nextOrderNumber(): Promise<string> {
  const count = await prisma.order.count();
  return `#${1001 + count}`;
}

export async function createOrderFromCart(contact: CheckoutContact): Promise<CheckoutResult> {
  const cart = await getActiveCart();
  if (!cart || cart.items.length === 0) return { ok: false, error: "El carrito está vacío" };

  // Reverificar stock antes de cobrar
  for (const it of cart.items) {
    if (it.quantity > it.available) {
      return { ok: false, error: `Stock insuficiente para "${it.title}"` };
    }
  }

  const userId = await getCurrentUserId();
  const number = await nextOrderNumber();

  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          number,
          userId: userId ?? undefined,
          email: contact.email,
          status: "PENDING",
          currency: cart.currency,
          subtotal: cart.subtotal,
          discountTotal: cart.discountTotal,
          shippingTotal: cart.shippingTotal,
          taxTotal: cart.taxTotal,
          total: cart.total,
          couponCode: cart.couponCode ?? undefined,
          items: {
            create: cart.items.map((it) => ({
              variantId: it.variantId,
              title: it.title,
              variantTitle: it.variantTitle ?? undefined,
              sku: it.sku,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              total: it.lineTotal,
            })),
          },
        },
      });

      // Reservar stock (decrementa disponible) de forma atómica
      for (const it of cart.items) {
        const level = await tx.stockLevel.findFirst({ where: { variantId: it.variantId } });
        if (level) {
          await tx.stockLevel.update({
            where: { id: level.id },
            data: { available: { decrement: it.quantity }, reserved: { increment: it.quantity } },
          });
        }
      }

      await tx.cart.update({ where: { id: cart.id }, data: { status: "CONVERTED" } });
      return created;
    });

    // Pago (fuera de la transacción de DB). Stub => succeeded.
    const intent = await paymentProvider.createPaymentIntent({
      amount: cart.total,
      currency: cart.currency,
      orderId: order.id,
      customerEmail: contact.email,
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "STRIPE",
        providerRef: intent.id,
        status: intent.status === "succeeded" ? "SUCCEEDED" : "PROCESSING",
        amount: cart.total,
        currency: cart.currency,
      },
    });

    if (intent.status === "succeeded") {
      await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    }

    return { ok: true, orderNumber: number, paymentStatus: intent.status };
  } catch (err) {
    console.error("[checkout] error:", (err as Error).message);
    return { ok: false, error: "No se pudo completar el pedido. Inténtalo de nuevo." };
  }
}
