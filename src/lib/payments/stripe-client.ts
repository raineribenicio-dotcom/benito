import Stripe from "stripe";

// Singleton del SDK de Stripe (lado servidor). Solo se instancia si hay clave.
// La versión de API se deja en la del SDK/cuenta para evitar desajustes.

let client: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY no configurada");
  if (!client) client = new Stripe(key, { typescript: true });
  return client;
}
