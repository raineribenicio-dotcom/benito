import { listAdminOrders } from "@/lib/core/admin";
import { formatMoney } from "@/lib/core/money";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  PAID: "bg-blue-50 text-blue-700",
  FULFILLING: "bg-amber-50 text-amber-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
  REFUNDED: "bg-purple-50 text-purple-700",
};

export default async function AdminOrders() {
  const orders = await listAdminOrders();

  return (
    <div>
      <h1 className="text-2xl font-bold">Pedidos</h1>
      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 text-left text-gray-500">
            <tr>
              <th className="p-3">Pedido</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Total</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">Aún no hay pedidos.</td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="p-3 font-medium">
                    <a href={`/admin/pedidos/${o.id}`} className="text-brand-600 hover:underline">
                      {o.number}
                    </a>
                  </td>
                  <td className="p-3 text-gray-600">{o.email}</td>
                  <td className="p-3 text-gray-500">{o.createdAt.toLocaleDateString("es-ES")}</td>
                  <td className="p-3">{formatMoney(o.total, o.currency)}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[o.status] ?? ""}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
