import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { getActiveCart } from "@/lib/core/cart";
import { confirmOrderPaid } from "@/lib/core/checkout";
import { paypalCaptureOrder } from "@/lib/payments/paypal";

// Captura el pago de PayPal tras la aprobación del cliente y confirma el pedido.
// El pedido a confirmar se resuelve por el Payment (providerRef = id de PayPal),
// no por datos del cliente.

export const runtime = "nodejs";

const schema = z.object({ paypalOrderId: z.string().min(1) });

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 422 });

  const payment = await prisma.payment.findFirst({
    where: { providerRef: parsed.data.paypalOrderId, provider: "PAYPAL" },
    include: { order: { select: { number: true } } },
  });
  if (!payment) return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });

  const result = await paypalCaptureOrder(parsed.data.paypalOrderId);
  if (!result.ok) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return NextResponse.json({ error: "El pago no se completó" }, { status: 402 });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "SUCCEEDED", providerRef: result.captureId ?? parsed.data.paypalOrderId },
  });

  const cart = await getActiveCart();
  await confirmOrderPaid(payment.orderId, cart?.id);

  return NextResponse.json({ ok: true, orderNumber: payment.order.number });
}
