import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addItem, getActiveCart } from "@/lib/core/cart";

// Carrito: añadir item (POST) y consultar (GET). Persistente por cookie de
// invitado o usuario autenticado. Validación con Zod.

export const runtime = "nodejs";

const bodySchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    await addItem(parsed.data.variantId, parsed.data.quantity);
    const cart = await getActiveCart();
    return NextResponse.json({ ok: true, itemCount: cart?.itemCount ?? 0 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 409 });
  }
}

export async function GET() {
  const cart = await getActiveCart();
  return NextResponse.json({ cart });
}
