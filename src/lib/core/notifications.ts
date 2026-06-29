import { prisma } from "@/lib/db/client";
import { sendEmail } from "@/lib/email";
import { orderConfirmationEmail } from "@/lib/email/templates";

// Notificaciones de pedido. Centralizado para que tanto el checkout (stub) como
// el webhook de Stripe envíen el mismo email al confirmarse el pago.

export async function sendOrderConfirmation(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) return;

    const { subject, html } = orderConfirmationEmail({
      number: order.number,
      email: order.email,
      currency: order.currency,
      total: order.total,
      items: order.items.map((it) => ({
        title: it.title,
        variantTitle: it.variantTitle,
        quantity: it.quantity,
        total: it.total,
      })),
    });
    await sendEmail({ to: order.email, subject, html });
  } catch (err) {
    // Nunca rompas el flujo de compra por un fallo de email
    console.error("[notifications] error enviando confirmación:", (err as Error).message);
  }
}
