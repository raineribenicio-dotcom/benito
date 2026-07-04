import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/session";
import { toggleWishlist } from "@/lib/core/wishlist";

// Alterna una variante en la lista de deseos. Requiere sesión.

export const runtime = "nodejs";

const schema = z.object({ variantId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inicia sesión", login: true }, { status: 401 });
  }

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

  const result = await toggleWishlist(userId, parsed.data.variantId);
  return NextResponse.json({ ok: true, ...result });
}
