"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createOrderFromCart } from "@/lib/core/checkout";

// Server Action del checkout: valida la dirección/contacto y crea el pedido.
// Redirige a la confirmación o vuelve con error en la query.

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  province: z.string().optional(),
  country: z.string().length(2),
  phone: z.string().optional(),
});

export async function placeOrderAction(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`/checkout?error=${encodeURIComponent("Revisa los datos del formulario")}`);
  }

  const result = await createOrderFromCart(parsed.data);
  if (!result.ok) {
    redirect(`/checkout?error=${encodeURIComponent(result.error)}`);
  }

  redirect(`/pedido/${encodeURIComponent(result.orderNumber.replace("#", ""))}`);
}
