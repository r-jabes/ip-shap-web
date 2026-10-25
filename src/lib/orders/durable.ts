import { randomBytes } from "node:crypto";
import type { DemoProduct } from "@/domain/catalogue";
import { createDocumentId } from "@/lib/document-id";
import { getServerEnv } from "@/lib/env";
import { moneyRwf } from "@/lib/money";
import { getDeliveryZone } from "@/lib/orders/delivery";
import {
  mapOrderRow,
  type OrderHistoryRow,
  type OrderItemRow,
  type OrderRow,
} from "@/lib/orders/map-row";
import {
  isValidCheckoutPhone,
  normalizePhone,
  phonesMatch,
} from "@/lib/orders/phone";
import type { PaymentEvent } from "@/lib/payments/types";
import {
  applyPaymentStatusFromWebhook,
  cancelOrder,
  createOrder,
  getOrderById,
  getOrderByReference,
  listOrders,
  lookupOrder,
  markManualPayment,
  toOrderSummary,
  transitionFulfilment,
  type CreateOrderInput,
  type StoredOrder,
} from "@/lib/orders/store";
import { secureTokenEquals } from "@/lib/orders/token";
import type {
  FulfilmentStatus,
  FulfillmentMethod,
} from "@/lib/orders/transitions";
import { assertFulfilmentTransition } from "@/lib/orders/transitions";
import {
  availabilityAfterDecrement,
  isCountedStock,
} from "@/lib/stock/engine";
import {
  reserveOrderStockDurable,
  restoreOrderStockDurable,
} from "@/lib/stock/durable";
import { hasDurableStorage } from "@/lib/supabase/config";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { adminGetProduct } from "@/lib/admin/store";
import { getProductById } from "@/lib/catalogue";
import {
  assertValidPaymentAmount,
  describeManualPayment,
  type ManualPaymentInput,
} from "@/lib/orders/manual-payment";
import {
  insufficientStockMessage,
  unavailableMessage,
} from "@/lib/orders/stock-messages";

function isDurableOrdersEnabled(): boolean {
  return hasDurableStorage();
}

function makeLookupToken(): string {
  return randomBytes(24).toString("base64url");
}

function onlinePaymentEnabled(): boolean {
  return getServerEnv().ONLINE_PAYMENT_ENABLED === true;
}

function isPubliclyOrderable(product: DemoProduct): boolean {
  return (
    (product.status === "published" || product.status === "demo") &&
    product.availability !== "out_of_stock"
  );
}

async function productIdsInDatabase(ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const client = getSupabaseServiceClient()!;
  const { data, error } = await client
    .from("products")
    .select("id")
    .in("id", ids);
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row) => row.id as string));
}

async function loadProductForOrder(
  productId: string,
): Promise<DemoProduct | undefined> {
  const client = getSupabaseServiceClient()!;
  const { data, error } = await client
    .from("products")
    .select(
      "id, slug, name, description, price_rwf, status, availability, sku, inventory_levels ( quantity, availability )",
    )
    .eq("id", productId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data) {
    const inv = Array.isArray(data.inventory_levels)
      ? data.inventory_levels[0]
      : data.inventory_levels;
    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      description: data.description ?? "",
      price: moneyRwf(data.price_rwf),
      status: data.status,
      categorySlug: "uncategorised",
      images: [],
      isProvisional: false,
      brandSlug: "",
      brandName: "",
      availability: inv?.availability ?? data.availability ?? "unknown",
      demoLabel: "",
      stockQuantity: inv?.quantity ?? null,
      sku: data.sku ?? undefined,
    };
  }
  return adminGetProduct(productId) ?? getProductById(productId);
}

async function fetchOrderBundle(orderId: string): Promise<StoredOrder | null> {
  const client = getSupabaseServiceClient()!;
  const { data: order, error } = await client
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!order) return null;

  const { data: items, error: itemsError } = await client
    .from("order_items")
    .select(
      "product_id, product_name_snapshot, product_slug_snapshot, sku_snapshot, quantity, unit_price_rwf, line_total_rwf",
    )
    .eq("order_id", orderId);
  if (itemsError) throw new Error(itemsError.message);

  const { data: history, error: historyError } = await client
    .from("order_status_history")
    .select("from_fulfilment, to_fulfilment, reason, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (historyError) throw new Error(historyError.message);

  return mapOrderRow(
    order as OrderRow,
    (items ?? []) as OrderItemRow[],
    (history ?? []) as OrderHistoryRow[],
  );
}

async function createOrderInDatabase(
  input: CreateOrderInput,
): Promise<StoredOrder> {
  const client = getSupabaseServiceClient()!;

  const { data: existing, error: existingError } = await client
    .from("orders")
    .select("id")
    .eq("idempotency_key", input.idempotencyKey)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (existing?.id) {
    const prior = await fetchOrderBundle(existing.id);
    if (prior) return prior;
  }

  if (input.channel === "online_payment" && !onlinePaymentEnabled()) {
    throw new Error(
      "Online payment is not available yet. Choose checkout without online payment.",
    );
  }
  if (!isValidCheckoutPhone(input.customerPhone)) {
    throw new Error(
      "Enter a valid phone number (Rwanda 07… / +2507… preferred).",
    );
  }
  if (!input.customerName.trim()) {
    throw new Error("Customer name is required.");
  }
  if (input.items.length === 0) {
    throw new Error("Cart is empty.");
  }

  const method: FulfillmentMethod =
    input.fulfillmentMethod === "pickup" ? "pickup" : "delivery";

  const zone =
    method === "pickup" ? undefined : getDeliveryZone(input.deliveryZoneId);
  if (method === "delivery" && input.deliveryZoneId && !zone) {
    throw new Error("Selected delivery zone is not available.");
  }

  type LinePlan = {
    product: DemoProduct;
    quantity: number;
    unit: number;
    lineTotal: number;
  };
  const plans: LinePlan[] = [];
  let subtotalAmount = 0;
  const demandByProduct = new Map<string, { product: DemoProduct; qty: number }>();

  for (const line of input.items) {
    if (
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > 99
    ) {
      throw new Error("Invalid quantity.");
    }
    const product = await loadProductForOrder(line.productId);
    if (!product) {
      throw new Error(
        "An item in your cart is no longer available. Remove it from your cart and try again.",
      );
    }
    if (!isPubliclyOrderable(product)) {
      throw new Error(unavailableMessage(product.name));
    }
    const unit = product.price.amount;
    const lineTotal = unit * line.quantity;
    subtotalAmount += lineTotal;
    plans.push({ product, quantity: line.quantity, unit, lineTotal });
    const prior = demandByProduct.get(product.id);
    demandByProduct.set(product.id, {
      product,
      qty: (prior?.qty ?? 0) + line.quantity,
    });
  }

  for (const { product, qty } of demandByProduct.values()) {
    if (
      !isCountedStock({
        availability: product.availability,
        quantity: product.stockQuantity,
      })
    ) {
      continue;
    }
    const onHand = product.stockQuantity as number;
    if (onHand < qty) {
      throw new Error(insufficientStockMessage(product.name, onHand));
    }
  }

  const deliveryFeeAmount = method === "pickup" ? null : (zone?.feeRwf ?? null);
  const totalAmount = subtotalAmount + (deliveryFeeAmount ?? 0);
  const now = new Date();
  const hasCounted = [...demandByProduct.values()].some(({ product }) =>
    isCountedStock({
      availability: product.availability,
      quantity: product.stockQuantity,
    }),
  );
  const reference = createDocumentId("order");
  const lookupToken = makeLookupToken();
  const reservationExpiresAt = hasCounted
    ? new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString()
    : null;

  const knownIds = await productIdsInDatabase(plans.map((p) => p.product.id));

  const paymentStatus =
    method === "pickup" || input.channel === "online_payment"
      ? "unpaid"
      : "not_applicable";

  const { data: inserted, error: insertError } = await client
    .from("orders")
    .insert({
      reference,
      lookup_token: lookupToken,
      channel: input.channel,
      fulfillment_method: method,
      fulfilment_status: "awaiting_confirmation",
      payment_status: paymentStatus,
      subtotal_rwf: subtotalAmount,
      delivery_fee_rwf: deliveryFeeAmount,
      total_rwf: totalAmount,
      customer_name: input.customerName.trim(),
      customer_phone: normalizePhone(input.customerPhone),
      delivery_district:
        method === "pickup" ? null : input.deliveryDistrict?.trim() || null,
      delivery_sector:
        method === "pickup" ? null : input.deliverySector?.trim() || null,
      delivery_cell:
        method === "pickup" ? null : input.deliveryCell?.trim() || null,
      delivery_village:
        method === "pickup" ? null : input.deliveryVillage?.trim() || null,
      delivery_directions:
        method === "pickup" ? null : input.deliveryDirections?.trim() || null,
      delivery_instructions:
        method === "pickup"
          ? null
          : input.deliveryInstructions?.trim() || null,
      customer_notes: input.customerNotes?.trim() || null,
      delivery_zone_id: method === "pickup" ? null : (zone?.id ?? null),
      idempotency_key: input.idempotencyKey,
      stock_reserved: false,
      stock_committed: false,
      reservation_expires_at: reservationExpiresAt,
    })
    .select("*")
    .single();
  if (insertError) throw new Error(insertError.message);

  const orderId = inserted.id as string;

  const { error: itemsError } = await client.from("order_items").insert(
    plans.map((plan) => ({
      order_id: orderId,
      product_id: knownIds.has(plan.product.id) ? plan.product.id : null,
      product_name_snapshot: plan.product.name,
      product_slug_snapshot: plan.product.slug,
      sku_snapshot: plan.product.sku ?? null,
      quantity: plan.quantity,
      unit_price_rwf: plan.unit,
      line_total_rwf: plan.lineTotal,
    })),
  );
  if (itemsError) {
    await client.from("orders").delete().eq("id", orderId);
    throw new Error(itemsError.message);
  }

  const { error: historyError } = await client
    .from("order_status_history")
    .insert({
      order_id: orderId,
      from_fulfilment: null,
      to_fulfilment: "awaiting_confirmation",
      reason: "Order created",
    });
  if (historyError) {
    await client.from("orders").delete().eq("id", orderId);
    throw new Error(historyError.message);
  }

  try {
    await reserveOrderStockDurable(orderId);
  } catch (error) {
    await client
      .from("orders")
      .update({
        fulfilment_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    await client.from("order_status_history").insert({
      order_id: orderId,
      from_fulfilment: "awaiting_confirmation",
      to_fulfilment: "cancelled",
      reason: "Stock reservation failed",
    });
    throw error instanceof Error
      ? error
      : new Error("Could not reserve stock for this order.");
  }

  // Keep in-memory catalogue qty in sync when durable products were also loaded from memory.
  for (const { product, qty } of demandByProduct.values()) {
    if (
      !isCountedStock({
        availability: product.availability,
        quantity: product.stockQuantity,
      })
    ) {
      continue;
    }
    if (knownIds.has(product.id)) continue;
    const live = adminGetProduct(product.id) ?? getProductById(product.id);
    if (!live || typeof live.stockQuantity !== "number") continue;
    const nextQty = live.stockQuantity - qty;
    live.stockQuantity = nextQty;
    live.availability = availabilityAfterDecrement(live.availability, nextQty);
  }

  const order = await fetchOrderBundle(orderId);
  if (!order) throw new Error("Order created but could not be reloaded.");
  return order;
}

export async function createOrderDurable(
  input: CreateOrderInput,
): Promise<StoredOrder> {
  if (!isDurableOrdersEnabled()) return createOrder(input);
  return createOrderInDatabase(input);
}

export async function lookupOrderDurable(
  reference: string,
  token: string,
): Promise<StoredOrder | undefined> {
  if (!isDurableOrdersEnabled()) {
    const order = lookupOrder(reference, token);
    return order;
  }

  const client = getSupabaseServiceClient()!;
  const { data, error } = await client
    .from("orders")
    .select("id, lookup_token")
    .eq("reference", reference)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    secureTokenEquals(token, token);
    return undefined;
  }
  if (!secureTokenEquals(data.lookup_token as string, token)) {
    return undefined;
  }
  return (await fetchOrderBundle(data.id as string)) ?? undefined;
}

/**
 * Finds an order by reference when the shopper proves it is theirs with the phone number used at
 * checkout (for when the private token was lost). Callers must rate limit by reference.
 */
export async function lookupOrderByPhoneDurable(
  reference: string,
  phone: string,
): Promise<StoredOrder | undefined> {
  const order = await getOrderByReferenceDurable(reference);
  if (!order || !phonesMatch(order.customerPhone, phone)) return undefined;
  return order;
}

export async function getOrderByIdDurable(
  id: string,
): Promise<StoredOrder | undefined> {
  if (!isDurableOrdersEnabled()) return getOrderById(id);
  return (await fetchOrderBundle(id)) ?? undefined;
}

export async function getOrderByReferenceDurable(
  reference: string,
): Promise<StoredOrder | undefined> {
  if (!isDurableOrdersEnabled()) return getOrderByReference(reference);
  const client = getSupabaseServiceClient()!;
  const { data, error } = await client
    .from("orders")
    .select("id")
    .eq("reference", reference)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return undefined;
  return (await fetchOrderBundle(data.id as string)) ?? undefined;
}

/** New orders waiting for staff to confirm — used for the admin nav badge. */
export async function countAwaitingOrdersDurable(): Promise<number> {
  if (!isDurableOrdersEnabled()) {
    return listOrders().filter(
      (order) => order.fulfilmentStatus === "awaiting_confirmation",
    ).length;
  }
  const client = getSupabaseServiceClient()!;
  const { count, error } = await client
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("fulfilment_status", "awaiting_confirmation");
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/**
 * Newest orders first. By default the latest 200; pass `since` (and a larger `limit`) for
 * reports and exports that need a whole date range.
 */
export async function listOrdersDurable(
  options: { since?: Date; limit?: number } = {},
): Promise<StoredOrder[]> {
  if (!isDurableOrdersEnabled()) {
    const since = options.since?.getTime();
    return listOrders().filter(
      (order) => since === undefined || new Date(order.createdAt).getTime() >= since,
    );
  }
  const client = getSupabaseServiceClient()!;
  let query = client
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(options.limit ?? 200);
  if (options.since) query = query.gte("created_at", options.since.toISOString());
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as OrderRow[];
  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id);

  // Two queries per group of 25 orders (not per order) keeps the list quick, and the groups keep
  // each request short and under the database's 1000-row response cap.
  const itemsByOrder = new Map<string, OrderItemRow[]>();
  const historyByOrder = new Map<string, OrderHistoryRow[]>();
  for (let start = 0; start < ids.length; start += 25) {
    const group = ids.slice(start, start + 25);
    const [itemsResult, historyResult] = await Promise.all([
      client
        .from("order_items")
        .select(
          "order_id, product_id, product_name_snapshot, product_slug_snapshot, sku_snapshot, quantity, unit_price_rwf, line_total_rwf",
        )
        .in("order_id", group),
      client
        .from("order_status_history")
        .select("order_id, from_fulfilment, to_fulfilment, reason, created_at")
        .in("order_id", group)
        .order("created_at", { ascending: true }),
    ]);
    if (itemsResult.error) throw new Error(itemsResult.error.message);
    if (historyResult.error) throw new Error(historyResult.error.message);

    for (const item of (itemsResult.data ?? []) as Array<
      OrderItemRow & { order_id: string }
    >) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }
    for (const entry of (historyResult.data ?? []) as Array<
      OrderHistoryRow & { order_id: string }
    >) {
      const list = historyByOrder.get(entry.order_id) ?? [];
      list.push(entry);
      historyByOrder.set(entry.order_id, list);
    }
  }

  return rows.map((row) =>
    mapOrderRow(
      row,
      itemsByOrder.get(row.id) ?? [],
      historyByOrder.get(row.id) ?? [],
    ),
  );
}

export async function transitionFulfilmentDurable(
  orderId: string,
  to: FulfilmentStatus,
  reason: string,
  actorLabel: string,
): Promise<StoredOrder> {
  if (!isDurableOrdersEnabled()) {
    return transitionFulfilment(orderId, to, reason, actorLabel);
  }

  const order = await fetchOrderBundle(orderId);
  if (!order) throw new Error("Order not found");
  assertFulfilmentTransition(
    order.fulfilmentStatus,
    to,
    order.fulfillmentMethod,
  );
  if (order.fulfilmentStatus === to) return order;

  if (to === "cancelled") {
    return cancelOrderDurable(orderId, reason, actorLabel);
  }

  const client = getSupabaseServiceClient()!;
  const { error } = await client
    .from("orders")
    .update({
      fulfilment_status: to,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  if (error) throw new Error(error.message);

  await client.from("order_status_history").insert({
    order_id: orderId,
    from_fulfilment: order.fulfilmentStatus,
    to_fulfilment: to,
    actor_label: actorLabel,
    reason: `${reason} · ${actorLabel}`,
  });

  return (await fetchOrderBundle(orderId))!;
}

export async function cancelOrderDurable(
  orderId: string,
  reason: string,
  actorLabel = "system",
): Promise<StoredOrder> {
  if (!isDurableOrdersEnabled()) return cancelOrder(orderId, reason);

  const order = await fetchOrderBundle(orderId);
  if (!order) throw new Error("Order not found");
  assertFulfilmentTransition(
    order.fulfilmentStatus,
    "cancelled",
    order.fulfillmentMethod,
  );
  if (order.fulfilmentStatus === "cancelled") return order;

  await restoreOrderStockDurable(orderId);

  const client = getSupabaseServiceClient()!;
  const { error } = await client
    .from("orders")
    .update({
      fulfilment_status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  if (error) throw new Error(error.message);

  await client.from("order_status_history").insert({
    order_id: orderId,
    from_fulfilment: order.fulfilmentStatus,
    to_fulfilment: "cancelled",
    actor_label: actorLabel,
    reason,
  });

  return (await fetchOrderBundle(orderId))!;
}

export async function markManualPaymentDurable(
  orderId: string,
  input: ManualPaymentInput,
): Promise<StoredOrder> {
  if (!isDurableOrdersEnabled()) return markManualPayment(orderId, input);

  const order = await fetchOrderBundle(orderId);
  if (!order) throw new Error("Order not found");
  assertValidPaymentAmount(input.amount);
  if (order.paymentStatus === "paid") {
    throw new Error("Payment already marked paid.");
  }

  const client = getSupabaseServiceClient()!;
  const { error } = await client
    .from("orders")
    .update({
      payment_status: "paid",
      amount_paid_rwf: input.amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  if (error) throw new Error(error.message);

  await client.from("order_status_history").insert({
    order_id: orderId,
    from_fulfilment: order.fulfilmentStatus,
    to_fulfilment: order.fulfilmentStatus,
    from_payment: order.paymentStatus,
    to_payment: "paid",
    actor_label: input.actorLabel,
    reason: describeManualPayment(input),
  });

  return (await fetchOrderBundle(orderId))!;
}

/**
 * Applies a payment provider's event to an order, once. A repeated delivery of the same event is
 * a no-op, and a late "pending"/"failed" event never undoes a payment already received.
 */
export async function applyPaymentEventDurable(
  providerId: string,
  event: PaymentEvent,
): Promise<{ order: StoredOrder; duplicate: boolean }> {
  if (!isDurableOrdersEnabled()) {
    return applyPaymentStatusFromWebhook(event.orderId, event.status, event.id);
  }

  const client = getSupabaseServiceClient()!;
  const order = await fetchOrderBundle(event.orderId);
  if (!order) throw new Error("Order not found");

  const { error: eventError } = await client
    .from("payment_webhook_events")
    .insert({
      provider: providerId,
      provider_event_id: event.id,
      payload: event,
    });
  if (eventError) {
    if (eventError.code === "23505") return { order, duplicate: true };
    throw new Error(eventError.message);
  }

  if (order.paymentStatus === "paid" && event.status !== "refunded") {
    return { order, duplicate: false };
  }

  const { error } = await client
    .from("orders")
    .update({
      payment_status: event.status,
      ...(event.status === "paid"
        ? { amount_paid_rwf: event.amountRwf }
        : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", event.orderId);
  if (error) throw new Error(error.message);

  await client.from("order_status_history").insert({
    order_id: event.orderId,
    from_fulfilment: order.fulfilmentStatus,
    to_fulfilment: order.fulfilmentStatus,
    from_payment: order.paymentStatus,
    to_payment: event.status,
    actor_label: providerId,
    reason: `Payment ${event.status} (${providerId} event ${event.id})`,
  });

  return { order: (await fetchOrderBundle(event.orderId))!, duplicate: false };
}

export { toOrderSummary };
