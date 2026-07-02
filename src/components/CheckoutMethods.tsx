"use client";

import { useState } from "react";
import { StripeCheckoutForm } from "./StripeCheckoutForm";
import { PayPalForm } from "./PayPalForm";
import type { PaymentMethodInfo } from "@/lib/payments";

// Selector de método de pago en el checkout. Cada método renderiza su propio
// formulario (dirección + pago) autocontenido.

export function CheckoutMethods({ methods }: { methods: PaymentMethodInfo[] }) {
  const [selected, setSelected] = useState<string>(methods[0]?.id ?? "card");

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-2 font-semibold">Método de pago</legend>
        <div className="space-y-2">
          {methods.map((m) => (
            <label
              key={m.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                selected === m.id ? "border-brand-500 bg-brand-50" : "border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={m.id}
                checked={selected === m.id}
                onChange={() => setSelected(m.id)}
              />
              <span className="flex-1">
                <span className="block text-sm font-medium">{m.label}</span>
                <span className="block text-xs text-gray-500">
                  {m.description}
                  {!m.live && " · modo prueba"}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {selected === "card" && <StripeCheckoutForm />}
      {selected === "paypal" && <PayPalForm />}
    </div>
  );
}
