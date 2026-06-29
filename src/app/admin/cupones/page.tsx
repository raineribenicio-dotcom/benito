import { listCoupons } from "@/lib/core/admin";
import { formatMoney } from "@/lib/core/money";
import { createCouponAction } from "@/lib/actions/admin";

const field = "rounded-lg border border-gray-300 px-3 py-2 text-sm";

export default async function AdminCoupons() {
  const coupons = await listCoupons();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Cupones</h1>

      <form action={createCouponAction} className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-medium">Código</label>
          <input name="code" required placeholder="VERANO20" className={field} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Tipo</label>
          <select name="type" className={field}>
            <option value="PERCENTAGE">Porcentaje (%)</option>
            <option value="FIXED_AMOUNT">Importe fijo (€)</option>
            <option value="FREE_SHIPPING">Envío gratis</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Valor</label>
          <input name="value" type="number" step="0.01" min="0" defaultValue={0} className={field} />
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Crear cupón
        </button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 text-left text-gray-500">
            <tr>
              <th className="p-3">Código</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Usos</th>
              <th className="p-3">Activo</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">No hay cupones.</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 last:border-0">
                  <td className="p-3 font-mono font-medium">{c.code}</td>
                  <td className="p-3">{c.type}</td>
                  <td className="p-3">
                    {c.type === "PERCENTAGE" ? `${c.value}%` : c.type === "FIXED_AMOUNT" ? formatMoney(c.value) : "—"}
                  </td>
                  <td className="p-3">{c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                  <td className="p-3">{c.isActive ? "✓" : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
