import type { CatalogFilters } from "@/lib/core/catalog";

type Facets = {
  categories: { id: string; slug: string; name: string }[];
  brands: { id: string; slug: string; name: string }[];
};

// Filtros del catálogo como formulario GET (sin JS): accesible, indexable y
// con URLs compartibles. Cada cambio recarga con los searchParams actualizados.

function buildHref(current: CatalogFilters, patch: Partial<CatalogFilters>): string {
  const params = new URLSearchParams();
  const merged = { ...current, ...patch, page: 1 };
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined && v !== null && v !== "" && k !== "perPage") params.set(k, String(v));
  }
  return `/catalogo?${params.toString()}`;
}

export function CatalogFilters({
  facets,
  active,
}: {
  facets: Facets;
  active: CatalogFilters;
}) {
  return (
    <aside className="space-y-6 text-sm">
      <div>
        <h3 className="mb-2 font-semibold">Categorías</h3>
        <ul className="space-y-1">
          <li>
            <a
              href={buildHref(active, { category: undefined })}
              className={!active.category ? "font-semibold text-brand-700" : "text-gray-600 hover:text-brand-600"}
            >
              Todas
            </a>
          </li>
          {facets.categories.map((c) => (
            <li key={c.id}>
              <a
                href={buildHref(active, { category: c.slug })}
                className={active.category === c.slug ? "font-semibold text-brand-700" : "text-gray-600 hover:text-brand-600"}
              >
                {c.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {facets.brands.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold">Marca</h3>
          <ul className="space-y-1">
            {facets.brands.map((b) => (
              <li key={b.id}>
                <a
                  href={buildHref(active, { brand: b.slug })}
                  className={active.brand === b.slug ? "font-semibold text-brand-700" : "text-gray-600 hover:text-brand-600"}
                >
                  {b.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="mb-2 font-semibold">Valoración</h3>
        <ul className="space-y-1">
          {[4, 3, 2].map((r) => (
            <li key={r}>
              <a
                href={buildHref(active, { minRating: r })}
                className={active.minRating === r ? "font-semibold text-brand-700" : "text-gray-600 hover:text-brand-600"}
              >
                {r}★ o más
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 font-semibold">Disponibilidad</h3>
        <a
          href={buildHref(active, { inStock: active.inStock ? undefined : true })}
          className={active.inStock ? "font-semibold text-brand-700" : "text-gray-600 hover:text-brand-600"}
        >
          {active.inStock ? "✓ " : ""}Solo en stock
        </a>
      </div>
    </aside>
  );
}
