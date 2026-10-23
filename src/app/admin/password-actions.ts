"use server";

import { headers } from "next/headers";
import {
  generateAuthActionLink,
  passwordResetRedirectUrl,
} from "@/lib/admin/auth-links";
import { fetchActiveAdminProfile } from "@/lib/admin/profiles";
import { sendPasswordResetEmail } from "@/lib/notifications/email";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { hasSupabaseServiceConfig } from "@/lib/supabase/config";

const GENERIC_RESET_SENT =
  "If an account exists for that email, you will receive reset instructions shortly.";

export async function requestAdminPasswordResetAction(
  formData: FormData,
): Promise<{ error?: string; ok?: boolean; message?: string }> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = await consumeRateLimit(`admin-reset:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return { error: "Too many attempts. Please wait and try again." };
  }

  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email address." };
  }

  if (!hasSupabaseServiceConfig()) {
    return {
      error: "Password reset is temporarily unavailable. Please try again later.",
    };
  }

  // Build a recovery link only when Auth already has this email (errors otherwise).
  // Only send when they also have an active admin profile.
  const link = await generateAuthActionLink({
    type: "recovery",
    email,
    redirectTo: passwordResetRedirectUrl(),
  });

  if (link.ok) {
    const profile = await fetchActiveAdminProfile(link.userId);
    if (profile) {
      const emailed = await sendPasswordResetEmail({
        to: email,
        actionUrl: link.actionUrl,
      });
      if (!emailed.ok) {
        console.error(
          JSON.stringify({
            type: "admin_password_reset_email_error",
            message: emailed.error,
            skipped: emailed.skipped ?? null,
          }),
        );
      }
    }
  }

  // Always generic — do not reveal whether the email exists.
  return { ok: true, message: GENERIC_RESET_SENT };
}
