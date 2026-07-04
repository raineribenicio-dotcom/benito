import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/session";
import { createSubscription } from "@/lib/core/subscriptions";

// Crear una suscripción (recompra) desde la ficha de producto. Requiere sesión.

export const runtime = "nodejs";

const schema = z.object({
  variantId: z.string().min(1),
  interval: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "BIMONTHLY", "QUARTERLY"]),
  quantity: z.number().int().min(1).max(99).default(1),
});

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inicia sesión para suscribirte", login: true }, { status: 401 });
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

  const sub = await createSubscription({ userId, ...parsed.data });
  return NextResponse.json({ ok: true, id: sub.id, nextOrderAt: sub.nextOrderAt });
}
