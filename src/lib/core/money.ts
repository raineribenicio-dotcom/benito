// Dinero en céntimos (enteros) para evitar errores de coma flotante.
// Toda la app maneja importes como `number` en minor units + un ISO currency.

export type Money = { amount: number; currency: string };

const LOCALE_BY_CURRENCY: Record<string, string> = {
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

/** Aplica un porcentaje (0-100) y redondea a céntimos. */
export function applyPercentage(amount: number, percentage: number): number {
  return Math.round((amount * percentage) / 100);
}
