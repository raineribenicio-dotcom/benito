import { features } from "@/lib/env";

// Interfaz de pagos. Implementación Stripe si hay clave; si no, un stub que
// simula un PaymentIntent para poder desarrollar el flujo de checkout sin cuenta.
// La verificación de firma de webhooks vive en el route handler correspondiente.

export type CreateIntentInput = {
  amount: number; // céntimos
  currency: string;
  orderId: string;
  customerEmail: string;
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

class StripePayments implements PaymentProvider {
  async createPaymentIntent(input: CreateIntentInput): Promise<PaymentIntentResult> {
    // TODO: usar el SDK de Stripe cuando STRIPE_SECRET_KEY esté presente.
    // import Stripe from "stripe"; const stripe = new Stripe(env.STRIPE_SECRET_KEY!)
    throw new Error("Stripe configurado pero el SDK aún no está cableado en este hito.");
  }
  async refund(): Promise<{ id: string; amount: number }> {
    throw new Error("Stripe refund no implementado en este hito.");
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
