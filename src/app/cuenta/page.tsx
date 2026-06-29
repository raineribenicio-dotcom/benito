import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentUserId } from "@/lib/auth/session";
import { getUserOrders, getUserAddresses } from "@/lib/core/account";
import { formatMoney } from "@/lib/core/money";
import { SiteHeader } from "@/components/SiteHeader";
import { logoutAction } from "@/lib/actions/auth";
import { addAddressAction } from "@/lib/actions/account";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

const field = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";

export default async function AccountPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const [user, orders, addresses] = await Promise.all([
    getCurrentUser(),
    getUserOrders(userId),
    getUserAddresses(userId),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="container py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Hola, {user?.name ?? "cliente"}</h1>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-gray-500 hover:text-red-600">
              Cerrar sesión
            </button>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Pedidos recientes */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Pedidos recientes</h2>
              <a href="/cuenta/pedidos" className="text-sm text-brand-600 hover:underline">Ver todos</a>
            </div>
            {orders.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">Aún no has hecho pedidos.</p>
            ) : (
              <ul className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                {orders.slice(0, 5).map((o) => (
                  <li key={o.id} className="flex justify-between p-3 text-sm">
                    <span>
                      <span className="font-medium">{o.number}</span>
                      <span className="block text-xs text-gray-400">{o.createdAt.toLocaleDateString("es-ES")}</span>
                    </span>
                    <span className="text-right">
                      {formatMoney(o.total, o.currency)}
                      <span className="block text-xs text-gray-400">{o.status}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Direcciones */}
          <section>
            <h2 className="font-semibold">Direcciones</h2>
            {addresses.length > 0 && (
              <ul className="mt-3 space-y-2">
                {addresses.map((a) => (
                  <li key={a.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                    <p className="font-medium">{a.firstName} {a.lastName} {a.isDefault && <span className="text-xs text-brand-600">(predeterminada)</span>}</p>
                    <p className="text-gray-600">{a.line1}, {a.postalCode} {a.city}, {a.country}</p>
                  </li>
                ))}
              </ul>
            )}
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-brand-600">+ Añadir dirección</summary>
              <form action={addAddressAction} className="mt-3 grid grid-cols-2 gap-2">
                <input name="firstName" required placeholder="Nombre" className={field} />
                <input name="lastName" required placeholder="Apellidos" className={field} />
                <input name="line1" required placeholder="Dirección" className={`${field} col-span-2`} />
                <input name="postalCode" required placeholder="CP" className={field} />
                <input name="city" required placeholder="Ciudad" className={field} />
                <input name="province" placeholder="Provincia" className={field} />
                <input name="country" required defaultValue="ES" maxLength={2} placeholder="País" className={field} />
                <button type="submit" className="col-span-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                  Guardar dirección
                </button>
              </form>
            </details>
          </section>
        </div>
      </main>
    </>
  );
}
