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

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "The database is not configured (set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY). Refusing to use temporary in-memory storage in production.",
    );
    this.name = "StorageNotConfiguredError";
  }
}

/**
 * Whether orders, stock and admin data live in the database.
 *
 * Local development and tests may run without Supabase and use throwaway in-memory data. In
 * production that would silently lose orders on the next restart, so this throws instead —
 * the failure is loud, shows up in monitoring and on `/api/health`, and nothing is lost.
 */
export function hasDurableStorage(): boolean {
  if (hasSupabaseServiceConfig()) return true;
  if (process.env.NODE_ENV === "production") throw new StorageNotConfiguredError();
  return false;
}
