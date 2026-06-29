import { listCategories } from "@/lib/core/admin";
import { createProductAction } from "@/lib/actions/admin";

const field = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

export default async function NewProduct() {
  const categories = await listCategories();

  return (
    <div className="max-w-2xl">
      <a href="/admin/productos" className="text-sm text-gray-500 hover:text-brand-600">
        ← Productos
      </a>
      <h1 className="mt-2 text-2xl font-bold">Nuevo producto</h1>

      <form action={createProductAction} className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Título</label>
          <input name="title" required className={field} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Descripción</label>
          <textarea name="description" rows={3} className={field} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Categoría</label>
            <select name="categoryId" className={field}>
              <option value="">— Sin categoría —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Estado</label>
            <select name="status" defaultValue="DRAFT" className={field}>
              <option value="DRAFT">Borrador</option>
              <option value="ACTIVE">Activo</option>
              <option value="ARCHIVED">Archivado</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Precio (€)</label>
            <input name="price" type="number" step="0.01" min="0" required className={field} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">SKU</label>
            <input name="sku" required className={field} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Stock</label>
            <input name="stock" type="number" min="0" defaultValue={0} required className={field} />
          </div>
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700">
          Crear producto
        </button>
      </form>
    </div>
  );
}
