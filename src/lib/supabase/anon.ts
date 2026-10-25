import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";
import { hasSupabaseAnonConfig } from "@/lib/supabase/config";

let cached: SupabaseClient | null | undefined;

/**
 * Browser-safe anon client. RLS applies. Returns null when URL/key unset.
 * Do not use for admin writes or order lookup.
 */
export function getSupabaseAnonClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  if (!hasSupabaseAnonConfig()) {
    cached = null;
    return cached;
  }
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    getPublicEnv();
  cached = createClient(
    NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
  return cached;
}

/** Test helper — clears the singleton after env stubs. */
export function resetSupabaseAnonClientForTests() {
  cached = undefined;
}
