// Cálculo puro de la planificación de suscripciones. Sin dependencias (DB),
// para ser testeable de forma aislada.

export type Interval = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "BIMONTHLY" | "QUARTERLY";

const DAYS: Record<Interval, number> = {
  WEEKLY: 7,
  BIWEEKLY: 14,
  MONTHLY: 30,
  BIMONTHLY: 60,
  QUARTERLY: 90,
};

export function nextOrderDate(interval: Interval, from: Date = new Date()): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + DAYS[interval]);
  return next;
}

/** Una suscripción está lista para generar pedido si está activa y ya venció. */
export function isSubscriptionDue(
  sub: { status: string; nextOrderAt: Date },
  now: Date = new Date(),
): boolean {
  return sub.status === "ACTIVE" && sub.nextOrderAt.getTime() <= now.getTime();
}
