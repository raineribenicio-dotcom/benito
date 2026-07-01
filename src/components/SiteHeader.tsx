import { SearchBox } from "./SearchBox";
import { PreferenceSwitcher } from "./PreferenceSwitcher";
import { getCurrentUser } from "@/lib/auth/session";
import { getI18n } from "@/lib/i18n";

// Cabecera de la tienda: logo, búsqueda, selector de idioma/moneda y accesos.

export async function SiteHeader() {
  const user = await getCurrentUser();
  const { t } = getI18n();

  const nav = [
    { href: "/catalogo?category=moda", label: t.nav.fashion },
    { href: "/catalogo?category=electronica", label: t.nav.electronics },
    { href: "/catalogo?category=hogar", label: t.nav.home },
    { href: "/catalogo?category=belleza", label: t.nav.beauty },
    { href: "/catalogo?category=salud", label: t.nav.health },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container flex items-center gap-4 py-3">
        <a href="/" className="text-xl font-bold text-brand-700">
          Nuvora
        </a>
        <div className="hidden flex-1 sm:block">
          <SearchBox placeholder={t.header.search} />
        </div>
        <nav className="ml-auto flex items-center gap-4">
          <PreferenceSwitcher />
          <a href="/wishlist" className="text-sm text-gray-600 hover:text-brand-600" aria-label={t.header.wishlist}>
            ♡
          </a>
          <a href="/carrito" className="text-sm font-medium text-gray-700 hover:text-brand-600">
            {t.header.cart}
          </a>
          <a href="/cuenta" className="text-sm text-gray-600 hover:text-brand-600">
            {user ? (user.name ?? t.header.account) : t.header.signIn}
          </a>
        </nav>
      </div>
      {/* Búsqueda visible en móvil bajo el logo */}
      <div className="container pb-3 sm:hidden">
        <SearchBox placeholder={t.header.search} />
      </div>
      <nav className="border-t border-gray-100">
        <div className="container flex gap-4 overflow-x-auto py-2 text-sm">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="whitespace-nowrap text-gray-600 hover:text-brand-600">
              {n.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
