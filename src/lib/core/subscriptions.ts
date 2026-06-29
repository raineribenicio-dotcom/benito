import { prisma } from "@/lib/db/client";
import { nextOrderDate, type Interval } from "./subscription-schedule";

// Lógica de suscripciones (recompra). El cálculo de la próxima fecha vive en
// subscription-schedule (puro y testeable); aquí persistimos en DB. La
// facturación recurrente real se delega en Stripe Subscriptions cuando haya claves.

export type { Interval };
export { nextOrderDate };

export async function createSubscription(params: {
  userId: string;
  variantId: string;
  interval: Interval;
  quantity?: number;
}) {
  return prisma.subscription.create({
    data: {
      userId: params.userId,
      variantId: params.variantId,
      interval: params.interval,
      quantity: params.quantity ?? 1,
      nextOrderAt: nextOrderDate(params.interval),
    },
  });
}

export async function listUserSubscriptions(userId: string) {
  try {
    return await prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { variant: { include: { product: { select: { title: true, slug: true } } } } },
    });
  } catch {
    return [];
  }
}

export async function setSubscriptionStatus(
  id: string,
  userId: string,
  status: "ACTIVE" | "PAUSED" | "CANCELLED",
) {
  // Garantiza que la suscripción pertenece al usuario
  const sub = await prisma.subscription.findFirst({ where: { id, userId } });
  if (!sub) throw new Error("Suscripción no encontrada");
  return prisma.subscription.update({ where: { id }, data: { status } });
}
