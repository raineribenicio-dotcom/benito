import type { Metadata } from "next";
import "./globals.css";
import { getI18n } from "@/lib/i18n";
import { I18nProvider } from "@/components/I18nProvider";

export const metadata: Metadata = {
  title: {
    default: "Nuvora — Tu tienda multi-categoría",
    template: "%s · Nuvora",
  },
  description:
    "Moda, electrónica, hogar, belleza y salud. Envío rápido, pago seguro y la mejor experiencia de compra móvil.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "Nuvora",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, currency } = getI18n();
  return (
    <html lang={locale}>
      <body>
        <I18nProvider locale={locale} currency={currency}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
