// Conversión de moneda (pura, testeable). Tasas estáticas con EUR como base:
// en producción se sustituyen por una fuente FX real (BCE, exchangerate API) o,
// preferiblemente, por precios fijados por moneda en VariantPrice.

export const CURRENCIES = ["ARS", "USD", "EUR", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

// Moneda por defecto de la tienda (Argentina).
export const DEFAULT_CURRENCY: Currency = "ARS";

// Unidades de cada moneda por 1 EUR. ARS es la moneda nativa de los precios; la
// tasa solo se usa si el cliente cambia de moneda en el selector (aproximada,
// actualízala con una fuente FX real en producción).
const RATES: Record<Currency, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.85,
  ARS: 1300,
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
