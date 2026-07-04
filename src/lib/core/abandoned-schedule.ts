// Lógica pura de elegibilidad para recordatorio de carrito abandonado.
// Sin dependencias (DB), testeable de forma aislada.

export type RemindableCart = {
  status: string;
  itemCount: number;
  email: string | null;
  updatedAt: Date;
  remindedAt: Date | null;
};

export type ReminderWindow = {
  minIdleMinutes: number; // espera mínima desde la última actividad
  maxIdleHours: number; // no recordar carritos demasiado antiguos
};

export const DEFAULT_WINDOW: ReminderWindow = { minIdleMinutes: 60, maxIdleHours: 72 };

export function shouldRemind(
  cart: RemindableCart,
  now: Date = new Date(),
  window: ReminderWindow = DEFAULT_WINDOW,
): boolean {
  if (cart.status !== "ACTIVE") return false;
  if (cart.itemCount <= 0) return false;
  if (!cart.email) return false;
  if (cart.remindedAt) return false;

  const idleMs = now.getTime() - cart.updatedAt.getTime();
  const minMs = window.minIdleMinutes * 60_000;
  const maxMs = window.maxIdleHours * 3_600_000;
  return idleMs >= minMs && idleMs <= maxMs;
}
