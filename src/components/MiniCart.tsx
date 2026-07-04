"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "./I18nProvider";
import type { CartView } from "@/lib/core/cart";

// Mini-carrito lateral (drawer). Muestra un contador en la cabecera y un panel
// deslizante con las líneas y el subtotal. Se abre al pulsar o automáticamente
// al añadir un producto (evento "cart:updated").

export function MiniCart({ initialCount, label }: { initialCount: number; label: string }) {
  const { price } = useI18n();
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<CartView | null>(null);
  const [count, setCount] = useState(initialCount);

  const refresh = useCallback(async (openAfter = false) => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) return;
      const data = (await res.json()) as { cart: CartView | null };
      setCart(data.cart);
      setCount(data.cart?.itemCount ?? 0);
      if (openAfter) setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  // Refresca (y abre) cuando se añade algo al carrito desde cualquier parte
  useEffect(() => {
    const onUpdate = () => refresh(true);
    window.addEventListener("cart:updated", onUpdate);
    return () => window.removeEventListener("cart:updated", onUpdate);
  }, [refresh]);

  // Bloquea el scroll del body con el drawer abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function toggle() {
    if (!open) refresh(false);
    setOpen((o) => !o);
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className="relative text-sm font-medium text-gray-700 hover:text-brand-600"
        aria-label={`${label} (${count})`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {label}
        {count > 0 && (
          <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={label}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <h2 className="font-semibold">{label}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {!cart || cart.items.length === 0 ? (
                <p className="mt-8 text-center text-sm text-gray-500">Tu carrito está vacío.</p>
              ) : (
                <ul className="space-y-4">
                  {cart.items.map((it) => (
                    <li key={it.id} className="flex gap-3">
                      <span className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {it.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.imageUrl} alt={it.title} className="h-full w-full object-cover" />
                        )}
                      </span>
                      <div className="flex-1 text-sm">
                        <p className="line-clamp-1 font-medium">{it.title}</p>
                        {it.variantTitle && <p className="text-xs text-gray-500">{it.variantTitle}</p>}
                        <p className="text-xs text-gray-500">
                          {it.quantity} × {price(it.unitPrice, cart.currency)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">{price(it.lineTotal, cart.currency)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cart && cart.items.length > 0 && (
              <div className="border-t border-gray-100 p-4">
                <div className="mb-3 flex justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>{price(cart.subtotal, cart.currency)}</span>
                </div>
                <a
                  href="/carrito"
                  className="mb-2 block rounded-full border border-gray-300 py-2.5 text-center text-sm font-medium hover:bg-gray-50"
                >
                  Ver carrito
                </a>
                <a
                  href="/checkout"
                  className="block rounded-full bg-brand-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Finalizar compra
                </a>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
