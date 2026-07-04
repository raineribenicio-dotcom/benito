// Configuración de internacionalización (sin routing por segmento: la
// preferencia vive en cookies). Idioma para la UI; moneda para los precios.

export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

export const LOCALE_COOKIE = "locale";
export const CURRENCY_COOKIE = "currency";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
