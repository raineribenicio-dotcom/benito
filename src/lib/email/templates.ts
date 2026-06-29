import { formatMoney } from "@/lib/core/money";

// Plantillas HTML de emails transaccionales. HTML inline simple para máxima
// compatibilidad con clientes de correo.

type OrderLine = { title: string; variantTitle?: string | null; quantity: number; total: number };

export function orderConfirmationEmail(params: {
  number: string;
  email: string;
  currency: string;
  total: number;
  items: OrderLine[];
}): { subject: string; html: string } {
  const rows = params.items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">
          ${it.quantity}× ${it.title}${it.variantTitle ? ` · ${it.variantTitle}` : ""}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">
          ${formatMoney(it.total, params.currency)}
        </td>
      </tr>`,
    )
    .join("");

  const html = `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#111">
    <h1 style="color:#114a9c">¡Gracias por tu compra!</h1>
    <p>Tu pedido <strong>${params.number}</strong> está confirmado.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px">${rows}</table>
    <p style="text-align:right;font-size:18px;font-weight:bold;margin-top:12px">
      Total: ${formatMoney(params.total, params.currency)}
    </p>
    <p style="color:#666;font-size:13px;margin-top:24px">
      Recibirás otro email cuando tu pedido salga de nuestro almacén.
    </p>
  </div>`;

  return { subject: `Pedido ${params.number} confirmado`, html };
}
