import { features } from "@/lib/env";

// Envío de email. Con RESEND_API_KEY usa la API de Resend (vía fetch, sin SDK);
// sin clave, registra el email en consola para desarrollo. El resto de la app
// solo conoce sendEmail().

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(msg: EmailMessage): Promise<{ ok: boolean }> {
  if (!features.email) {
    console.info(`📧 [email:console] -> ${msg.to} · ${msg.subject}`);
    return { ok: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Benito <hola@benito.shop>",
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
      }),
    });
    if (!res.ok) {
      console.error("[email] Resend respondió", res.status, await res.text());
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] error:", (err as Error).message);
    return { ok: false };
  }
}
