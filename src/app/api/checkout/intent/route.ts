import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrderFromCart } from "@/lib/core/checkout";

// Crea el pedido (PENDING) y el PaymentIntent para el carrito actual; devuelve el
// clientSecret para que el cliente confirme el pago con Stripe Elements.

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
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const result = await createOrderFromCart(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json({
    orderNumber: result.orderNumber,
    clientSecret: result.clientSecret,
    paymentStatus: result.paymentStatus,
  });
}
