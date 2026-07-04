import { formatPrice } from "@/lib/core/money";
import { getI18n } from "@/lib/i18n";
import type { CartView } from "@/lib/core/cart";

// Resumen de importes reutilizable en carrito y checkout.

export function OrderSummary({ cart }: { cart: CartView }) {
  const { currency, locale, t } = getI18n();
  const money = (amount: number) => formatPrice(amount, cart.currency, currency, locale);
  const row = (label: string, value: number, opts?: { strong?: boolean; free?: boolean }) => (
    <div className={`flex justify-between py-1 ${opts?.strong ? "text-lg font-bold" : "text-sm"}`}>
      <span className={opts?.strong ? "" : "text-gray-600"}>{label}</span>
      <span>{opts?.free ? t.cart.free : money(value)}</span>
    </div>
  );

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      {row(t.cart.subtotal, cart.subtotal)}
      {cart.discountTotal > 0 && (
        <div className="flex justify-between py-1 text-sm text-green-700">
          <span>{locale === "en" ? "Discount" : "Descuento"}</span>
          <span>-{money(cart.discountTotal)}</span>
        </div>
      )}
      {row(t.cart.shipping, cart.shippingTotal, { free: cart.shippingTotal === 0 })}
      {row(t.cart.tax, cart.taxTotal)}
      <div className="mt-2 border-t border-gray-100 pt-2">
        {row(t.cart.total, cart.total, { strong: true })}
      </div>
    </div>
  );
}
