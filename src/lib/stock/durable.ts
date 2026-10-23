import type { ProductAvailability } from "@/domain/catalogue";
import { resolveActorEmails } from "@/lib/admin/audit-durable";
import type { AdminSession } from "@/lib/admin/session";
import {
  adminAdjustStock,
  adminListAdjustments,
  type StockAdjustmentRecord,
} from "@/lib/admin/store";
import { hasDurableStorage } from "@/lib/supabase/config";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function adjustStockDurable(
  actor: AdminSession,
  input: {
    productId: string;
    newQuantity: number | null;
    newAvailability: ProductAvailability;
    reason: string;
    expectedQuantity?: number | null;
  },
): Promise<StockAdjustmentRecord> {
  if (!hasDurableStorage()) {
    return adminAdjustStock(actor, input);
  }

  const client = getSupabaseServiceClient()!;
  const actorId = actor.sub.startsWith("bootstrap:") ? null : actor.sub;
  const { error } = await client.rpc("adjust_inventory_level", {
    p_product_id: input.productId,
    p_new_quantity: input.newQuantity,
    p_new_availability: input.newAvailability,
    p_reason: input.reason,
    p_expected_quantity:
      input.expectedQuantity === undefined ? null : input.expectedQuantity,
    p_actor_user_id: actorId,
  });
  if (error) throw new Error(error.message);

  return {
    id: crypto.randomUUID(),
    productId: input.productId,
    actorEmail: actor.email,
    previousQuantity: input.expectedQuantity ?? null,
    newQuantity: input.newQuantity,
    previousAvailability: "unknown",
    newAvailability: input.newAvailability,
    reason: input.reason,
    createdAt: new Date().toISOString(),
  };
}

export async function listAdjustmentsDurable(
  limit = 25,
): Promise<StockAdjustmentRecord[]> {
  if (!hasDurableStorage()) {
    return adminListAdjustments(limit);
  }

  const client = getSupabaseServiceClient()!;
  const { data, error } = await client
    .from("stock_adjustments")
    .select(
      "id, product_id, previous_quantity, new_quantity, previous_availability, new_availability, reason, created_at, actor_user_id",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  const emails = await resolveActorEmails(
    (data ?? []).map((row) => row.actor_user_id),
  );

  return (data ?? []).map((row) => ({
    id: row.id,
    productId: row.product_id,
    actorEmail: row.actor_user_id
      ? (emails.get(row.actor_user_id) ?? "A team member")
      : "System",
    previousQuantity: row.previous_quantity,
    newQuantity: row.new_quantity,
    previousAvailability: row.previous_availability,
    newAvailability: row.new_availability,
    reason: row.reason,
    createdAt: row.created_at,
  }));
}

/** Call after durable order + items insert — not on confirm/payment. */
export async function reserveOrderStockDurable(orderId: string): Promise<void> {
  if (!hasDurableStorage()) return;
  const client = getSupabaseServiceClient()!;
  const { error } = await client.rpc("reserve_order_stock", {
    p_order_id: orderId,
  });
  if (error) throw new Error(error.message);
}

export async function restoreOrderStockDurable(orderId: string): Promise<void> {
  if (!hasDurableStorage()) return;
  const client = getSupabaseServiceClient()!;
  const { error } = await client.rpc("restore_order_stock", {
    p_order_id: orderId,
  });
  if (error) throw new Error(error.message);
}
