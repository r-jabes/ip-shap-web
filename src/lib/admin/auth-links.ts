import { getPublicEnv } from "@/lib/env";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export function passwordResetRedirectUrl(): string {
  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return `${appUrl}/admin/reset-password`;
}

export function inviteAcceptRedirectUrl(): string {
  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return `${appUrl}/admin/accept-invite`;
}

/**
 * Builds a one-time Auth action link without sending Supabase's own email.
 * We send a branded Resend message with this URL instead.
 */
export async function generateAuthActionLink(input: {
  type: "invite" | "recovery";
  email: string;
  redirectTo: string;
}): Promise<
  | { ok: true; actionUrl: string; userId: string }
  | { ok: false; error: string }
> {
  const client = getSupabaseServiceClient();
  if (!client) {
    return { ok: false, error: "Supabase service role is not configured." };
  }

  const { data, error } = await client.auth.admin.generateLink({
    type: input.type,
    email: input.email.trim().toLowerCase(),
    options: { redirectTo: input.redirectTo },
  });

  if (error || !data?.properties?.action_link || !data.user?.id) {
    return {
      ok: false,
      error: error?.message ?? "Could not create the email link.",
    };
  }

  return {
    ok: true,
    actionUrl: data.properties.action_link,
    userId: data.user.id,
  };
}
