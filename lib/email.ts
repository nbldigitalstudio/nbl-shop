import { formatMoney } from "@/lib/utils";

type SendEmailInput = {
  to: string | string[] | null | undefined;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string | null;
};

type OrderEmailInput = {
  orderId: string;
  storeName: string;
  storeSlug?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  subtotalCents: number;
  shippingAmountCents: number;
  totalCents: number;
  trackingNumber?: string | null;
  carrier?: string | null;
  service?: string | null;
};

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function emailFrom() {
  return process.env.EMAIL_FROM || "NBL Shop <hello@nblshop.com>";
}

function emailReplyTo() {
  return process.env.EMAIL_REPLY_TO || undefined;
}

function normalizeRecipients(to: SendEmailInput["to"]) {
  const recipients = Array.isArray(to) ? to : [to];
  return recipients
    .filter((recipient): recipient is string => typeof recipient === "string" && recipient.includes("@"))
    .map((recipient) => recipient.trim().toLowerCase());
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function shell(title: string, body: string) {
  return `
    <div style="margin:0;padding:32px;background:#fff8f4;color:#3d2f35;font-family:Arial,sans-serif;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #f4d8df;border-radius:24px;overflow:hidden;">
        <div style="padding:28px 28px 18px;background:#fbecf1;">
          <p style="margin:0 0 8px;color:#e2557d;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;">NBL Shop</p>
          <h1 style="margin:0;color:#2f2328;font-size:26px;line-height:1.2;">${escapeHtml(title)}</h1>
        </div>
        <div style="padding:28px;line-height:1.7;font-size:15px;">
          ${body}
        </div>
        <div style="padding:18px 28px;background:#faf7f5;color:#7a6b70;font-size:12px;">
          Creada con amor para pequeños negocios y grandes sueños.
        </div>
      </div>
    </div>
  `;
}

function button(label: string, href: string) {
  return `<p style="margin:24px 0 0;"><a href="${escapeHtml(href)}" style="display:inline-block;background:#e2557d;color:white;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:999px;">${escapeHtml(label)}</a></p>`;
}

export async function sendEmail(input: SendEmailInput) {
  const to = normalizeRecipients(input.to);
  const apiKey = process.env.RESEND_API_KEY;
  const from = emailFrom();

  if (!to.length) return { skipped: true, reason: "missing-recipient" };
  if (!apiKey) {
    console.info("Email skipped because RESEND_API_KEY is not configured:", {
      to,
      subject: input.subject,
    });
    return { skipped: true, reason: "missing-api-key" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo ?? emailReplyTo(),
      }),
    });

    if (!response.ok) {
      console.warn("Email provider rejected message:", {
        status: response.status,
        subject: input.subject,
      });
      return { skipped: false, ok: false };
    }

    return { skipped: false, ok: true };
  } catch (error) {
    console.warn("Email delivery failed:", error);
    return { skipped: false, ok: false };
  }
}

export function sendStoreInvitationEmail(input: {
  to: string;
  storeName: string;
  role: string;
}) {
  const dashboardUrl = `${appUrl()}/dashboard`;
  return sendEmail({
    to: input.to,
    subject: `Te invitaron a ${input.storeName} en NBL Shop`,
    html: shell(
      "Tu tienda te está esperando",
      `<p>Hola,</p>
       <p>Te invitaron como <strong>${escapeHtml(input.role)}</strong> a la tienda <strong>${escapeHtml(input.storeName)}</strong> en NBL Shop.</p>
       <p>Entra con magic link o Google para ver productos, órdenes, pagos y configuración.</p>
       ${button("Entrar al dashboard", dashboardUrl)}`
    ),
    text: `Te invitaron a ${input.storeName} en NBL Shop. Entra aquí: ${dashboardUrl}`,
  });
}

export function sendOrderReceivedEmail(input: OrderEmailInput) {
  const storeUrl = input.storeSlug ? `${appUrl()}/store/${input.storeSlug}` : appUrl();
  return sendEmail({
    to: input.customerEmail,
    subject: `Recibimos tu pedido en ${input.storeName}`,
    html: shell(
      "Gracias por tu compra",
      `<p>${input.customerName ? `Hola ${escapeHtml(input.customerName)},` : "Hola,"}</p>
       <p>Recibimos tu pedido en <strong>${escapeHtml(input.storeName)}</strong>. Lo estamos preparando con cuidado.</p>
       <div style="margin:20px 0;padding:16px;border-radius:16px;background:#fff8f4;">
         <p style="margin:0;">Pedido: <strong>#${escapeHtml(input.orderId.slice(0, 8).toUpperCase())}</strong></p>
         <p style="margin:6px 0 0;">Subtotal: <strong>${formatMoney(input.subtotalCents)}</strong></p>
         <p style="margin:6px 0 0;">Shipping: <strong>${formatMoney(input.shippingAmountCents)}</strong></p>
         <p style="margin:6px 0 0;">Total: <strong>${formatMoney(input.totalCents)}</strong></p>
       </div>
       ${button("Ver tienda", storeUrl)}`
    ),
    text: `Recibimos tu pedido #${input.orderId.slice(0, 8).toUpperCase()} en ${input.storeName}. Total: ${formatMoney(input.totalCents)}.`,
  });
}

export function sendNewOrderNotificationEmail(input: OrderEmailInput & { to?: string | null }) {
  const dashboardUrl = `${appUrl()}/dashboard/orders/${input.orderId}`;
  return sendEmail({
    to: input.to,
    subject: `Nuevo pedido en ${input.storeName}`,
    html: shell(
      "Tienes un nuevo pedido",
      `<p>Llegó un nuevo pedido pagado en <strong>${escapeHtml(input.storeName)}</strong>.</p>
       <div style="margin:20px 0;padding:16px;border-radius:16px;background:#fff8f4;">
         <p style="margin:0;">Pedido: <strong>#${escapeHtml(input.orderId.slice(0, 8).toUpperCase())}</strong></p>
         <p style="margin:6px 0 0;">Cliente: <strong>${escapeHtml(input.customerEmail ?? "Cliente invitado")}</strong></p>
         <p style="margin:6px 0 0;">Shipping cobrado: <strong>${formatMoney(input.shippingAmountCents)}</strong></p>
         <p style="margin:6px 0 0;">Total: <strong>${formatMoney(input.totalCents)}</strong></p>
       </div>
       ${button("Ver pedido", dashboardUrl)}`
    ),
    text: `Nuevo pedido #${input.orderId.slice(0, 8).toUpperCase()} en ${input.storeName}. Total: ${formatMoney(input.totalCents)}.`,
  });
}

export function sendOrderShippedEmail(input: OrderEmailInput) {
  return sendEmail({
    to: input.customerEmail,
    subject: `Tu pedido de ${input.storeName} fue enviado`,
    html: shell(
      "Tu pedido va en camino",
      `<p>${input.customerName ? `Hola ${escapeHtml(input.customerName)},` : "Hola,"}</p>
       <p>Tu pedido de <strong>${escapeHtml(input.storeName)}</strong> ya fue marcado como enviado.</p>
       <div style="margin:20px 0;padding:16px;border-radius:16px;background:#fff8f4;">
         <p style="margin:0;">Tracking: <strong>${escapeHtml(input.trackingNumber ?? "")}</strong></p>
         <p style="margin:6px 0 0;">Carrier: <strong>${escapeHtml(input.carrier ?? "Carrier pendiente")}</strong></p>
         ${input.service ? `<p style="margin:6px 0 0;">Servicio: <strong>${escapeHtml(input.service)}</strong></p>` : ""}
       </div>`
    ),
    text: `Tu pedido fue enviado. Tracking: ${input.trackingNumber ?? ""}. Carrier: ${input.carrier ?? ""}.`,
  });
}

export function sendSubscriptionCreatedEmail(input: {
  to?: string | null;
  storeName: string;
  plan: string;
  interval: string;
}) {
  return sendEmail({
    to: input.to,
    subject: `Tu suscripción ${input.plan} está activa`,
    html: shell(
      "Tu plan está activo",
      `<p>La suscripción de <strong>${escapeHtml(input.storeName)}</strong> quedó activa.</p>
       <p>Plan: <strong>${escapeHtml(input.plan)}</strong><br />Frecuencia: <strong>${escapeHtml(input.interval === "year" ? "Anual" : "Mensual")}</strong></p>
       ${button("Ir a planes y pagos", `${appUrl()}/dashboard/billing`)}`
    ),
    text: `La suscripción de ${input.storeName} quedó activa. Plan: ${input.plan}.`,
  });
}

export function sendPaymentFailedEmail(input: { to?: string | null; storeName: string }) {
  return sendEmail({
    to: input.to,
    subject: "Tu pago está pendiente, pero tu tienda sigue activa",
    html: shell(
      "Tu tienda sigue activa",
      `<p>El pago de <strong>${escapeHtml(input.storeName)}</strong> quedó pendiente.</p>
       <p>No te preocupes: tu dashboard, tu tienda pública y tu checkout siguen funcionando. Solo actualiza tu método de pago cuando puedas.</p>
       ${button("Actualizar facturación", `${appUrl()}/dashboard/billing`)}`
    ),
    text: `Tu pago está pendiente. Tu tienda sigue activa. Actualiza facturación aquí: ${appUrl()}/dashboard/billing`,
  });
}

export function sendSubscriptionRenewedEmail(input: { to?: string | null; storeName: string }) {
  return sendEmail({
    to: input.to,
    subject: "Tu suscripción de NBL Shop fue renovada",
    html: shell(
      "Renovación confirmada",
      `<p>La suscripción de <strong>${escapeHtml(input.storeName)}</strong> fue renovada correctamente.</p>
       <p>Gracias por seguir creciendo con NBL Shop.</p>`
    ),
    text: `La suscripción de ${input.storeName} fue renovada correctamente.`,
  });
}
