import { z } from "zod";

// Validación de entorno en el arranque. Las claves de proveedores externos son
// opcionales: su ausencia activa el fallback correspondiente (ver lib/search,
// lib/payments, lib/email). DATABASE_URL y AUTH_SECRET sí son obligatorias.

const schema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(16).optional(),
  AUTH_URL: z.string().url().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),

  ALGOLIA_APP_ID: z.string().optional(),
  ALGOLIA_ADMIN_KEY: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),

  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().default("EUR"),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().default("es"),
});

function loadEnv() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Variables de entorno inválidas:", parsed.error.flatten().fieldErrors);
    throw new Error("Configuración de entorno inválida");
  }
  return parsed.data;
}

export const env = loadEnv();

export const features = {
  stripe: Boolean(env.STRIPE_SECRET_KEY),
  paypal: Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET),
  algolia: Boolean(env.ALGOLIA_APP_ID && env.ALGOLIA_ADMIN_KEY),
  cloudinary: Boolean(env.CLOUDINARY_CLOUD_NAME),
  email: Boolean(env.RESEND_API_KEY),
} as const;
