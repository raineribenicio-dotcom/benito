import type { Metadata } from "next";
import { getActiveCart } from "@/lib/core/cart";
import { formatPrice } from "@/lib/core/money";
import { getI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { updateItemAction, removeItemAction, applyCouponAction } from "@/lib/actions/cart";
import { OrderSummary } from "@/components/OrderSummary";

export const metadata: Metadata = { title: "Carrito" };

export default async function CartPage() {
  const cart = await getActiveCart();
  const { currency, locale, t } = getI18n();

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <SiteHeader />
        <main className="container py-16 text-center">
          <h1 className="text-2xl font-bold">{t.cart.empty}</h1>
          <a
            href="/catalogo"
            className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
          >
            {t.home.explore}
          </a>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="container py-8">
        <h1 className="text-2xl font-bold">{t.cart.title}</h1>
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* Líneas */}
          <ul className="divide-y divide-gray-100">
            {cart.items.map((it) => (
              <li key={it.id} className="flex gap-4 py-4">
                <a href={`/producto/${it.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {it.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.imageUrl} alt={it.title} className="h-full w-full object-cover" />
                  )}
                </a>
                <div className="flex flex-1 flex-col">
                  <a href={`/producto/${it.slug}`} className="font-medium hover:text-brand-600">
                    {it.title}
                  </a>
                  {it.variantTitle && <p className="text-sm text-gray-500">{it.variantTitle}</p>}
                  <div className="mt-auto flex items-center gap-4">
                    <form action={updateItemAction} className="flex items-center gap-2">
                      <input type="hidden" name="itemId" value={it.id} />
                      <label htmlFor={`qty-${it.id}`} className="sr-only">Cantidad</label>
                      <select
                        id={`qty-${it.id}`}
                        name="quantity"
                        defaultValue={it.quantity}
                        className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                      >
                        {Array.from({ length: Math.max(it.quantity, Math.min(10, it.available)) }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      <button type="submit" className="text-sm text-brand-600 hover:underline">
                        Actualizar
                      </button>
                    </form>
                    <form action={removeItemAction}>
                      <input type="hidden" name="itemId" value={it.id} />
                      <button type="submit" className="text-sm text-gray-400 hover:text-red-600">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>
                <div className="text-right font-semibold">
                  {formatPrice(it.lineTotal, cart.currency, currency, locale)}
                </div>
              </li>
            ))}
          </ul>

          {/* Resumen */}
          <div>
            <form action={applyCouponAction} className="mb-4 flex gap-2">
              <input
                name="code"
                placeholder="Código de cupón"
                defaultValue={cart.couponCode ?? ""}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <button type="submit" className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
                Aplicar
              </button>
            </form>
            <OrderSummary cart={cart} />
            <a
              href="/checkout"
              className="mt-4 block rounded-full bg-brand-600 px-6 py-3 text-center font-semibold text-white hover:bg-brand-700"
            >
              {t.cart.checkout}
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
