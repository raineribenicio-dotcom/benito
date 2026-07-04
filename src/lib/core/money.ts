// Dinero en céntimos (enteros) para evitar errores de coma flotante.
// Toda la app maneja importes como `number` en minor units + un ISO currency.

import { convert, isCurrency } from "@/lib/i18n/currency";

export type Money = { amount: number; currency: string };

const LOCALE_BY_CURRENCY: Record<string, string> = {
  ARS: "es-AR",
  EUR: "es-ES",
  USD: "en-US",
  GBP: "en-GB",
};

export function formatMoney(amount: number, currency = "EUR", locale?: string): string {
  return new Intl.NumberFormat(locale ?? LOCALE_BY_CURRENCY[currency] ?? "es-ES", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

export function addMoney(a: number, b: number): number {
  return a + b;
}

/**
 * Formatea un importe almacenado en `baseCurrency` (céntimos) mostrándolo en
 * `target`, convirtiendo con las tasas estáticas. Es la función de display que
 * usan tienda y checkout para multi-moneda.
 */
export function formatPrice(
  amountBase: number,
  baseCurrency: string,
  target: string,
  locale?: string,
): string {
  const from = isCurrency(baseCurrency) ? baseCurrency : "EUR";
  const to = isCurrency(target) ? target : from;
  return formatMoney(convert(amountBase, from, to), to, locale);
}

/** Aplica un porcentaje (0-100) y redondea a céntimos. */
export function applyPercentage(amount: number, percentage: number): number {
  return Math.round((amount * percentage) / 100);
}
