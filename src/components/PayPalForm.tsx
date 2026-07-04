"use client";

import { useEffect, useRef, useState } from "react";

// Pago con PayPal. Con NEXT_PUBLIC_PAYPAL_CLIENT_ID carga el SDK real y renderiza
// los botones (createOrder -> /create, onApprove -> /capture). Sin client id,
// muestra un botón de prueba que crea y captura contra el stub.

const field = "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none";
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

declare global {
  interface Window {
    paypal?: any;
  }
}

function readContact(form: HTMLFormElement) {
  return Object.fromEntries(new FormData(form));
}

async function createOrder(form: HTMLFormElement): Promise<{ paypalOrderId?: string; error?: string }> {
  const res = await fetch("/api/checkout/paypal/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(readContact(form)),
  });
  const body = await res.json();
  if (!res.ok) return { error: body.error ?? "No se pudo iniciar PayPal" };
  return { paypalOrderId: body.paypalOrderId };
}

async function capture(paypalOrderId: string) {
  const res = await fetch("/api/checkout/paypal/capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paypalOrderId }),
  });
  return res.json();
}

export function PayPalForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Carga del SDK real y render de botones
  useEffect(() => {
    if (!CLIENT_ID || !btnRef.current) return;
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=EUR`;
    script.onload = () => {
      if (!window.paypal || !btnRef.current) return;
      window.paypal
        .Buttons({
          createOrder: async () => {
            const { paypalOrderId, error } = await createOrder(formRef.current!);
            if (error) throw new Error(error);
            return paypalOrderId;
          },
          onApprove: async (data: { orderID: string }) => {
            const result = await capture(data.orderID);
            if (result.ok) {
              window.location.href = `/pedido/${result.orderToken}`;
            } else {
              setError("El pago no se completó");
            }
          },
          onError: () => setError("Error de PayPal. Inténtalo de nuevo."),
        })
        .render(btnRef.current);
    };
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  // Flujo de prueba (stub) sin client id
  async function payStub() {
    if (!formRef.current?.reportValidity()) return;
    setLoading(true);
    setError(null);
    const { paypalOrderId, error } = await createOrder(formRef.current);
    if (error || !paypalOrderId) {
      setError(error ?? "Error");
      setLoading(false);
      return;
    }
    const result = await capture(paypalOrderId);
    if (result.ok) {
      window.location.href = `/pedido/${String(result.orderNumber).replace("#", "")}`;
    } else {
      setError("El pago no se completó");
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="space-y-6">
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
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>
      )}

      {CLIENT_ID ? (
        <div ref={btnRef} />
      ) : (
        <button
          type="button"
          onClick={payStub}
          disabled={loading}
          className="w-full rounded-full bg-[#ffc439] px-6 py-3.5 font-bold text-[#003087] hover:brightness-95 disabled:opacity-60"
        >
          {loading ? "Procesando…" : "Pagar con PayPal (modo prueba)"}
        </button>
      )}
    </form>
  );
}
