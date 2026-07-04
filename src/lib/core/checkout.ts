import { prisma } from "@/lib/db/client";
import { paymentProvider } from "@/lib/payments";
import { getActiveCart } from "./cart";
import { getCurrentUserId } from "@/lib/auth/session";
import { sendOrderConfirmation } from "./notifications";

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
  | { ok: true; orderNumber: string; orderToken: string; paymentStatus: string; clientSecret: string }
  | { ok: false; error: string };

async function nextOrderNumber(): Promise<string> {
  const count = await prisma.order.count();
  return `#${1001 + count}`;
}

/**
 * Crea el pedido PENDING desde el carrito: snapshot de líneas, reserva de stock y
 * guarda el email en el carrito. NO cobra ni convierte el carrito — eso lo hace
 * cada proveedor de pago. Reutilizado por Stripe, PayPal y el stub.
 */
export async function createPendingOrder(
  contact: CheckoutContact,
): Promise<
  | { ok: true; orderId: string; number: string; token: string; total: number; currency: string; cartId: string }
  | { ok: false; error: string }
> {
  const cart = await getActiveCart();
  if (!cart || cart.items.length === 0) return { ok: false, error: "El carrito está vacío" };

  for (const it of cart.items) {
    if (it.quantity > it.available) {
      return { ok: false, error: `Stock insuficiente para "${it.title}"` };
    }
  }

  const userId = await getCurrentUserId();
  const number = await nextOrderNumber();

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

    for (const it of cart.items) {
      const level = await tx.stockLevel.findFirst({ where: { variantId: it.variantId } });
      if (level) {
        await tx.stockLevel.update({
          where: { id: level.id },
          data: { available: { decrement: it.quantity }, reserved: { increment: it.quantity } },
        });
      }
    }
    return created;
  });

  await prisma.cart.update({ where: { id: cart.id }, data: { email: contact.email } });

  return {
    ok: true,
    orderId: order.id,
    number,
    token: order.token,
    total: cart.total,
    currency: cart.currency,
    cartId: cart.id,
  };
}

/** Marca un pedido como pagado, convierte el carrito y envía la confirmación. */
export async function confirmOrderPaid(orderId: string, cartId?: string): Promise<void> {
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } }),
    ...(cartId ? [prisma.cart.update({ where: { id: cartId }, data: { status: "CONVERTED" } })] : []),
  ]);
  await sendOrderConfirmation(orderId);
}

export async function createOrderFromCart(contact: CheckoutContact): Promise<CheckoutResult> {
  const pending = await createPendingOrder(contact);
  if (!pending.ok) return { ok: false, error: pending.error };

  try {
    // Pago (fuera de la transacción de DB). Stub => succeeded.
    const intent = await paymentProvider.createPaymentIntent({
      amount: pending.total,
      currency: pending.currency,
      orderId: pending.orderId,
      customerEmail: contact.email,
      metadata: { cartId: pending.cartId },
    });

    await prisma.payment.create({
      data: {
        orderId: pending.orderId,
        provider: "STRIPE",
        providerRef: intent.id,
        status: intent.status === "succeeded" ? "SUCCEEDED" : "PROCESSING",
        amount: pending.total,
        currency: pending.currency,
      },
    });

    // Stub: el pago se confirma al instante => PAID + carrito convertido +
    // email. Stripe real: queda PENDING; lo confirma el webhook tras el pago.
    if (intent.status === "succeeded") {
      await confirmOrderPaid(pending.orderId, pending.cartId);
    }

    return {
      ok: true,
      orderNumber: pending.number,
      orderToken: pending.token,
      paymentStatus: intent.status,
      clientSecret: intent.clientSecret,
    };
  } catch (err) {
    console.error("[checkout] error:", (err as Error).message);
    return { ok: false, error: "No se pudo completar el pedido. Inténtalo de nuevo." };
  }
}
