import { logger } from "@/lib/logger";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Per-instance counter. Used for local development and as a safety net if the database is unreachable. */
function consumeInMemory(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (current.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  current.count += 1;
  return { ok: true };
}

/**
 * Counts one attempt for `key` and says whether it is allowed.
 *
 * With Supabase configured the count lives in the `rate_limits` table (via the atomic
 * `consume_rate_limit` function), so the limit holds across every server instance. Without it —
 * or if the database call fails — it falls back to a per-instance counter, so a database blip
 * never locks real customers out.
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const client = getSupabaseServiceClient();
  if (!client) return consumeInMemory(key, limit, windowMs);

  try {
    const { data, error } = await client.rpc("consume_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || typeof row.allowed !== "boolean") {
      throw new Error("Unexpected rate limit response");
    }
    return row.allowed
      ? { ok: true }
      : { ok: false, retryAfterSec: Math.max(1, Number(row.retry_after) || 1) };
  } catch (error) {
    logger.warn("Shared rate limit unavailable, using per-instance limit", {
      reason: error instanceof Error ? error.message : "unknown",
    });
    return consumeInMemory(key, limit, windowMs);
  }
}

export function resetRateLimitForTests() {
  buckets.clear();
}
