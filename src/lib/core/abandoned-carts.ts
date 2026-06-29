import { prisma } from "@/lib/db/client";
import { sendEmail } from "@/lib/email";
import { abandonedCartEmail } from "@/lib/email/templates";
import { env } from "@/lib/env";
import { shouldRemind, DEFAULT_WINDOW, type ReminderWindow } from "./abandoned-schedule";

// Procesamiento de carritos abandonados. Lo dispara un cron (ver
// /api/cron/abandoned-carts). Resuelve el email de contacto (cart.email o el del
// usuario), filtra con la lógica pura shouldRemind, envía el recordatorio y marca
// remindedAt para no duplicar. Carritos fuera de ventana (muy antiguos) se pasan
// a ABANDONED para limpiar métricas.

export async function processAbandonedCarts(
  window: ReminderWindow = DEFAULT_WINDOW,
): Promise<{ reminded: number; expired: number }> {
  const now = new Date();
  const maxAge = new Date(now.getTime() - window.maxIdleHours * 3_600_000);

  const candidates = await prisma.cart.findMany({
    where: { status: "ACTIVE", remindedAt: null, items: { some: {} } },
    include: {
      items: { include: { variant: { include: { product: { select: { title: true } } } } } },
      user: { select: { email: true } },
    },
    take: 200,
  });

  let reminded = 0;
  let expired = 0;

  for (const cart of candidates) {
    const email = cart.email ?? cart.user?.email ?? null;
    const itemCount = cart.items.reduce((s, it) => s + it.quantity, 0);

    if (cart.updatedAt < maxAge) {
      await prisma.cart.update({ where: { id: cart.id }, data: { status: "ABANDONED" } });
      expired++;
      continue;
    }

    const eligible = shouldRemind(
      { status: cart.status, itemCount, email, updatedAt: cart.updatedAt, remindedAt: cart.remindedAt },
      now,
      window,
    );
    if (!eligible || !email) continue;

    const total = cart.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const recoverUrl = `${env.NEXT_PUBLIC_SITE_URL}/api/cart/recover?token=${cart.token}`;
    const { subject, html } = abandonedCartEmail({
      recoverUrl,
      currency: cart.currency,
      total,
      items: cart.items.map((it) => ({ title: it.variant.product.title, quantity: it.quantity })),
    });

    const sent = await sendEmail({ to: email, subject, html });
    if (sent.ok) {
      await prisma.cart.update({ where: { id: cart.id }, data: { remindedAt: now } });
      reminded++;
    }
  }

  return { reminded, expired };
}
