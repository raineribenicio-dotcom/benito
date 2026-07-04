import { CsvImportForm } from "@/components/CsvImportForm";

export default function ImportProductsPage() {
  return (
    <div className="max-w-2xl">
      <a href="/admin/productos" className="text-sm text-gray-500 hover:text-brand-600">
        ← Productos
      </a>
      <h1 className="mt-2 text-2xl font-bold">Importar productos (CSV)</h1>
      <p className="mt-1 text-gray-500">
        Pega tu CSV o el ejemplo de abajo. Útil para cargar catálogo en masa.
      </p>
      <div className="mt-6">
        <CsvImportForm />
      </div>
    </div>
  );
}
