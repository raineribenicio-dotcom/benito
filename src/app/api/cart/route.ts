import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Añadir al carrito. Hito 2: valida la entrada y responde OK para habilitar el
// flujo de UI. La persistencia (Cart/CartItem, cookie de invitado, merge al
// iniciar sesión) se implementa en M3.

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

  // TODO(M3): resolver carrito por cookie/usuario, validar stock, persistir item.
  return NextResponse.json({ ok: true, item: parsed.data }, { status: 200 });
}
