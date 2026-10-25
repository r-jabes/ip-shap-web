import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv, getServerEnv } from "@/lib/env";
import {
  hasSupabaseAnonConfig,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/config";

let cachedService: SupabaseClient | null | undefined;
let cachedAnon: SupabaseClient | null | undefined;

/**
 * Service-role client. Bypasses RLS — server / route handlers / actions only.
 * Never import this module from Client Components.
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  if (cachedService !== undefined) return cachedService;
  if (!hasSupabaseServiceConfig()) {
    cachedService = null;
    return cachedService;
  }
  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicEnv();
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
  cachedService = createClient(
    NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
  return cachedService;
}

/**
 * Server-side anon client (RLS enforced). Prefer this for public catalogue reads
 * when you do not need inventory joins.
 */
export function getSupabaseServerAnonClient(): SupabaseClient | null {
  if (cachedAnon !== undefined) return cachedAnon;
  if (!hasSupabaseAnonConfig()) {
    cachedAnon = null;
    return cachedAnon;
  }
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    getPublicEnv();
  cachedAnon = createClient(
    NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
  return cachedAnon;
}

/**
 * Prefer service role when present (inventory joins); otherwise anon under RLS.
 */
export function getSupabaseDataClient(): SupabaseClient | null {
  return getSupabaseServiceClient() ?? getSupabaseServerAnonClient();
}

export function resetSupabaseServerClientsForTests() {
  cachedService = undefined;
  cachedAnon = undefined;
}
