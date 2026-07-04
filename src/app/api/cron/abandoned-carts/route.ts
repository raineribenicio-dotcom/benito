import { NextRequest, NextResponse } from "next/server";
import { processAbandonedCarts } from "@/lib/core/abandoned-carts";

// Cron de recuperación de carrito abandonado. Protegido por CRON_SECRET (Vercel
// Cron envía el header Authorization: Bearer <CRON_SECRET>). Programación en
// vercel.json. Sin secreto configurado, el endpoint queda deshabilitado.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Cron no configurado" }, { status: 503 });
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await processAbandonedCarts();
  return NextResponse.json({ ok: true, ...result });
}
