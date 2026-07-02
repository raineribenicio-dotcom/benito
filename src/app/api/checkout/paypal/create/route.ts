import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { createPendingOrder } from "@/lib/core/checkout";
import { paypalCreateOrder } from "@/lib/payments/paypal";

// Crea el pedido PENDING y el pedido de PayPal; devuelve el id de PayPal para
// que el botón del cliente abra la ventana de aprobación.

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  province: z.string().optional(),
  country: z.string().length(2),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 422 });
  }

  const order = await createPendingOrder(parsed.data);
  if (!order.ok) return NextResponse.json({ error: order.error }, { status: 409 });

  try {
    const pp = await paypalCreateOrder({
      amount: order.total,
      currency: order.currency,
      orderId: order.orderId,
    });
    await prisma.payment.create({
      data: {
        orderId: order.orderId,
        provider: "PAYPAL",
        providerRef: pp.id,
        status: "PROCESSING",
        amount: order.total,
        currency: order.currency,
      },
    });
    return NextResponse.json({ paypalOrderId: pp.id, orderNumber: order.number });
  } catch (err) {
    console.error("[paypal create]", (err as Error).message);
    return NextResponse.json({ error: "No se pudo iniciar PayPal" }, { status: 502 });
  }
}
