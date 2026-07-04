import { notFound } from "next/navigation";
import { getAdminOrder } from "@/lib/core/admin";
import { formatMoney } from "@/lib/core/money";
import { updateOrderStatusAction, refundOrderAction } from "@/lib/actions/admin";

const STATUSES = ["PENDING", "PAID", "FULFILLING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export default async function AdminOrderDetail({ params }: { params: { id: string } }) {
  const order = await getAdminOrder(params.id);
  if (!order) notFound();

  const refundedTotal = order.payments.reduce((s, p) => s + p.refunded, 0);

  return (
    <div className="max-w-3xl">
      <a href="/admin/pedidos" className="text-sm text-gray-500 hover:text-brand-600">← Pedidos</a>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedido {order.number}</h1>
        <span className="text-sm text-gray-500">{order.createdAt.toLocaleString("es-ES")}</span>
      </div>
      <p className="mt-1 text-gray-600">{order.email}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Líneas */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="font-semibold">Líneas</h2>
          <ul className="mt-3 divide-y divide-gray-100">
            {order.items.map((it) => (
              <li key={it.id} className="flex justify-between py-2 text-sm">
                <span>
                  {it.quantity}× {it.title}
                  {it.variantTitle ? ` · ${it.variantTitle}` : ""}
                  <span className="block text-xs text-gray-400">{it.sku}</span>
                </span>
                <span className="font-medium">{formatMoney(it.total, order.currency)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 border-t border-gray-100 pt-3 text-sm">
            <div className="flex justify-between py-0.5"><dt className="text-gray-500">Subtotal</dt><dd>{formatMoney(order.subtotal, order.currency)}</dd></div>
            <div className="flex justify-between py-0.5"><dt className="text-gray-500">Descuento</dt><dd>-{formatMoney(order.discountTotal, order.currency)}</dd></div>
            <div className="flex justify-between py-0.5"><dt className="text-gray-500">Envío</dt><dd>{formatMoney(order.shippingTotal, order.currency)}</dd></div>
            <div className="flex justify-between py-0.5"><dt className="text-gray-500">Impuestos</dt><dd>{formatMoney(order.taxTotal, order.currency)}</dd></div>
            <div className="flex justify-between border-t border-gray-100 pt-2 font-bold"><dt>Total</dt><dd>{formatMoney(order.total, order.currency)}</dd></div>
            {refundedTotal > 0 && (
              <div className="flex justify-between py-0.5 text-purple-700"><dt>Reembolsado</dt><dd>-{formatMoney(refundedTotal, order.currency)}</dd></div>
            )}
          </dl>
        </div>

        {/* Acciones */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="font-semibold">Estado</h2>
            <form action={updateOrderStatusAction} className="mt-3 flex gap-2">
              <input type="hidden" name="id" value={order.id} />
              <select name="status" defaultValue={order.status} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                Actualizar
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="font-semibold">Reembolso parcial</h2>
            <form action={refundOrderAction} className="mt-3 flex gap-2">
              <input type="hidden" name="id" value={order.id} />
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                max={(order.total / 100).toFixed(2)}
                placeholder="Importe (€)"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <button type="submit" className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
                Reembolsar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
