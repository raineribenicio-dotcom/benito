import { cookies } from "next/headers";
import { CURRENCY_COOKIE, DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { DEFAULT_CURRENCY, isCurrency, type Currency } from "./currency";
import { getDictionary, type Dictionary } from "./dictionaries";

// Lectura de preferencias del usuario (Server Components) desde cookies.

export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getCurrency(): Currency {
  const value = cookies().get(CURRENCY_COOKIE)?.value;
  return isCurrency(value) ? value : DEFAULT_CURRENCY;
}

export function getI18n(): { locale: Locale; currency: Currency; t: Dictionary } {
  const locale = getLocale();
  return { locale, currency: getCurrency(), t: getDictionary(locale) };
}

export type { Locale, Currency, Dictionary };
