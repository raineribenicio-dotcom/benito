import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/session";
import { getUserOrders } from "@/lib/core/account";
import { formatMoney } from "@/lib/core/money";
import { SiteHeader } from "@/components/SiteHeader";
import { requestReturnAction } from "@/lib/actions/account";

export const metadata: Metadata = { title: "Mis pedidos", robots: { index: false } };

const RETURNABLE = ["DELIVERED", "SHIPPED", "PAID"];

export default async function OrdersPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const orders = await getUserOrders(userId);

  return (
    <>
      <SiteHeader />
      <main className="container py-8">
        <a href="/cuenta" className="text-sm text-gray-500 hover:text-brand-600">← Mi cuenta</a>
        <h1 className="mt-2 text-2xl font-bold">Mis pedidos</h1>

        {orders.length === 0 ? (
          <p className="mt-6 text-gray-500">Aún no has hecho pedidos.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {orders.map((o) => {
              const hasReturn = o.returns.length > 0;
              const canReturn = RETURNABLE.includes(o.status) && !hasReturn;
              return (
                <li key={o.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold">{o.number}</span>
                      <span className="ml-2 text-sm text-gray-400">{o.createdAt.toLocaleDateString("es-ES")}</span>
                    </div>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{o.status}</span>
                  </div>

                  <ul className="mt-3 divide-y divide-gray-50 text-sm">
                    {o.items.map((it) => (
                      <li key={it.id} className="flex justify-between py-1.5">
                        <span>{it.quantity}× {it.title}{it.variantTitle ? ` · ${it.variantTitle}` : ""}</span>
                        <span>{formatMoney(it.total, o.currency)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="font-bold">{formatMoney(o.total, o.currency)}</span>
                    {hasReturn ? (
                      <span className="text-sm text-purple-700">Devolución {o.returns[0].status}</span>
                    ) : canReturn ? (
                      <form action={requestReturnAction} className="flex items-center gap-2">
                        <input type="hidden" name="orderId" value={o.id} />
                        <input name="reason" placeholder="Motivo (opcional)" className="rounded-lg border border-gray-300 px-2 py-1 text-sm" />
                        <button type="submit" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
                          Solicitar devolución
                        </button>
                      </form>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
