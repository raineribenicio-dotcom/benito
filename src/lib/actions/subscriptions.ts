"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/session";
import { setSubscriptionStatus } from "@/lib/core/subscriptions";

// Gestión de suscripciones del cliente (pausar/reanudar/cancelar).

export async function updateSubscriptionAction(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const { id, status } = z
    .object({ id: z.string().min(1), status: z.enum(["ACTIVE", "PAUSED", "CANCELLED"]) })
    .parse(Object.fromEntries(formData));

  await setSubscriptionStatus(id, userId, status);
  revalidatePath("/cuenta/suscripciones");
}
