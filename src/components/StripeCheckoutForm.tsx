"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

// Checkout con Stripe Elements. Paso 1: dirección -> crea pedido + PaymentIntent.
// Paso 2: Payment Element (tarjeta, Apple Pay, Google Pay) -> confirma el pago.
// El pedido se marca PAID vía webhook payment_intent.succeeded.

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");
const field = "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none";

function PayStep({ orderNumber }: { orderNumber: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    const returnUrl = `${window.location.origin}/pedido/${orderNumber.replace("#", "")}`;
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });
    // Si no hubo redirección, mostramos el error (tarjeta rechazada, etc.)
    if (error) {
      setError(error.message ?? "El pago no se pudo completar");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={pay} className="space-y-4">
      <PaymentElement />
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white hover:bg-brand-700 disabled:bg-gray-300"
      >
        {loading ? "Procesando…" : "Pagar ahora"}
      </button>
    </form>
  );
}

export function StripeCheckoutForm() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createIntent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "No se pudo iniciar el pago");
        setLoading(false);
        return;
      }
      setClientSecret(body.clientSecret);
      setOrderNumber(body.orderNumber);
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  if (clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
        <PayStep orderNumber={orderNumber} />
      </Elements>
    );
  }

  return (
    <form onSubmit={createIntent} className="space-y-6">
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
          <input name="country" required defaultValue="ES" maxLength={2} placeholder="País (ISO)" className={field} />
          <input name="phone" placeholder="Teléfono (opcional)" className={`${field} col-span-2`} />
        </div>
      </section>
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white hover:bg-brand-700 disabled:bg-gray-300"
      >
        {loading ? "Preparando pago…" : "Continuar al pago"}
      </button>
    </form>
  );
}
