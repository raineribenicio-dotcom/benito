import { SearchBox } from "./SearchBox";
import { getCurrentUser } from "@/lib/auth/session";

// Cabecera de la tienda: logo, búsqueda instantánea y accesos. Sticky en móvil.

const NAV = [
  { href: "/catalogo?category=moda", label: "Moda" },
  { href: "/catalogo?category=electronica", label: "Electrónica" },
  { href: "/catalogo?category=hogar", label: "Hogar" },
  { href: "/catalogo?category=belleza", label: "Belleza" },
  { href: "/catalogo?category=salud", label: "Salud" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container flex items-center gap-4 py-3">
        <a href="/" className="text-xl font-bold text-brand-700">
          Benito
        </a>
        <div className="hidden flex-1 sm:block">
          <SearchBox />
        </div>
        <nav className="ml-auto flex items-center gap-4">
          <a href="/wishlist" className="text-sm text-gray-600 hover:text-brand-600" aria-label="Lista de deseos">
            ♡
          </a>
          <a href="/carrito" className="text-sm font-medium text-gray-700 hover:text-brand-600">
            Carrito
          </a>
          <a href="/cuenta" className="text-sm text-gray-600 hover:text-brand-600">
            {user ? (user.name ?? "Cuenta") : "Entrar"}
          </a>
        </nav>
      </div>
      {/* Búsqueda visible en móvil bajo el logo */}
      <div className="container pb-3 sm:hidden">
        <SearchBox />
      </div>
      <nav className="border-t border-gray-100">
        <div className="container flex gap-4 overflow-x-auto py-2 text-sm">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="whitespace-nowrap text-gray-600 hover:text-brand-600">
              {n.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
