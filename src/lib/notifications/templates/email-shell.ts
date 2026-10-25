import { LEGAL_NAME, SHORT_BRAND } from "@/lib/brand";

/** Inline brand tokens — email clients ignore CSS variables. */
export const EMAIL_BRAND = {
  charcoal: "#20201e",
  warmWhite: "#f5f1e8",
  burntOrange: "#f07836",
  muted: "#5c5a54",
  paper: "#e8e2d6",
  white: "#ffffff",
} as const;

/** Content-ID for the inline logo attachment (cid:…). */
export const EMAIL_LOGO_CID = "ipshap-logo";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Ensure From shows a brand display name when only a bare address is configured. */
export function brandedFromAddress(
  from: string,
  displayName = SHORT_BRAND,
): string {
  const trimmed = from.trim();
  if (trimmed.includes("<") && trimmed.includes(">")) return trimmed;
  return `${displayName} <${trimmed}>`;
}

export type BrandedEmailContent = {
  subject: string;
  preheader: string;
  text: string;
  html: string;
};

export type BrandedEmailShellInput = {
  subject: string;
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  /** Optional HTML block under the intro (lists, paragraphs). */
  bodyHtml?: string;
  ctaLabel: string;
  ctaUrl: string;
  footerNote?: string;
  logoUrl: string;
  appUrl: string;
  textLines: string[];
};

/** Shared charcoal header + warm card used by order alerts and auth emails. */
export function buildBrandedEmailShell(
  input: BrandedEmailShellInput,
): BrandedEmailContent {
  const {
    subject,
    preheader,
    eyebrow,
    title,
    intro,
    bodyHtml = "",
    ctaLabel,
    ctaUrl,
    footerNote = "You’re receiving this because of your IP SHAP admin account.",
    logoUrl,
    appUrl,
    textLines,
  } = input;

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
                ${escapeHtml(eyebrow)}
              </p>
              <h1 style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;color:${EMAIL_BRAND.charcoal};font-weight:400;">
                ${escapeHtml(title)}
              </h1>
              <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:${EMAIL_BRAND.muted};">
                ${escapeHtml(intro)}
              </p>
            </td>
          </tr>
          ${
            bodyHtml
              ? `<tr><td style="padding:20px 28px 0;">${bodyHtml}</td></tr>`
              : ""
          }
          <tr>
            <td style="padding:24px 28px 32px;" align="center">
              <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:${EMAIL_BRAND.burntOrange};color:${EMAIL_BRAND.charcoal};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:14px 28px;border:2px solid ${EMAIL_BRAND.charcoal};">
                ${escapeHtml(ctaLabel)}
              </a>
              <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${EMAIL_BRAND.muted};word-break:break-all;">
                Or paste this link into your browser:<br />
                <a href="${escapeHtml(ctaUrl)}" style="color:${EMAIL_BRAND.charcoal};">${escapeHtml(ctaUrl)}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:${EMAIL_BRAND.charcoal};padding:20px 28px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${EMAIL_BRAND.warmWhite};">
                ${escapeHtml(LEGAL_NAME)} · Kigali, Rwanda
              </p>
              <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(245,241,232,0.65);">
                ${escapeHtml(footerNote)} · <a href="${escapeHtml(appUrl)}" style="color:${EMAIL_BRAND.burntOrange};text-decoration:none;">${escapeHtml(appUrl.replace(/^https?:\/\//, ""))}</a>
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
