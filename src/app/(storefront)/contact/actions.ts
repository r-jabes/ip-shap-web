"use server";

import { headers } from "next/headers";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

export type ContactBotState = {
  ok?: boolean;
  error?: string;
};

/**
 * Gate for the contact enquiry hand-off (WhatsApp / mailto).
 * When Turnstile is configured, a valid token is required before the client opens an external app.
 */
export async function verifyContactBotAction(
  _prev: ContactBotState,
  formData: FormData,
): Promise<ContactBotState> {
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = await consumeRateLimit(`contact-bot:${ip}`, 30, 15 * 60 * 1000);
  if (!limit.ok) {
    return { error: "Too many attempts. Please wait and try again." };
  }

  const turnstile = await verifyTurnstileToken(
    String(formData.get("cf-turnstile-response") ?? ""),
    ip,
  );
  if (!turnstile.ok) {
    return {
      error:
        turnstile.reason === "missing_token"
          ? "Please complete the bot check and try again."
          : "Bot check failed. Refresh the page and try again.",
    };
  }

  return { ok: true };
}
