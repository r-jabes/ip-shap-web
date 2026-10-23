import { readFile } from "node:fs/promises";
import path from "node:path";
import { getPublicEnv, getServerEnv } from "@/lib/env";
import {
  brandedFromAddress,
  EMAIL_LOGO_CID,
  type BrandedEmailContent,
} from "@/lib/notifications/templates/email-shell";

export type ResendSendResult =
  | { ok: true }
  | { ok: false; error: string; skipped?: "not_configured" };

export async function loadEmailLogoAttachment(): Promise<{
  filename: string;
  content: string;
  contentId: string;
} | null> {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "branding",
      "main-logo-reversed.png",
    );
    const bytes = await readFile(filePath);
    return {
      filename: "ipshap-logo.png",
      content: bytes.toString("base64"),
      contentId: EMAIL_LOGO_CID,
    };
  } catch (error) {
    console.error(
      JSON.stringify({
        type: "email_logo_read_error",
        message: error instanceof Error ? error.message : String(error),
      }),
    );
    return null;
  }
}

/** Absolute or cid: logo URL for branded templates. */
export async function resolveEmailLogoUrl(): Promise<string> {
  const attachment = await loadEmailLogoAttachment();
  if (attachment) return `cid:${EMAIL_LOGO_CID}`;
  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return `${appUrl}/branding/main-logo-reversed.png`;
}

/**
 * Send one branded email via Resend (same From + logo as order alerts).
 * Returns skipped when EMAIL_FROM / RESEND_API_KEY are missing.
 */
export async function sendResendEmail(input: {
  to: string | string[];
  content: BrandedEmailContent;
  /** Optional idempotency / tracing header. */
  entityRefId?: string;
}): Promise<ResendSendResult> {
  const env = getServerEnv();
  const from = env.EMAIL_FROM;
  const apiKey = env.RESEND_API_KEY;
  if (!from || !apiKey) {
    return { ok: false, error: "Email is not configured.", skipped: "not_configured" };
  }

  const logoAttachment = await loadEmailLogoAttachment();
  const to = Array.isArray(input.to) ? input.to : [input.to];

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: brandedFromAddress(from),
        to,
        subject: input.content.subject,
        text: input.content.text,
        html: input.content.html,
        ...(input.entityRefId
          ? { headers: { "X-Entity-Ref-ID": input.entityRefId } }
          : {}),
        ...(logoAttachment
          ? {
              attachments: [
                {
                  filename: logoAttachment.filename,
                  content: logoAttachment.content,
                  content_id: logoAttachment.contentId,
                },
              ],
            }
          : {}),
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      return {
        ok: false,
        error: `Resend ${response.status}: ${body.slice(0, 200)}`,
      };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Email send failed",
    };
  }
}
