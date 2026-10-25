import { logger } from "@/lib/logger";
import { cancelOrderDurable } from "@/lib/orders/durable";
import { UNPAID_HOLD_DAYS } from "@/lib/orders/hold-policy";
import { listOrders } from "@/lib/orders/store";
import { hasDurableStorage } from "@/lib/supabase/config";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export { UNPAID_HOLD_DAYS };

export const HOLD_EXPIRED_REASON = `Not confirmed within ${UNPAID_HOLD_DAYS} days — stock released automatically`;

const BATCH = 50;

export function holdCutoff(now: Date): Date {
  return new Date(now.getTime() - UNPAID_HOLD_DAYS * 24 * 60 * 60 * 1000);
}

async function findExpiredOrderIds(now: Date): Promise<string[]> {
  const cutoff = holdCutoff(now);

  if (!hasDurableStorage()) {
    return listOrders()
      .filter(
        (order) =>
          order.fulfilmentStatus === "awaiting_confirmation" &&
          order.paymentStatus !== "paid" &&
          new Date(order.createdAt) < cutoff,
      )
      .slice(0, BATCH)
      .map((order) => order.id);
  }

  const { data, error } = await getSupabaseServiceClient()!
    .from("orders")
    .select("id")
    .eq("fulfilment_status", "awaiting_confirmation")
    .neq("payment_status", "paid")
    .lt("created_at", cutoff.toISOString())
    .order("created_at", { ascending: true })
    .limit(BATCH);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.id as string);
}

/**
 * Cancels orders nobody confirmed or paid for within {@link UNPAID_HOLD_DAYS} days so their
 * reserved stock can be sold to someone else. Confirmed orders are never touched — the team
 * manages those. Safe to run repeatedly.
 */
export async function releaseExpiredHolds(
  now = new Date(),
): Promise<{ released: number; failed: number }> {
  const ids = await findExpiredOrderIds(now);
  let released = 0;
  let failed = 0;

  for (const id of ids) {
    try {
      await cancelOrderDurable(id, HOLD_EXPIRED_REASON, "system");
      released += 1;
    } catch (error) {
      failed += 1;
      logger.error("Could not release an expired order hold", {
        orderId: id,
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }
  return { released, failed };
}
