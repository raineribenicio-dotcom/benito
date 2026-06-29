import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { LOCALE_COOKIE, CURRENCY_COOKIE, LOCALES } from "@/lib/i18n/config";
import { CURRENCIES } from "@/lib/i18n/currency";

// Fija las cookies de idioma/moneda. El switcher (cliente) hace POST y recarga.

export const runtime = "nodejs";

const schema = z.object({
  locale: z.enum(LOCALES).optional(),
  currency: z.enum(CURRENCIES).optional(),
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

  const res = NextResponse.json({ ok: true });
  const opts = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" as const };
  if (parsed.data.locale) res.cookies.set(LOCALE_COOKIE, parsed.data.locale, opts);
  if (parsed.data.currency) res.cookies.set(CURRENCY_COOKIE, parsed.data.currency, opts);
  return res;
}
