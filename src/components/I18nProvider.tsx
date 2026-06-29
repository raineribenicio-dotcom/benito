"use client";

import { createContext, useContext } from "react";
import { formatPrice } from "@/lib/core/money";
import type { Currency } from "@/lib/i18n/currency";
import type { Locale } from "@/lib/i18n/config";

// Contexto de preferencias para componentes cliente (precio en la moneda elegida,
// idioma). El servidor lo inicializa desde las cookies en el layout raíz.

type I18nValue = {
  locale: Locale;
  currency: Currency;
  price: (amountBase: number, baseCurrency?: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  currency,
  children,
}: {
  locale: Locale;
  currency: Currency;
  children: React.ReactNode;
}) {
  const value: I18nValue = {
    locale,
    currency,
    price: (amountBase, baseCurrency = "EUR") => formatPrice(amountBase, baseCurrency, currency, locale),
  };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback seguro si se usa fuera del provider (no debería ocurrir)
    return { locale: "es", currency: "EUR", price: (a) => formatPrice(a, "EUR", "EUR", "es") };
  }
  return ctx;
}
