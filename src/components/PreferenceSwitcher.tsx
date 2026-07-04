"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "./I18nProvider";
import { CURRENCIES } from "@/lib/i18n/currency";
import { LOCALES } from "@/lib/i18n/config";

// Selector de idioma y moneda. Persiste la preferencia (cookie) y refresca el
// render del servidor para reflejar precios e idioma.

const LOCALE_LABEL: Record<string, string> = { es: "ES", en: "EN" };

export function PreferenceSwitcher() {
  const { locale, currency } = useI18n();
  const router = useRouter();

  async function update(patch: { locale?: string; currency?: string }) {
    await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor="pref-locale" className="sr-only">Idioma</label>
      <select
        id="pref-locale"
        value={locale}
        onChange={(e) => update({ locale: e.target.value })}
        className="rounded border border-gray-300 bg-white px-1.5 py-1 text-xs"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>{LOCALE_LABEL[l] ?? l.toUpperCase()}</option>
        ))}
      </select>
      <label htmlFor="pref-currency" className="sr-only">Moneda</label>
      <select
        id="pref-currency"
        value={currency}
        onChange={(e) => update({ currency: e.target.value })}
        className="rounded border border-gray-300 bg-white px-1.5 py-1 text-xs"
      >
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
