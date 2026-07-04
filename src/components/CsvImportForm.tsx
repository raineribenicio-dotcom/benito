"use client";

import { useFormState, useFormStatus } from "react-dom";
import { importProductsAction, type ImportResult } from "@/lib/actions/admin";

const SAMPLE = `title,sku,price,compareat,stock,status,category
Camiseta orgánica,TS-IMP-1,19.95,24.95,50,active,moda
Auriculares Lite,EAR-IMP-1,39.00,,120,active,electronica`;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:bg-gray-300"
    >
      {pending ? "Importando…" : "Importar"}
    </button>
  );
}

export function CsvImportForm() {
  const [state, formAction] = useFormState<ImportResult | null, FormData>(importProductsAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <p className="text-sm text-gray-600">
        Columnas: <code>title, sku, price</code> (obligatorias) y opcionales{" "}
        <code>compareat, stock, status, category, description</code>. Los productos se
        actualizan por SKU (upsert).
      </p>
      <label htmlFor="csv" className="sr-only">CSV</label>
      <textarea
        id="csv"
        name="csv"
        rows={12}
        required
        defaultValue={SAMPLE}
        spellCheck={false}
        className="w-full rounded-lg border border-gray-300 p-3 font-mono text-xs focus:border-brand-500 focus:outline-none"
      />
      <SubmitButton />

      {state && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
          <p className="font-medium text-green-700">
            ✓ {state.created} creados · {state.updated} actualizados
            {state.errors.length > 0 && (
              <span className="text-red-600"> · {state.errors.length} con errores</span>
            )}
          </p>
          {state.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-red-600">
              {state.errors.map((e, i) => (
                <li key={i}>Línea {e.line}: {e.message}</li>
              ))}
            </ul>
          )}
          <a href="/admin/productos" className="mt-3 inline-block text-brand-600 hover:underline">
            Ver productos →
          </a>
        </div>
      )}
    </form>
  );
}
