import { features } from "@/lib/env";

// Proveedor PayPal vía REST (sin SDK). Si no hay claves, un stub simula la
// creación/captura para poder desarrollar el flujo. Importes en unidades mayores
// (PayPal usa "19.95", no céntimos).

const BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

function toDecimal(cents: number): string {
  return (cents / 100).toFixed(2);
}

async function accessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export type PaypalCreateResult = { id: string; status: string };

export async function paypalCreateOrder(input: {
  amount: number; // céntimos
  currency: string;
  orderId: string;
}): Promise<PaypalCreateResult> {
  if (!features.paypal) {
    // Stub: id ficticio ligado a nuestro pedido
    return { id: `PAYPAL-STUB-${input.orderId}`, status: "CREATED" };
  }
  const token = await accessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: input.orderId,
          amount: { currency_code: input.currency, value: toDecimal(input.amount) },
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`PayPal create ${res.status}`);
  const data = (await res.json()) as { id: string; status: string };
  return { id: data.id, status: data.status };
}

export type PaypalCaptureResult = { ok: boolean; captureId?: string };

export async function paypalCaptureOrder(paypalOrderId: string): Promise<PaypalCaptureResult> {
  if (!features.paypal) {
    return { ok: true, captureId: `CAP-STUB-${paypalOrderId}` };
  }
  const token = await accessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) return { ok: false };
  const data = (await res.json()) as {
    status: string;
    purchase_units?: { payments?: { captures?: { id: string }[] } }[];
  };
  const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  return { ok: data.status === "COMPLETED", captureId };
}

export async function paypalRefund(captureId: string, amountCents?: number, currency = "EUR") {
  if (!features.paypal) return { id: `RE-STUB-${captureId}` };
  const token = await accessToken();
  const res = await fetch(`${BASE}/v2/payments/captures/${captureId}/refund`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(
      amountCents ? { amount: { value: toDecimal(amountCents), currency_code: currency } } : {},
    ),
  });
  if (!res.ok) throw new Error(`PayPal refund ${res.status}`);
  const data = (await res.json()) as { id: string };
  return { id: data.id };
}
