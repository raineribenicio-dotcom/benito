import { formatMoney } from "@/lib/core/money";
import type { CartView } from "@/lib/core/cart";

// Resumen de importes reutilizable en carrito y checkout.

export function OrderSummary({ cart }: { cart: CartView }) {
  const row = (label: string, value: number, opts?: { strong?: boolean; free?: boolean }) => (
    <div className={`flex justify-between py-1 ${opts?.strong ? "text-lg font-bold" : "text-sm"}`}>
      <span className={opts?.strong ? "" : "text-gray-600"}>{label}</span>
      <span>{opts?.free ? "Gratis" : formatMoney(value, cart.currency)}</span>
    </div>
  );

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      {row("Subtotal", cart.subtotal)}
      {cart.discountTotal > 0 && (
        <div className="flex justify-between py-1 text-sm text-green-700">
          <span>Descuento</span>
          <span>-{formatMoney(cart.discountTotal, cart.currency)}</span>
        </div>
      )}
      {row("Envío", cart.shippingTotal, { free: cart.shippingTotal === 0 })}
      {row("Impuestos (IVA inc.)", cart.taxTotal)}
      <div className="mt-2 border-t border-gray-100 pt-2">
        {row("Total", cart.total, { strong: true })}
      </div>
    </div>
  );
}
