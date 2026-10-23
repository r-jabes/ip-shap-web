import { getPublicEnv, getServerEnv } from "@/lib/env";
import {
  resolveEmailLogoUrl,
  sendResendEmail,
} from "@/lib/notifications/resend";
import { buildNewOrderStaffEmail } from "@/lib/notifications/templates/new-order";
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

/**
 * Email staff about a new order via Resend (branded HTML + plain text).
 * Failures must not roll back the order — callers log and continue.
 */
export async function sendNewOrderStaffEmail(
  order: StoredOrder,
): Promise<StaffEmailResult> {
  const env = getServerEnv();
  const recipients = parseRecipients(env.ORDER_NOTIFY_EMAILS);

  if (!env.EMAIL_FROM || !env.RESEND_API_KEY) {
    return { ok: true, skipped: "not_configured" };
  }
  if (recipients.length === 0) {
    return { ok: true, skipped: "no_recipients" };
  }

  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const content = buildNewOrderStaffEmail({
    order,
    adminUrl: `${appUrl}/admin/orders/${order.id}`,
    logoUrl: await resolveEmailLogoUrl(),
    appUrl,
  });

  const result = await sendResendEmail({
    to: recipients,
    content,
    entityRefId: order.id,
  });
  if (!result.ok) {
    if (result.skipped === "not_configured") {
      return { ok: true, skipped: "not_configured" };
    }
    return { ok: false, error: result.error };
  }
  return { ok: true };
}

export async function sendInviteEmail(input: {
  to: string;
  actionUrl: string;
  recipientName?: string | null;
  alreadyHadAccount?: boolean;
}): Promise<ResendSendResult> {
  const { buildInviteEmail } = await import(
    "@/lib/notifications/templates/auth-email"
  );
  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const content = buildInviteEmail({
    actionUrl: input.actionUrl,
    logoUrl: await resolveEmailLogoUrl(),
    appUrl,
    recipientName: input.recipientName,
    alreadyHadAccount: input.alreadyHadAccount,
  });
  return sendResendEmail({ to: input.to, content, entityRefId: `invite:${input.to}` });
}

export async function sendPasswordResetEmail(input: {
  to: string;
  actionUrl: string;
}): Promise<ResendSendResult> {
  const { buildPasswordResetEmail } = await import(
    "@/lib/notifications/templates/auth-email"
  );
  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const content = buildPasswordResetEmail({
    actionUrl: input.actionUrl,
    logoUrl: await resolveEmailLogoUrl(),
    appUrl,
  });
  return sendResendEmail({
    to: input.to,
    content,
    entityRefId: `reset:${input.to}`,
  });
}

type ResendSendResult = Awaited<ReturnType<typeof sendResendEmail>>;
