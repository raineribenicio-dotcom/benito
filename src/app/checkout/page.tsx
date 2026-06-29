import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getActiveCart } from "@/lib/core/cart";
import { features } from "@/lib/env";
import { SiteHeader } from "@/components/SiteHeader";
import { OrderSummary } from "@/components/OrderSummary";
import { StripeCheckoutForm } from "@/components/StripeCheckoutForm";
import { placeOrderAction } from "@/lib/actions/checkout";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

const field = "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const cart = await getActiveCart();
  if (!cart || cart.items.length === 0) redirect("/carrito");

  return (
    <>
      <SiteHeader />
      <main className="container py-8">
        <h1 className="text-2xl font-bold">Finalizar compra</h1>

        {searchParams.error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {searchParams.error}
          </p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* Con claves de Stripe: pago real con Elements. Sin claves: flujo stub. */}
          {features.stripe ? (
            <StripeCheckoutForm />
          ) : (
          <form action={placeOrderAction} className="space-y-6">
            <section>
              <h2 className="mb-3 font-semibold">Contacto</h2>
              <input name="email" type="email" required placeholder="Email" className={field} />
            </section>

            <section>
              <h2 className="mb-3 font-semibold">Dirección de envío</h2>
              <div className="grid grid-cols-2 gap-3">
                <input name="firstName" required placeholder="Nombre" className={field} />
                <input name="lastName" required placeholder="Apellidos" className={field} />
                <input name="line1" required placeholder="Dirección" className={`${field} col-span-2`} />
                <input name="line2" placeholder="Piso, puerta (opcional)" className={`${field} col-span-2`} />
                <input name="postalCode" required placeholder="Código postal" className={field} />
                <input name="city" required placeholder="Ciudad" className={field} />
                <input name="province" placeholder="Provincia" className={field} />
                <input
                  name="country"
                  required
                  defaultValue="ES"
                  maxLength={2}
                  placeholder="País (ISO, ej. ES)"
                  className={field}
                />
                <input name="phone" placeholder="Teléfono (opcional)" className={`${field} col-span-2`} />
              </div>
            </section>

            <section>
              <h2 className="mb-3 font-semibold">Pago</h2>
              <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
                Pago seguro vía Stripe (tarjeta, Apple Pay, Google Pay). En este entorno sin claves
                se usa el proveedor en modo prueba. La integración real de Stripe Elements llega en M4.
              </p>
            </section>

            <button
              type="submit"
              className="w-full rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white hover:bg-brand-700"
            >
              Pagar {/* importe en el resumen */}
            </button>
            <p className="text-center text-xs text-gray-400">
              Compra protegida · Cumplimiento PCI vía Stripe
            </p>
          </form>
          )}

          <div>
            <OrderSummary cart={cart} />
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              {cart.items.map((it) => (
                <li key={it.id} className="flex justify-between">
                  <span>
                    {it.quantity}× {it.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
