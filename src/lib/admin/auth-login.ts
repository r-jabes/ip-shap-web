import { randomUUID } from "node:crypto";
import { fetchActiveAdminProfile } from "@/lib/admin/profiles";
import type { AdminRole } from "@/lib/admin/roles";
import { safeEqualString } from "@/lib/admin/session";
import { getServerEnv } from "@/lib/env";
import { getSupabaseAnonClient } from "@/lib/supabase/anon";
import { hasSupabaseAnonConfig } from "@/lib/supabase/config";

export const GENERIC_AUTH_ERROR = "Invalid credentials.";

export type LoginSuccess = {
  ok: true;
  session: { sub: string; email: string; role: AdminRole };
};

export type LoginFailure = { ok: false; error: string };

/**
 * Primary path: Supabase Auth email/password + active admin_profiles row.
 * Break-glass: ADMIN_BOOTSTRAP_TOKEN (optional email allow-list).
 */
export async function resolveAdminLogin(input: {
  email: string;
  password: string;
  bootstrapToken: string;
}): Promise<LoginSuccess | LoginFailure> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const bootstrapToken = input.bootstrapToken;

  if (!email) {
    return { ok: false, error: GENERIC_AUTH_ERROR };
  }

  if (password) {
    return signInWithSupabase(email, password);
  }

  if (bootstrapToken) {
    return signInWithBootstrap(email, bootstrapToken);
  }

  return { ok: false, error: GENERIC_AUTH_ERROR };
}

async function signInWithSupabase(
  email: string,
  password: string,
): Promise<LoginSuccess | LoginFailure> {
  if (!hasSupabaseAnonConfig()) {
    return {
      ok: false,
      error:
        "Supabase Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const client = getSupabaseAnonClient();
  if (!client) {
    return { ok: false, error: GENERIC_AUTH_ERROR };
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  // Always clear the anon session cookie jar — we use HMAC admin cookies instead.
  await client.auth.signOut({ scope: "local" }).catch(() => undefined);

  if (error || !data.user) {
    return { ok: false, error: GENERIC_AUTH_ERROR };
  }

  const profile = await fetchActiveAdminProfile(data.user.id);
  if (!profile) {
    return { ok: false, error: GENERIC_AUTH_ERROR };
  }

  return {
    ok: true,
    session: {
      sub: data.user.id,
      email: data.user.email?.toLowerCase() ?? email,
      role: profile.role,
    },
  };
}

function signInWithBootstrap(
  email: string,
  token: string,
): LoginSuccess | LoginFailure {
  const env = getServerEnv();

  if (!env.ADMIN_SESSION_SECRET || !env.ADMIN_BOOTSTRAP_TOKEN) {
    return {
      ok: false,
      error:
        "Break-glass login is not configured. Use Supabase Auth, or set ADMIN_SESSION_SECRET and ADMIN_BOOTSTRAP_TOKEN.",
    };
  }

  if (env.ADMIN_BOOTSTRAP_EMAIL && email !== env.ADMIN_BOOTSTRAP_EMAIL) {
    return { ok: false, error: GENERIC_AUTH_ERROR };
  }

  if (!safeEqualString(token, env.ADMIN_BOOTSTRAP_TOKEN)) {
    return { ok: false, error: GENERIC_AUTH_ERROR };
  }

  return {
    ok: true,
    session: {
      sub: `bootstrap:${randomUUID()}`,
      email,
      role: "owner",
    },
  };
}
