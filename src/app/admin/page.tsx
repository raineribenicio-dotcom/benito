import { getDashboardKpis } from "@/lib/core/admin";
import { formatMoney } from "@/lib/core/money";

export default async function AdminDashboard() {
  const kpi = await getDashboardKpis();

  const cards = [
    { label: "Ingresos", value: formatMoney(kpi.revenue) },
    { label: "Pedidos", value: String(kpi.orders) },
    { label: "Ticket medio", value: formatMoney(kpi.avgOrderValue) },
    { label: "Conversión", value: `${(kpi.conversionRate * 100).toFixed(1)}%` },
    { label: "Carritos abandonados", value: String(kpi.abandonedCarts) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="font-semibold">Productos más vendidos</h2>
        {kpi.topProducts.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Aún no hay ventas.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {kpi.topProducts.map((p) => (
              <li key={p.title} className="flex justify-between py-2 text-sm">
                <span>{p.title}</span>
                <span className="font-medium">{p.units} uds</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
