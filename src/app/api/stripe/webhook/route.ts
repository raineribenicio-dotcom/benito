import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/payments/stripe-client";
import { prisma } from "@/lib/db/client";

// Webhook de Stripe. Verifica la FIRMA con STRIPE_WEBHOOK_SECRET sobre el cuerpo
// crudo (imprescindible: nunca confíes en el body sin verificar). Confirma el
// pedido cuando el pago tiene éxito y refleja fallos/reembolsos.

export const runtime = "nodejs";

async function markOrderPaid(paymentIntentId: string, cartId?: string) {
  const payment = await prisma.payment.findFirst({ where: { providerRef: paymentIntentId } });
  if (!payment) return;
  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: "SUCCEEDED" } }),
    prisma.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } }),
  ]);
  // Vacía el carrito solo ahora que el pago está confirmado
  if (cartId) {
    await prisma.cart
      .update({ where: { id: cartId }, data: { status: "CONVERTED" } })
      .catch(() => undefined);
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig ?? "", secret);
  } catch (err) {
    // Firma inválida: posible intento de suplantación. Rechaza.
    return NextResponse.json({ error: `Firma inválida: ${(err as Error).message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await markOrderPaid(pi.id, pi.metadata?.cartId);
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const payment = await prisma.payment.findFirst({ where: { providerRef: pi.id } });
        if (payment) {
          await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        if (typeof charge.payment_intent === "string") {
          const payment = await prisma.payment.findFirst({
            where: { providerRef: charge.payment_intent },
          });
          if (payment) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                refunded: charge.amount_refunded,
                status: charge.amount_refunded >= payment.amount ? "REFUNDED" : "PARTIALLY_REFUNDED",
              },
            });
          }
        }
        break;
      }
      default:
        break; // eventos no manejados: ack 200 para evitar reintentos
    }
  } catch (err) {
    console.error("[stripe webhook] error procesando:", (err as Error).message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
