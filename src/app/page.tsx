import { getHomeData } from "@/lib/core/storefront";
import { getI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductCard } from "@/components/ProductCard";

// Home dinámica (Server Component): hero, barra de confianza, colecciones,
// novedades y más vendidos. Tolerante a fallos si aún no hay base de datos.

export const revalidate = 60; // ISR: refresca cada minuto

const TRUST = [
  { icon: "🚚", title: "Envío 24/48h", text: "Gratis desde 49 €" },
  { icon: "↩️", title: "Devoluciones", text: "30 días sin preguntas" },
  { icon: "🔒", title: "Pago seguro", text: "Stripe · PayPal · PCI" },
  { icon: "⭐", title: "Miles de reseñas", text: "Clientes verificados" },
];

export default async function HomePage() {
  const { featuredCollections, bestSellers, newArrivals } = await getHomeData();
  const { t } = getI18n();

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        {/* Hero — mobile-first */}
        <section className="bg-brand-900 text-white">
          <div className="container py-16 sm:py-24">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-100">
              {t.home.heroKicker}
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
              {t.home.heroTitle}
            </h1>
            <p className="mt-4 max-w-xl text-brand-100">{t.home.heroSubtitle}</p>
            <a
              href="/catalogo"
              className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-brand-900 transition hover:bg-brand-50"
            >
              {t.home.explore}
            </a>
          </div>
        </section>

        {/* Barra de confianza (CRO) */}
        <section className="border-b border-gray-100 bg-gray-50">
          <div className="container grid grid-cols-2 gap-4 py-6 sm:grid-cols-4">
            {TRUST.map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                <span>
                  <span className="block text-sm font-semibold">{item.title}</span>
                  <span className="block text-xs text-gray-500">{item.text}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Colecciones destacadas */}
        {featuredCollections.length > 0 && (
          <section className="container py-12">
            <h2 className="text-2xl font-bold">{t.home.featured}</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featuredCollections.map((c) => (
                <a
                  key={c.id}
                  href={`/coleccion/${c.slug}`}
                  className="group flex items-center justify-center rounded-xl border border-gray-200 p-6 text-center transition hover:border-brand-500 hover:shadow-md"
                >
                  <span className="font-semibold group-hover:text-brand-600">{c.title}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Novedades */}
        {newArrivals.length > 0 && (
          <section className="container py-12">
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold">{t.home.newArrivals}</h2>
              <a href="/catalogo?sort=newest" className="text-sm text-brand-600 hover:underline">
                Ver todo
              </a>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {newArrivals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Más vendidos */}
        <section className="container py-12">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-bold">{t.home.bestSellers}</h2>
            <a href="/catalogo?sort=rating" className="text-sm text-brand-600 hover:underline">
              Ver todo
            </a>
          </div>
          {bestSellers.length === 0 ? (
            <p className="mt-4 text-gray-500">
              Aún no hay productos. Ejecuta{" "}
              <code className="rounded bg-gray-100 px-1">pnpm db:seed</code> para cargar el catálogo de
              ejemplo.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {bestSellers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
