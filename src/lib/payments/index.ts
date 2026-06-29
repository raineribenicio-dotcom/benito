import { features } from "@/lib/env";
import { getStripe } from "./stripe-client";

// Interfaz de pagos. Implementación Stripe si hay clave; si no, un stub que
// simula un PaymentIntent para poder desarrollar el flujo de checkout sin cuenta.
// La verificación de firma de webhooks vive en el route handler correspondiente.

export type CreateIntentInput = {
  amount: number; // céntimos
  currency: string;
  orderId: string;
  customerEmail: string;
  metadata?: Record<string, string>;
};

export type PaymentIntentResult = {
  id: string;
  clientSecret: string;
  status: "requires_action" | "processing" | "succeeded";
};

export interface PaymentProvider {
  createPaymentIntent(input: CreateIntentInput): Promise<PaymentIntentResult>;
  refund(paymentRef: string, amount?: number): Promise<{ id: string; amount: number }>;
}

function mapStatus(s: string): PaymentIntentResult["status"] {
  if (s === "succeeded") return "succeeded";
  if (s === "processing") return "processing";
  return "requires_action"; // requires_payment_method/confirmation/action
}

class StripePayments implements PaymentProvider {
  async createPaymentIntent(input: CreateIntentInput): Promise<PaymentIntentResult> {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: input.amount,
      currency: input.currency.toLowerCase(),
      receipt_email: input.customerEmail,
      automatic_payment_methods: { enabled: true }, // tarjeta, Apple Pay, Google Pay
      metadata: { orderId: input.orderId, ...input.metadata },
    });
    return {
      id: intent.id,
      clientSecret: intent.client_secret ?? "",
      status: mapStatus(intent.status),
    };
  }

  async refund(paymentRef: string, amount?: number): Promise<{ id: string; amount: number }> {
    const stripe = getStripe();
    const refund = await stripe.refunds.create({
      payment_intent: paymentRef,
      ...(amount && amount > 0 ? { amount } : {}),
    });
    return { id: refund.id, amount: refund.amount ?? 0 };
  }
}

class StubPayments implements PaymentProvider {
  async createPaymentIntent(input: CreateIntentInput): Promise<PaymentIntentResult> {
    const id = `pi_stub_${input.orderId}`;
    return { id, clientSecret: `${id}_secret`, status: "succeeded" };
  }
  async refund(paymentRef: string, amount = 0): Promise<{ id: string; amount: number }> {
    return { id: `re_stub_${paymentRef}`, amount };
  }
}

export const paymentProvider: PaymentProvider = features.stripe
  ? new StripePayments()
  : new StubPayments();
