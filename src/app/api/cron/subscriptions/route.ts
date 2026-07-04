import { NextRequest, NextResponse } from "next/server";
import { processDueSubscriptions } from "@/lib/core/subscription-billing";

// Cron de facturación recurrente de suscripciones. Protegido por CRON_SECRET
// (Vercel Cron envía Authorization: Bearer <CRON_SECRET>). Programación diaria
// en vercel.json. Sin secreto configurado, queda deshabilitado.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Cron no configurado" }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await processDueSubscriptions();
  return NextResponse.json({ ok: true, ...result });
}
