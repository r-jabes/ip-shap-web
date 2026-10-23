import { hasDurableStorage } from "@/lib/supabase/config";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

/** Stock history and the admin activity log are kept this long, then deleted. */
export const HISTORY_RETENTION_MONTHS = 12;

export type HistoryPurgeResult = { stockRows: number; auditRows: number };

/** Deletes stock history and activity-log rows older than the retention period. */
export async function purgeOldHistory(): Promise<HistoryPurgeResult> {
  if (!hasDurableStorage()) return { stockRows: 0, auditRows: 0 };
  const { data, error } = await getSupabaseServiceClient()!.rpc(
    "purge_old_history",
    { p_months: HISTORY_RETENTION_MONTHS },
  );
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  return {
    stockRows: Number(row?.stock_rows ?? 0),
    auditRows: Number(row?.audit_rows ?? 0),
  };
}
