import type { Locale } from "./config";

// Diccionarios de strings de la UI (chrome). El contenido de catálogo se traduce
// vía ProductTranslation/CategoryTranslation en la base de datos.

export type Dictionary = {
  nav: { fashion: string; electronics: string; home: string; beauty: string; health: string };
  header: { search: string; cart: string; account: string; signIn: string; wishlist: string };
  home: { heroKicker: string; heroTitle: string; heroSubtitle: string; explore: string; featured: string; bestSellers: string };
  product: { addToCart: string; outOfStock: string; subscribe: string; reviews: string; specs: string };
  cart: { title: string; empty: string; checkout: string; subtotal: string; shipping: string; tax: string; total: string; free: string };
};

const es: Dictionary = {
  nav: { fashion: "Moda", electronics: "Electrónica", home: "Hogar", beauty: "Belleza", health: "Salud" },
  header: { search: "Buscar productos…", cart: "Carrito", account: "Cuenta", signIn: "Entrar", wishlist: "Lista de deseos" },
  home: {
    heroKicker: "Multi-categoría · Envío 24/48h",
    heroTitle: "Todo lo que buscas, en una sola tienda",
    heroSubtitle: "Moda, electrónica, hogar, belleza y salud. La mejor experiencia de compra, optimizada para tu móvil.",
    explore: "Explorar catálogo",
    featured: "Colecciones destacadas",
    bestSellers: "Más vendidos",
  },
  product: { addToCart: "Añadir al carrito", outOfStock: "Agotado", subscribe: "Suscribirme", reviews: "Reseñas", specs: "Ficha técnica" },
  cart: { title: "Carrito", empty: "Tu carrito está vacío", checkout: "Finalizar compra", subtotal: "Subtotal", shipping: "Envío", tax: "Impuestos (IVA inc.)", total: "Total", free: "Gratis" },
};

const en: Dictionary = {
  nav: { fashion: "Fashion", electronics: "Electronics", home: "Home", beauty: "Beauty", health: "Health" },
  header: { search: "Search products…", cart: "Cart", account: "Account", signIn: "Sign in", wishlist: "Wishlist" },
  home: {
    heroKicker: "Multi-category · 24/48h shipping",
    heroTitle: "Everything you need, in one store",
    heroSubtitle: "Fashion, electronics, home, beauty and health. The best shopping experience, optimized for mobile.",
    explore: "Browse catalog",
    featured: "Featured collections",
    bestSellers: "Best sellers",
  },
  product: { addToCart: "Add to cart", outOfStock: "Out of stock", subscribe: "Subscribe", reviews: "Reviews", specs: "Specifications" },
  cart: { title: "Cart", empty: "Your cart is empty", checkout: "Checkout", subtotal: "Subtotal", shipping: "Shipping", tax: "Tax (incl. VAT)", total: "Total", free: "Free" },
};

const DICTIONARIES: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? es;
}
