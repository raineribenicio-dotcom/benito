import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/session";
import { listUserSubscriptions } from "@/lib/core/subscriptions";
import { SiteHeader } from "@/components/SiteHeader";
import { updateSubscriptionAction } from "@/lib/actions/subscriptions";

export const metadata: Metadata = { title: "Mis suscripciones", robots: { index: false } };

const INTERVAL_LABEL: Record<string, string> = {
  WEEKLY: "Semanal",
  BIWEEKLY: "Cada 2 semanas",
  MONTHLY: "Mensual",
  BIMONTHLY: "Cada 2 meses",
  QUARTERLY: "Trimestral",
};

export default async function SubscriptionsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const subs = await listUserSubscriptions(userId);

  return (
    <>
      <SiteHeader />
      <main className="container py-8">
        <a href="/cuenta" className="text-sm text-gray-500 hover:text-brand-600">← Mi cuenta</a>
        <h1 className="mt-2 text-2xl font-bold">Mis suscripciones</h1>

        {subs.length === 0 ? (
          <p className="mt-6 text-gray-500">No tienes suscripciones activas.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {subs.map((s) => (
              <li key={s.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <a href={`/producto/${s.variant.product.slug}`} className="font-semibold hover:text-brand-600">
                      {s.variant.product.title}
                    </a>
                    <p className="text-sm text-gray-500">
                      {INTERVAL_LABEL[s.interval]} · {s.quantity} ud · próximo envío{" "}
                      {s.nextOrderAt.toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      s.status === "ACTIVE"
                        ? "bg-green-50 text-green-700"
                        : s.status === "PAUSED"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                {s.status !== "CANCELLED" && (
                  <div className="mt-3 flex gap-2">
                    {s.status === "ACTIVE" ? (
                      <form action={updateSubscriptionAction}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="status" value="PAUSED" />
                        <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
                          Pausar
                        </button>
                      </form>
                    ) : (
                      <form action={updateSubscriptionAction}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="status" value="ACTIVE" />
                        <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
                          Reanudar
                        </button>
                      </form>
                    )}
                    <form action={updateSubscriptionAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="status" value="CANCELLED" />
                      <button className="rounded-lg px-3 py-1.5 text-sm text-gray-400 hover:text-red-600">
                        Cancelar
                      </button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
