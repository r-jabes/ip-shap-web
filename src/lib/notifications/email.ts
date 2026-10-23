import { readFile } from "node:fs/promises";
import path from "node:path";
import { getPublicEnv, getServerEnv } from "@/lib/env";
import {
  brandedFromAddress,
  buildNewOrderStaffEmail,
  ORDER_EMAIL_LOGO_CID,
} from "@/lib/notifications/templates/new-order";
import type { StoredOrder } from "@/lib/orders/store";

export type StaffEmailResult =
  | { ok: true; skipped?: "not_configured" | "no_recipients" }
  | { ok: false; error: string };

function parseRecipients(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.includes("@"));
}

async function loadLogoAttachment(): Promise<{
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
      contentId: ORDER_EMAIL_LOGO_CID,
    };
  } catch (error) {
    console.error(
      JSON.stringify({
        type: "order_email_logo_read_error",
        message: error instanceof Error ? error.message : String(error),
      }),
    );
    return null;
  }
}

/**
 * Email staff about a new order via Resend (branded HTML + plain text).
 * Failures must not roll back the order — callers log and continue.
 */
export async function sendNewOrderStaffEmail(
  order: StoredOrder,
): Promise<StaffEmailResult> {
  const env = getServerEnv();
  const from = env.EMAIL_FROM;
  const apiKey = env.RESEND_API_KEY;
  const recipients = parseRecipients(env.ORDER_NOTIFY_EMAILS);

  if (!from || !apiKey) {
    return { ok: true, skipped: "not_configured" };
  }
  if (recipients.length === 0) {
    return { ok: true, skipped: "no_recipients" };
  }

  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const adminUrl = `${appUrl}/admin/orders/${order.id}`;
  const logoAttachment = await loadLogoAttachment();
  // Inline CID so Gmail/Outlook do not depend on fetching the live site (which
  // often shows a broken image when NEXT_PUBLIC_APP_URL is wrong or blocked).
  const logoUrl = logoAttachment
    ? `cid:${ORDER_EMAIL_LOGO_CID}`
    : `${appUrl}/branding/main-logo-reversed.png`;
  const content = buildNewOrderStaffEmail({
    order,
    adminUrl,
    logoUrl,
    appUrl,
  });

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: brandedFromAddress(from),
        to: recipients,
        subject: content.subject,
        text: content.text,
        html: content.html,
        headers: {
          "X-Entity-Ref-ID": order.id,
        },
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
