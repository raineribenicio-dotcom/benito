import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Benito — Tu tienda multi-categoría",
    template: "%s · Benito",
  },
  description:
    "Moda, electrónica, hogar, belleza y salud. Envío rápido, pago seguro y la mejor experiencia de compra móvil.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "Benito",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
