// Envío de emails transaccionales con Resend (https://resend.com), vía su API HTTP.
//
// RESEND_API_KEY  -> obligatoria para enviar; sin ella no se envía nada (solo log) y el
//                    flujo sigue funcionando: las páginas muestran los enlaces igualmente.
// EMAIL_FROM      -> remitente. Sin dominio verificado en Resend hay que usar
//                    "onboarding@resend.dev", y entonces Resend SOLO entrega al email
//                    de la cuenta de Resend (modo prueba).
// ADMIN_NOTIFY_EMAIL -> buzón del equipo para avisos (por defecto ADMIN_EMAIL).
//
// Esto es independiente de la verificación de email del registro (email.ts), que sigue
// desactivada a propósito.

export interface MailResult {
  sent: boolean;
  error?: string;
}

export function getAdminNotifyEmail(): string | null {
  return (process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || "").trim() || null;
}

export async function sendEmail(opts: { to: string; subject: string; html: string; text: string }): Promise<MailResult> {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) {
    console.log(`[EMAIL NO CONFIGURADO] Para: ${opts.to} · Asunto: ${opts.subject}\n${opts.text}`);
    return { sent: false, error: "RESEND_API_KEY no configurada" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: (process.env.EMAIL_FROM || "").trim() || "Casa Creadores <onboarding@resend.dev>",
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[EMAIL] Resend rechazó el envío a ${opts.to}: HTTP ${res.status} ${body}`);
      return { sent: false, error: `HTTP ${res.status}: ${body.slice(0, 300)}` };
    }
    console.log(`[EMAIL] Enviado a ${opts.to}: ${opts.subject}`);
    return { sent: true };
  } catch (err) {
    console.error(`[EMAIL] Error enviando a ${opts.to}:`, err);
    return { sent: false, error: String(err) };
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Plantilla sencilla y compatible con clientes de correo: título, párrafos, filas y un botón. */
export function renderEmail(opts: {
  title: string;
  paragraphs: string[];
  rows?: Array<[string, string]>;
  button?: { label: string; url: string };
  footer?: string;
}): { html: string; text: string } {
  const rowsHtml = (opts.rows || [])
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0;color:#111827">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`
    )
    .join("");
  const html = `<!doctype html><html><body style="margin:0;background:#f6f6f4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:28px">
<p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#b45309;font-weight:700">Casa Creadores</p>
<h1 style="margin:0 0 16px;font-size:22px;color:#111827">${escapeHtml(opts.title)}</h1>
${opts.paragraphs.map((p) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#374151">${escapeHtml(p)}</p>`).join("")}
${rowsHtml ? `<table style="width:100%;border-collapse:collapse;font-size:14px;margin:8px 0 16px">${rowsHtml}</table>` : ""}
${opts.button ? `<p style="margin:20px 0 8px"><a href="${escapeHtml(opts.button.url)}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px">${escapeHtml(opts.button.label)}</a></p><p style="margin:0;font-size:12px;color:#6b7280;word-break:break-all">${escapeHtml(opts.button.url)}</p>` : ""}
</div>
<p style="margin:16px 0 0;font-size:12px;color:#9ca3af;text-align:center">${escapeHtml(opts.footer || "Casa Creadores · Red de creadores UGC en LATAM")}</p>
</div></body></html>`;
  const text = [
    opts.title,
    "",
    ...opts.paragraphs,
    "",
    ...(opts.rows || []).map(([k, v]) => `${k}: ${v}`),
    ...(opts.button ? ["", `${opts.button.label}: ${opts.button.url}`] : []),
  ].join("\n");
  return { html, text };
}
