import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/core/money";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Pedido confirmado", robots: { index: false } };

async function getOrder(number: string) {
  try {
    return await prisma.order.findUnique({
      where: { number: `#${number}` },
      include: { items: true },
    });
  } catch {
    return null;
  }
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: { number: string };
}) {
  const order = await getOrder(params.number);
  if (!order) notFound();

  return (
    <>
      <SiteHeader />
      <main className="container max-w-2xl py-12">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <p className="text-4xl">✓</p>
          <h1 className="mt-2 text-2xl font-bold">¡Gracias por tu compra!</h1>
          <p className="mt-1 text-gray-600">
            Pedido <strong>{order.number}</strong> confirmado. Te hemos enviado un email a{" "}
            <strong>{order.email}</strong>.
          </p>
          {order.status === "PENDING" && (
            <p className="mt-3 text-sm text-amber-700">
              Estamos confirmando tu pago. El estado se actualizará en unos segundos.
            </p>
          )}
        </div>

        <div className="mt-8">
          <h2 className="font-semibold">Resumen</h2>
          <ul className="mt-3 divide-y divide-gray-100">
            {order.items.map((it) => (
              <li key={it.id} className="flex justify-between py-2 text-sm">
                <span>
                  {it.quantity}× {it.title}
                  {it.variantTitle ? ` · ${it.variantTitle}` : ""}
                </span>
                <span className="font-medium">{formatMoney(it.total, order.currency)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatMoney(order.total, order.currency)}</span>
          </div>
        </div>

        <a href="/catalogo" className="mt-8 inline-flex text-brand-600 hover:underline">
          ← Seguir comprando
        </a>
      </main>
    </>
  );
}
