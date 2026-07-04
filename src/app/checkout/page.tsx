import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getActiveCart } from "@/lib/core/cart";
import { getAvailablePaymentMethods } from "@/lib/payments";
import { SiteHeader } from "@/components/SiteHeader";
import { OrderSummary } from "@/components/OrderSummary";
import { CheckoutMethods } from "@/components/CheckoutMethods";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const cart = await getActiveCart();
  if (!cart || cart.items.length === 0) redirect("/carrito");
  const methods = getAvailablePaymentMethods();

  return (
    <>
      <SiteHeader />
      <main className="container py-8">
        <h1 className="text-2xl font-bold">Finalizar compra</h1>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <CheckoutMethods methods={methods} />

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
            <p className="mt-4 text-center text-xs text-gray-400">
              Compra protegida · Cumplimiento PCI vía Stripe · PayPal
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
