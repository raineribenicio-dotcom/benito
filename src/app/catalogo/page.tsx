import type { Metadata } from "next";
import { getCatalog, getFilterFacets, type CatalogFilters } from "@/lib/core/catalog";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters as Filters } from "@/components/CatalogFilters";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora moda, electrónica, hogar, belleza y salud. Filtra por precio, marca y valoración.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function parseFilters(sp: SearchParams): CatalogFilters {
  const num = (v: string | string[] | undefined) =>
    v && !Array.isArray(v) ? Number(v) : undefined;
  return {
    category: typeof sp.category === "string" ? sp.category : undefined,
    brand: typeof sp.brand === "string" ? sp.brand : undefined,
    minPrice: num(sp.minPrice),
    maxPrice: num(sp.maxPrice),
    minRating: num(sp.minRating),
    inStock: sp.inStock === "true",
    sort: (typeof sp.sort === "string" ? sp.sort : "relevance") as CatalogFilters["sort"],
    page: num(sp.page) ?? 1,
  };
}

const SORTS: { value: string; label: string }[] = [
  { value: "relevance", label: "Relevancia" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "newest", label: "Novedades" },
  { value: "rating", label: "Mejor valorados" },
];

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = parseFilters(searchParams);
  const [{ products, total, page, pages }, facets] = await Promise.all([
    getCatalog(filters),
    getFilterFacets(),
  ]);

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (typeof v === "string" && k !== "page") params.set(k, v);
    }
    params.set("page", String(p));
    return `/catalogo?${params.toString()}`;
  };

  return (
    <>
      <SiteHeader />
      <main className="container py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Catálogo</h1>
          <form method="get" className="text-sm">
            {/* Conserva filtros activos al cambiar el orden */}
            {Object.entries(searchParams).map(([k, v]) =>
              typeof v === "string" && k !== "sort" ? (
                <input key={k} type="hidden" name={k} value={v} />
              ) : null,
            )}
            <label htmlFor="sort" className="sr-only">
              Ordenar
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={filters.sort}
              className="rounded-lg border border-gray-300 px-3 py-1.5"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <noscript>
              <button type="submit" className="ml-2 rounded bg-brand-600 px-2 py-1 text-white">
                Aplicar
              </button>
            </noscript>
          </form>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
          <Filters facets={facets} active={filters} />

          <div>
            <p className="mb-4 text-sm text-gray-500">{total} productos</p>
            {products.length === 0 ? (
              <p className="text-gray-500">
                No hay productos para estos filtros. Ejecuta <code>pnpm db:seed</code> para cargar
                el catálogo de ejemplo.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {pages > 1 && (
              <nav className="mt-8 flex justify-center gap-1" aria-label="Paginación">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={pageHref(p)}
                    aria-current={p === page ? "page" : undefined}
                    className={`rounded-lg px-3 py-1.5 text-sm ${
                      p === page ? "bg-brand-600 text-white" : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
