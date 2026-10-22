"use server";

import { headers } from "next/headers";
import { getPublicEnv } from "@/lib/env";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { getSupabaseAnonClient } from "@/lib/supabase/anon";
import { hasSupabaseAnonConfig } from "@/lib/supabase/config";

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
  const limit = consumeRateLimit(`admin-reset:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return { error: "Too many attempts. Please wait and try again." };
  }

  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email address." };
  }

  if (!hasSupabaseAnonConfig()) {
    return {
      error: "Password reset is temporarily unavailable. Please try again later.",
    };
  }

  const client = getSupabaseAnonClient();
  if (!client) {
    return {
      error: "Password reset is temporarily unavailable. Please try again later.",
    };
  }

  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/admin/reset-password`,
  });

  if (error) {
    console.error(
      JSON.stringify({
        type: "admin_password_reset_error",
        message: error.message,
      }),
    );
  }

  // Always generic — do not reveal whether the email exists.
  return { ok: true, message: GENERIC_RESET_SENT };
}
