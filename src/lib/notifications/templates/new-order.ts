import { LEGAL_NAME, SHORT_BRAND } from "@/lib/brand";
import { formatRwf } from "@/lib/money";
import type { StoredOrder } from "@/lib/orders/store";

/** Inline brand tokens — email clients ignore CSS variables. */
export const EMAIL_BRAND = {
  charcoal: "#20201e",
  warmWhite: "#f5f1e8",
  burntOrange: "#f07836",
  muted: "#5c5a54",
  paper: "#e8e2d6",
  white: "#ffffff",
} as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function channelLabel(channel: StoredOrder["channel"]): string {
  switch (channel) {
    case "online_payment":
      return "Online payment";
    case "whatsapp_assisted":
    default:
      return "In-app order";
  }
}

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Africa/Kigali",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export type NewOrderEmailContent = {
  subject: string;
  preheader: string;
  text: string;
  html: string;
};

/**
 * Branded staff alert for a newly placed order.
 * HTML is table-based for Outlook / Gmail / Apple Mail compatibility.
 */
export function buildNewOrderStaffEmail(input: {
  order: StoredOrder;
  adminUrl: string;
  logoUrl: string;
  appUrl: string;
}): NewOrderEmailContent {
  const { order, adminUrl, logoUrl, appUrl } = input;
  const subject = `${SHORT_BRAND} · New order ${order.reference}`;
  const preheader = `${order.customerName} · ${formatRwf(order.total.amount)} · awaiting confirmation`;
  const when = formatWhen(order.createdAt);
  const channel = channelLabel(order.channel);
  const delivery =
    order.deliveryFee === null
      ? "To confirm"
      : formatRwf(order.deliveryFee.amount);

  const textLines = [
    `${SHORT_BRAND} — new order`,
    "",
    `Reference: ${order.reference}`,
    `Placed: ${when} (Africa/Kigali)`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Channel: ${channel}`,
    `Fulfilment: ${order.fulfilmentStatus.replaceAll("_", " ")}`,
    `Payment: ${order.paymentStatus.replaceAll("_", " ")}`,
    "",
    "Items",
    ...order.items.map(
      (item) =>
        `  ${item.quantity} × ${item.productName} — ${formatRwf(item.lineTotal.amount)}`,
    ),
    "",
    `Subtotal: ${formatRwf(order.subtotal.amount)}`,
    `Delivery: ${delivery}`,
    `Total: ${formatRwf(order.total.amount)}`,
    "",
    `Open in admin: ${adminUrl}`,
    "",
    "—",
    LEGAL_NAME,
    "Kigali, Rwanda",
    appUrl,
  ];

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${EMAIL_BRAND.paper};font-family:Georgia,'Times New Roman',serif;font-size:15px;color:${EMAIL_BRAND.charcoal};">
          ${escapeHtml(item.productName)}
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${EMAIL_BRAND.muted};margin-top:2px;">Qty ${item.quantity}</div>
        </td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid ${EMAIL_BRAND.paper};font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${EMAIL_BRAND.charcoal};white-space:nowrap;">
          ${escapeHtml(formatRwf(item.lineTotal.amount))}
        </td>
      </tr>`,
    )
    .join("");

  const meta = [
    ["Reference", order.reference],
    ["Placed", `${when} · Africa/Kigali`],
    ["Customer", order.customerName],
    ["Phone", order.customerPhone],
    ["Channel", channel],
    ["Fulfilment", order.fulfilmentStatus.replaceAll("_", " ")],
    ["Payment", order.paymentStatus.replaceAll("_", " ")],
  ]
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${EMAIL_BRAND.muted};width:34%;">${escapeHtml(label)}</td>
        <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${EMAIL_BRAND.charcoal};font-weight:600;">${escapeHtml(value)}</td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_BRAND.paper};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${EMAIL_BRAND.paper};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${EMAIL_BRAND.warmWhite};border:2px solid ${EMAIL_BRAND.charcoal};">
          <tr>
            <td style="background:${EMAIL_BRAND.charcoal};padding:22px 28px;">
              <img src="${escapeHtml(logoUrl)}" width="168" height="49" alt="${escapeHtml(LEGAL_NAME)}" style="display:block;border:0;height:auto;max-width:168px;" />
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;border-bottom:3px solid ${EMAIL_BRAND.burntOrange};">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${EMAIL_BRAND.burntOrange};font-weight:700;">
                Staff alert
              </p>
              <h1 style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;color:${EMAIL_BRAND.charcoal};font-weight:400;">
                New order placed
              </h1>
              <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:${EMAIL_BRAND.muted};">
                A customer completed checkout on the storefront. Stock for counted items was reserved at place.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${meta}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 8px;">
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL_BRAND.muted};font-weight:700;">
                Line items
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${itemRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${EMAIL_BRAND.muted};padding:4px 0;">Subtotal</td>
                  <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${EMAIL_BRAND.charcoal};padding:4px 0;">${escapeHtml(formatRwf(order.subtotal.amount))}</td>
                </tr>
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${EMAIL_BRAND.muted};padding:4px 0;">Delivery</td>
                  <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${EMAIL_BRAND.charcoal};padding:4px 0;">${escapeHtml(delivery)}</td>
                </tr>
                <tr>
                  <td style="font-family:Georgia,'Times New Roman',serif;font-size:18px;color:${EMAIL_BRAND.charcoal};padding:12px 0 0;">Total</td>
                  <td align="right" style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${EMAIL_BRAND.burntOrange};padding:12px 0 0;font-weight:400;">${escapeHtml(formatRwf(order.total.amount))}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 32px;" align="center">
              <a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:${EMAIL_BRAND.burntOrange};color:${EMAIL_BRAND.charcoal};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:14px 28px;border:2px solid ${EMAIL_BRAND.charcoal};">
                Open order in admin
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:${EMAIL_BRAND.charcoal};padding:20px 28px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${EMAIL_BRAND.warmWhite};">
                ${escapeHtml(LEGAL_NAME)} · Kigali, Rwanda
              </p>
              <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(245,241,232,0.65);">
                Internal staff notification · <a href="${escapeHtml(appUrl)}" style="color:${EMAIL_BRAND.burntOrange};text-decoration:none;">${escapeHtml(appUrl.replace(/^https?:\/\//, ""))}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    subject,
    preheader,
    text: textLines.join("\n"),
    html,
  };
}

/** Ensure From shows a brand display name when only a bare address is configured. */
export function brandedFromAddress(from: string): string {
  const trimmed = from.trim();
  if (trimmed.includes("<") && trimmed.includes(">")) return trimmed;
  return `${SHORT_BRAND} Orders <${trimmed}>`;
}
