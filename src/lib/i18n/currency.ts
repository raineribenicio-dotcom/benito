// Conversión de moneda (pura, testeable). Tasas estáticas con EUR como base:
// en producción se sustituyen por una fuente FX real (BCE, exchangerate API) o,
// preferiblemente, por precios fijados por moneda en VariantPrice.

export const CURRENCIES = ["EUR", "USD", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: Currency = "EUR";

// Unidades de cada moneda por 1 EUR.
const RATES: Record<Currency, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.85,
};

export function isCurrency(value: string | undefined | null): value is Currency {
  return !!value && (CURRENCIES as readonly string[]).includes(value);
}

/** Convierte un importe en céntimos de una moneda a otra, redondeando a céntimos. */
export function convert(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  const inEur = amount / RATES[from];
  return Math.round(inEur * RATES[to]);
}
