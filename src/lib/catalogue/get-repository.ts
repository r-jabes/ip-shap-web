import { createMemoryCatalogueRepository } from "@/lib/catalogue/memory-repository";
import type { CatalogueRepository } from "@/lib/catalogue/repository";
import { createSupabaseCatalogueRepository } from "@/lib/catalogue/supabase-repository";
import { isDemoMode } from "@/lib/env";
import { getSupabaseDataClient } from "@/lib/supabase/server";

/**
 * Resolves the catalogue system of record:
 * - Demo mode → in-memory fixtures
 * - Otherwise → Supabase when configured, else empty (fail closed)
 */
export function getCatalogueRepository(): CatalogueRepository {
  if (isDemoMode()) {
    return createMemoryCatalogueRepository({ enabled: true });
  }

  const client = getSupabaseDataClient();
  if (client) {
    return createSupabaseCatalogueRepository(client);
  }

  return createMemoryCatalogueRepository({ enabled: false });
}
