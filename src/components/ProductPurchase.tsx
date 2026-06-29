"use client";

import { useMemo, useState } from "react";
import { useI18n } from "./I18nProvider";

// Selección de variante por opciones (Talla, Color…), stock en tiempo real y
// añadir al carrito. La lógica de carrito completa llega en M3; aquí el botón
// llama al endpoint /api/cart.

export type OptionVM = { name: string; values: string[] };
export type VariantVM = {
  id: string;
  sku: string;
  price: number;
  compareAt: number | null;
  currency: string;
  available: number;
  optionValues: Record<string, string>; // { Talla: "M", Color: "Negro" }
};

export function ProductPurchase({
  options,
  variants,
}: {
  options: OptionVM[];
  variants: VariantVM[];
}) {
  const { price } = useI18n();
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(options.map((o) => [o.name, variants[0]?.optionValues[o.name] ?? o.values[0]])),
  );
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [subInterval, setSubInterval] = useState("");
  const [subMsg, setSubMsg] = useState<string | null>(null);

  const variant = useMemo(
    () =>
      variants.find((v) => options.every((o) => v.optionValues[o.name] === selected[o.name])) ??
      variants[0],
    [variants, options, selected],
  );

  const outOfStock = !variant || variant.available <= 0;

  async function addToCart() {
    if (!variant) return;
    setStatus("adding");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: variant.id, quantity: qty }),
      });
      setStatus(res.ok ? "added" : "error");
    } catch {
      setStatus("error");
    }
  }

  async function subscribe() {
    if (!variant || !subInterval) return;
    setSubMsg(null);
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId: variant.id, interval: subInterval, quantity: qty }),
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    setSubMsg(res.ok ? "✓ Suscripción creada. Gestiónala en tu cuenta." : "No se pudo crear la suscripción.");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">
          {variant ? price(variant.price, variant.currency) : "—"}
        </span>
        {variant?.compareAt && variant.compareAt > variant.price && (
          <span className="text-lg text-gray-400 line-through">
            {price(variant.compareAt, variant.currency)}
          </span>
        )}
      </div>

      {options.map((o) => (
        <fieldset key={o.name}>
          <legend className="mb-1 text-sm font-medium">{o.name}</legend>
          <div className="flex flex-wrap gap-2">
            {o.values.map((val) => {
              const isSel = selected[o.name] === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSelected((s) => ({ ...s, [o.name]: val }))}
                  aria-pressed={isSel}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    isSel ? "border-brand-600 bg-brand-50 text-brand-700" : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {/* Escasez real: avisa cuando queda poco stock (CRO) */}
      {variant && variant.available > 0 && variant.available <= 5 && (
        <p className="text-sm font-medium text-orange-600">¡Solo quedan {variant.available}!</p>
      )}

      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="sr-only">
          Cantidad
        </label>
        <select
          id="qty"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="rounded-lg border border-gray-300 px-3 py-2"
          disabled={outOfStock}
        >
          {Array.from({ length: Math.min(10, variant?.available ?? 1) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addToCart}
          disabled={outOfStock || status === "adding"}
          className="flex-1 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {outOfStock ? "Agotado" : status === "adding" ? "Añadiendo…" : "Añadir al carrito"}
        </button>
      </div>

      {status === "added" && <p className="text-sm font-medium text-green-600">✓ Añadido al carrito</p>}
      {status === "error" && (
        <p className="text-sm text-red-600">No se pudo añadir. Inténtalo de nuevo.</p>
      )}

      {/* Suscríbete y ahorra (recompra automática) */}
      {!outOfStock && (
        <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50 p-3">
          <p className="text-sm font-medium text-brand-800">Suscríbete y recíbelo automáticamente</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label htmlFor="sub-interval" className="sr-only">Frecuencia</label>
            <select
              id="sub-interval"
              value={subInterval}
              onChange={(e) => setSubInterval(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Elige frecuencia…</option>
              <option value="WEEKLY">Cada semana</option>
              <option value="BIWEEKLY">Cada 2 semanas</option>
              <option value="MONTHLY">Cada mes</option>
              <option value="BIMONTHLY">Cada 2 meses</option>
              <option value="QUARTERLY">Cada 3 meses</option>
            </select>
            <button
              type="button"
              onClick={subscribe}
              disabled={!subInterval}
              className="rounded-full border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-50"
            >
              Suscribirme
            </button>
          </div>
          {subMsg && <p className="mt-2 text-sm text-brand-800">{subMsg}</p>}
        </div>
      )}
    </div>
  );
}
