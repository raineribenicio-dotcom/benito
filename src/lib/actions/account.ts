"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { getCurrentUserId } from "@/lib/auth/session";

// Acciones del área de cliente: devolución self-service y direcciones.

export async function requestReturnAction(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const { orderId, reason } = z
    .object({ orderId: z.string().min(1), reason: z.string().max(500).optional() })
    .parse(Object.fromEntries(formData));

  // Verifica que el pedido es del usuario y es elegible
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId, status: { in: ["DELIVERED", "SHIPPED", "PAID"] } },
  });
  if (!order) throw new Error("Pedido no elegible para devolución");

  await prisma.return.create({ data: { orderId, reason, status: "REQUESTED" } });
  revalidatePath("/cuenta/pedidos");
}

export async function addAddressAction(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const data = z
    .object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().min(1),
      postalCode: z.string().min(1),
      province: z.string().optional(),
      country: z.string().length(2),
      phone: z.string().optional(),
    })
    .parse(Object.fromEntries(formData));

  const count = await prisma.address.count({ where: { userId } });
  await prisma.address.create({ data: { ...data, userId, isDefault: count === 0 } });
  revalidatePath("/cuenta");
}
