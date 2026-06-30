import { listAdminProducts } from "@/lib/core/admin";
import { formatMoney } from "@/lib/core/money";
import { updateProductStatusAction } from "@/lib/actions/admin";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  ARCHIVED: "Archivado",
};

export default async function AdminProducts({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const products = await listAdminProducts(searchParams.q);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <div className="flex gap-2">
          <a href="/admin/productos/importar" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50">
            Importar CSV
          </a>
          <a href="/admin/productos/nuevo" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            + Nuevo producto
          </a>
        </div>
      </div>

      <form method="get" className="mt-4">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Buscar por título…"
          className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </form>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 text-left text-gray-500">
            <tr>
              <th className="p-3">Producto</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No hay productos. Crea uno o ejecuta <code>pnpm db:seed</code>.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const price = p.variants[0]?.priceAmount ?? 0;
                const stock = p.variants.reduce(
                  (s, v) => s + v.stockLevels.reduce((a, l) => a + l.available, 0),
                  0,
                );
                return (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0">
                    <td className="p-3 font-medium">{p.title}</td>
                    <td className="p-3 text-gray-500">
                      {p.categories.map((c) => c.category.name).join(", ") || "—"}
                    </td>
                    <td className="p-3">{formatMoney(price, p.variants[0]?.currency ?? "EUR")}</td>
                    <td className="p-3">{stock}</td>
                    <td className="p-3">
                      <form action={updateProductStatusAction} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={p.id} />
                        <select
                          name="status"
                          defaultValue={p.status}
                          className="rounded border border-gray-300 px-2 py-1 text-xs"
                        >
                          {Object.entries(STATUS_LABEL).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                        <button type="submit" className="text-xs text-brand-600 hover:underline">
                          Guardar
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
