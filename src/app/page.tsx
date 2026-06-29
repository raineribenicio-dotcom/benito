import { formatMoney } from "@/lib/core/money";
import { getHomeData } from "@/lib/core/storefront";
import { SiteHeader } from "@/components/SiteHeader";

// Home dinámica (Server Component). Lee colecciones destacadas y más vendidos.
// Tolerante a fallos: si aún no hay base de datos, renderiza el esqueleto.

export const revalidate = 60; // ISR: refresca cada minuto

export default async function HomePage() {
  const { featuredCollections, bestSellers } = await getHomeData();

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
      {/* Hero — mobile-first */}
      <section className="bg-brand-900 text-white">
        <div className="container py-16 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-wide text-brand-100">
            Multi-categoría · Envío 24/48h
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
            Todo lo que buscas, en una sola tienda
          </h1>
          <p className="mt-4 max-w-xl text-brand-100">
            Moda, electrónica, hogar, belleza y salud. La mejor experiencia de compra,
            optimizada para tu móvil.
          </p>
          <a
            href="/catalogo"
            className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-brand-900 transition hover:bg-brand-50"
          >
            Explorar catálogo
          </a>
        </div>
      </section>

      {/* Colecciones destacadas */}
      {featuredCollections.length > 0 && (
        <section className="container py-12">
          <h2 className="text-2xl font-bold">Colecciones destacadas</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredCollections.map((c) => (
              <a
                key={c.id}
                href={`/coleccion/${c.slug}`}
                className="group rounded-xl border border-gray-200 p-4 transition hover:border-brand-500 hover:shadow-md"
              >
                <span className="font-semibold group-hover:text-brand-600">{c.title}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Más vendidos */}
      <section className="container py-12">
        <h2 className="text-2xl font-bold">Más vendidos</h2>
        {bestSellers.length === 0 ? (
          <p className="mt-4 text-gray-500">
            Aún no hay productos. Ejecuta <code className="rounded bg-gray-100 px-1">pnpm db:seed</code>{" "}
            para cargar el catálogo de ejemplo.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {bestSellers.map((p) => (
              <a key={p.id} href={`/producto/${p.slug}`} className="group block">
                <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <h3 className="mt-2 line-clamp-1 text-sm font-medium">{p.title}</h3>
                <p className="text-sm font-semibold text-brand-700">
                  {formatMoney(p.price, p.currency)}
                </p>
              </a>
            ))}
          </div>
        )}
      </section>
      </main>
    </>
  );
}
