import { getPublicEnv, getServerEnv } from "@/lib/env";

/** True when public Supabase URL + anon key are both set. */
export function hasSupabaseAnonConfig(): boolean {
  const env = getPublicEnv();
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** True when service role is available (server only). */
export function hasSupabaseServiceConfig(): boolean {
  if (!hasSupabaseAnonConfig()) return false;
  return Boolean(getServerEnv().SUPABASE_SERVICE_ROLE_KEY);
}
