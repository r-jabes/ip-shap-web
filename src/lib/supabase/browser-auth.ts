"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser anon client for Auth recovery flows (detects session from URL).
 * Not for catalogue reads — use the shared anon helper server-side instead.
 */
export function createBrowserAuthClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });
}
