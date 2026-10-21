import { randomBytes, randomUUID } from "node:crypto";
import { createDocumentId } from "@/lib/document-id";
import type { DemoProduct } from "@/domain/catalogue";
import { adminGetProduct, adminListProducts } from "@/lib/admin/store";
import { getProductById, listProducts } from "@/lib/catalogue";
import { getServerEnv } from "@/lib/env";
import { moneyRwf, type MoneyRwf } from "@/lib/money";
import { getDeliveryZone } from "@/lib/orders/delivery";
import { isValidCheckoutPhone, normalizePhone } from "@/lib/orders/phone";
import {
  assertFulfilmentTransition,
  type FulfilmentStatus,
  type PaymentStatus,
} from "@/lib/orders/transitions";
import {
  availabilityAfterDecrement,
  availabilityAfterRestore,
  isCountedStock,
} from "@/lib/stock/engine";

export type CheckoutChannel = "whatsapp_assisted" | "online_payment";

export type OrderItemSnapshot = {
  productId: string;
  productName: string;
  productSlug: string;
  sku?: string;
  quantity: number;
  unitPrice: MoneyRwf;
  lineTotal: MoneyRwf;
};

export type StoredOrder = {
  id: string;
  reference: string;
  lookupToken: string;
  channel: CheckoutChannel;
  fulfilmentStatus: FulfilmentStatus;
  paymentStatus: PaymentStatus;
  subtotal: MoneyRwf;
  deliveryFee: MoneyRwf | null;
  total: MoneyRwf;
  items: OrderItemSnapshot[];
  customerName: string;
  customerPhone: string;
  deliveryDistrict?: string;
  deliverySector?: string;
  deliveryCell?: string;
  deliveryVillage?: string;
  deliveryDirections?: string;
  deliveryInstructions?: string;
  customerNotes?: string;
  deliveryZoneId?: string;
  idempotencyKey: string;
  stockReserved: boolean;
  /** True after confirm decremented on-hand inventory. */
  stockCommitted: boolean;
  reservationExpiresAt: string | null;
  statusHistory: Array<{
    from: FulfilmentStatus | null;
    to: FulfilmentStatus;
    reason: string;
    at: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = {
  channel: CheckoutChannel;
  items: Array<{ productId: string; quantity: number }>;
  customerName: string;
  customerPhone: string;
  customerNotes?: string;
  deliveryDistrict?: string;
  deliverySector?: string;
  deliveryCell?: string;
  deliveryVillage?: string;
  deliveryDirections?: string;
  deliveryInstructions?: string;
  deliveryZoneId?: string;
  idempotencyKey: string;
};

type OrderStore = {
  orders: StoredOrder[];
  /** Outstanding reserved units by product id */
  reservations: Map<string, number>;
  /** Provider webhook event ids already applied */
  processedWebhookIds: Set<string>;
};

declare global {
  var __ipShapOrderStore: OrderStore | undefined;
}

function getStore(): OrderStore {
  if (!globalThis.__ipShapOrderStore) {
    globalThis.__ipShapOrderStore = {
      orders: [],
      reservations: new Map(),
      processedWebhookIds: new Set(),
    };
  }
  return globalThis.__ipShapOrderStore;
}

function resolveProduct(productId: string): DemoProduct | undefined {
  return adminGetProduct(productId) ?? getProductById(productId);
}

function isPubliclyOrderable(product: DemoProduct): boolean {
  return (
    (product.status === "published" || product.status === "demo") &&
    product.availability !== "out_of_stock"
  );
}

/** Public order ref — opaque CSPRNG id (no date/serial). See document-id.ts. */
function makeReference(): string {
  return createDocumentId("order");
}

function makeLookupToken(): string {
  return randomBytes(24).toString("base64url");
}

function onlinePaymentEnabled(): boolean {
  return getServerEnv().ONLINE_PAYMENT_ENABLED === true;
}

function whatsappE164(): string | undefined {
  return getServerEnv().WHATSAPP_BUSINESS_E164;
}

export function buildWhatsAppDeepLink(order: StoredOrder): string | undefined {
  const phone = whatsappE164()?.replace(/\D/g, "");
  if (!phone) return undefined;
  const text = encodeURIComponent(
    `Hello IP SHAP, I placed order ${order.reference}. Total: ${order.total.amount} RWF.`,
  );
  return `https://wa.me/${phone}?text=${text}`;
}

/** Available units = on-hand qty minus open reservations (unknown ≠ counted). */
function remainingStock(product: DemoProduct): number | null {
  if (
    !isCountedStock({
      availability: product.availability,
      quantity: product.stockQuantity,
    })
  ) {
    return null;
  }
  const reserved = getStore().reservations.get(product.id) ?? 0;
  return (product.stockQuantity as number) - reserved;
}

function releaseReservation(order: StoredOrder) {
  if (!order.stockReserved) return;
  const store = getStore();
  for (const item of order.items) {
    const reserved = store.reservations.get(item.productId) ?? 0;
    store.reservations.set(
      item.productId,
      Math.max(0, reserved - item.quantity),
    );
  }
  order.stockReserved = false;
  order.reservationExpiresAt = null;
}

/** Lock semantics for in-memory confirm: decrement on-hand, clear reservation. */
export function commitOrderStock(orderId: string): StoredOrder {
  const store = getStore();
  const order = store.orders.find((row) => row.id === orderId);
  if (!order) throw new Error("Order not found");
  if (order.stockCommitted) return order;

  for (const item of order.items) {
    const product = resolveProduct(item.productId);
    if (!product) continue;
    if (
      !isCountedStock({
        availability: product.availability,
        quantity: product.stockQuantity,
      })
    ) {
      continue;
    }
    const onHand = product.stockQuantity as number;
    if (onHand < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name} (have ${onHand}, need ${item.quantity}).`,
      );
    }
    const nextQty = onHand - item.quantity;
    product.stockQuantity = nextQty;
    product.availability = availabilityAfterDecrement(
      product.availability,
      nextQty,
    );
  }

  releaseReservation(order);
  order.stockCommitted = true;
  order.updatedAt = new Date().toISOString();
  return order;
}

function restoreCommittedStock(order: StoredOrder) {
  if (!order.stockCommitted) return;
  for (const item of order.items) {
    const product = resolveProduct(item.productId);
    if (!product) continue;
    if (
      !isCountedStock({
        availability: product.availability,
        quantity: product.stockQuantity,
      }) &&
      product.availability === "unknown"
    ) {
      continue;
    }
    if (typeof product.stockQuantity !== "number") continue;
    const nextQty = product.stockQuantity + item.quantity;
    product.stockQuantity = nextQty;
    product.availability = availabilityAfterRestore(
      product.availability,
      nextQty,
    );
  }
  order.stockCommitted = false;
}

export function createOrder(input: CreateOrderInput): StoredOrder {
  const store = getStore();
  const existing = store.orders.find(
    (order) => order.idempotencyKey === input.idempotencyKey,
  );
  if (existing) return existing;

  if (input.channel === "online_payment" && !onlinePaymentEnabled()) {
    throw new Error(
      "Online payment is not available yet. Choose WhatsApp-assisted ordering.",
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

  const zone = getDeliveryZone(input.deliveryZoneId);
  if (input.deliveryZoneId && !zone) {
    throw new Error("Selected delivery zone is not available.");
  }

  const snapshots: OrderItemSnapshot[] = [];
  let subtotalAmount = 0;
  const reservationPlan: Array<{ productId: string; quantity: number }> = [];

  for (const line of input.items) {
    if (
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > 99
    ) {
      throw new Error("Invalid quantity.");
    }
    const product = resolveProduct(line.productId);
    if (!product || !isPubliclyOrderable(product)) {
      throw new Error(
        "A cart item is unavailable (unpublished or out of stock). Update your cart.",
      );
    }

    const remaining = remainingStock(product);
    if (remaining !== null && remaining < line.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}. Available: ${Math.max(0, remaining)}.`,
      );
    }
    if (remaining !== null) {
      reservationPlan.push({ productId: product.id, quantity: line.quantity });
    }

    const unit = product.price.amount;
    const lineTotal = unit * line.quantity;
    subtotalAmount += lineTotal;
    snapshots.push({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      sku: product.sku,
      quantity: line.quantity,
      unitPrice: moneyRwf(unit),
      lineTotal: moneyRwf(lineTotal),
    });
  }

  const deliveryFeeAmount = zone?.feeRwf ?? null;
  const totalAmount = subtotalAmount + (deliveryFeeAmount ?? 0);

  for (const plan of reservationPlan) {
    const current = store.reservations.get(plan.productId) ?? 0;
    store.reservations.set(plan.productId, current + plan.quantity);
  }

  const now = new Date();
  const reservationExpiresAt = new Date(
    now.getTime() + 48 * 60 * 60 * 1000,
  ).toISOString();

  const order: StoredOrder = {
    id: randomUUID(),
    reference: makeReference(),
    lookupToken: makeLookupToken(),
    channel: input.channel,
    fulfilmentStatus: "awaiting_confirmation",
    paymentStatus:
      input.channel === "online_payment" ? "unpaid" : "not_applicable",
    subtotal: moneyRwf(subtotalAmount),
    deliveryFee:
      deliveryFeeAmount === null ? null : moneyRwf(deliveryFeeAmount),
    total: moneyRwf(totalAmount),
    items: snapshots,
    customerName: input.customerName.trim(),
    customerPhone: normalizePhone(input.customerPhone),
    deliveryDistrict: input.deliveryDistrict?.trim() || undefined,
    deliverySector: input.deliverySector?.trim() || undefined,
    deliveryCell: input.deliveryCell?.trim() || undefined,
    deliveryVillage: input.deliveryVillage?.trim() || undefined,
    deliveryDirections: input.deliveryDirections?.trim() || undefined,
    deliveryInstructions: input.deliveryInstructions?.trim() || undefined,
    customerNotes: input.customerNotes?.trim() || undefined,
    deliveryZoneId: zone?.id,
    idempotencyKey: input.idempotencyKey,
    stockReserved: reservationPlan.length > 0,
    stockCommitted: false,
    reservationExpiresAt:
      reservationPlan.length > 0 ? reservationExpiresAt : null,
    statusHistory: [
      {
        from: null,
        to: "awaiting_confirmation",
        reason: "Order created",
        at: now.toISOString(),
      },
    ],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  store.orders.unshift(order);
  return order;
}

export function lookupOrder(
  reference: string,
  lookupToken: string,
): StoredOrder | undefined {
  return getStore().orders.find(
    (order) =>
      order.reference === reference && order.lookupToken === lookupToken,
  );
}

export function cancelOrder(orderId: string, reason: string): StoredOrder {
  const store = getStore();
  const order = store.orders.find((row) => row.id === orderId);
  if (!order) throw new Error("Order not found");
  assertFulfilmentTransition(order.fulfilmentStatus, "cancelled");
  if (order.fulfilmentStatus === "cancelled") return order;

  if (order.stockCommitted) {
    restoreCommittedStock(order);
  } else {
    releaseReservation(order);
  }

  order.statusHistory.push({
    from: order.fulfilmentStatus,
    to: "cancelled",
    reason,
    at: new Date().toISOString(),
  });
  order.fulfilmentStatus = "cancelled";
  order.updatedAt = new Date().toISOString();
  return order;
}

export function toOrderSummary(order: StoredOrder) {
  return {
    id: order.id,
    reference: order.reference,
    lookupToken: order.lookupToken,
    fulfilmentStatus: order.fulfilmentStatus,
    paymentStatus: order.paymentStatus,
    channel: order.channel,
    currency: "RWF" as const,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    items: order.items,
    whatsappDeepLink: buildWhatsAppDeepLink(order),
    stockReserved: order.stockReserved,
    reservationExpiresAt: order.reservationExpiresAt,
    createdAt: order.createdAt,
  };
}

export function countOrders(): number {
  return getStore().orders.length;
}

export function listOrders(): StoredOrder[] {
  return [...getStore().orders].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function getOrderById(id: string): StoredOrder | undefined {
  return getStore().orders.find((order) => order.id === id);
}

export function getOrderByReference(
  reference: string,
): StoredOrder | undefined {
  return getStore().orders.find((order) => order.reference === reference);
}

export function transitionFulfilment(
  orderId: string,
  to: FulfilmentStatus,
  reason: string,
  actorLabel: string,
): StoredOrder {
  const order = getOrderById(orderId);
  if (!order) throw new Error("Order not found");
  assertFulfilmentTransition(order.fulfilmentStatus, to);
  if (order.fulfilmentStatus === to) return order;

  if (to === "cancelled") {
    return cancelOrder(orderId, reason);
  }

  if (to === "confirmed") {
    commitOrderStock(orderId);
  }

  order.statusHistory.push({
    from: order.fulfilmentStatus,
    to,
    reason: `${reason} · ${actorLabel}`,
    at: new Date().toISOString(),
  });
  order.fulfilmentStatus = to;
  order.updatedAt = new Date().toISOString();
  return order;
}

/**
 * Manual payment recording — requires reference + reason (staff must verify offline).
 * Does not accept browser redirects as proof.
 */
export function markManualPayment(
  orderId: string,
  input: { reference: string; reason: string; actorLabel: string },
): StoredOrder {
  const order = getOrderById(orderId);
  if (!order) throw new Error("Order not found");
  if (!input.reference.trim() || !input.reason.trim()) {
    throw new Error("Payment reference and reason are required.");
  }
  if (order.paymentStatus === "paid") {
    throw new Error("Payment already marked paid.");
  }
  order.paymentStatus = "paid";
  order.statusHistory.push({
    from: order.fulfilmentStatus,
    to: order.fulfilmentStatus,
    reason: `Manual payment recorded (${input.reference}): ${input.reason} · ${input.actorLabel}`,
    at: new Date().toISOString(),
  });
  order.updatedAt = new Date().toISOString();
  return order;
}

export function applyPaymentStatusFromWebhook(
  orderId: string,
  status: PaymentStatus,
  eventId: string,
): { order: StoredOrder; duplicate: boolean } {
  const store = getStore();
  const order = store.orders.find((row) => row.id === orderId);
  if (!order) throw new Error("Order not found");

  const seenKey = `payment_event:${eventId}`;
  if (store.processedWebhookIds.has(seenKey)) {
    return { order, duplicate: true };
  }
  store.processedWebhookIds.add(seenKey);

  // Out-of-order: never downgrade paid → pending/failed.
  if (order.paymentStatus === "paid" && status !== "refunded") {
    return { order, duplicate: false };
  }

  order.paymentStatus = status;
  order.statusHistory.push({
    from: order.fulfilmentStatus,
    to: order.fulfilmentStatus,
    reason: `Payment webhook → ${status} (${eventId})`,
    at: new Date().toISOString(),
  });
  order.updatedAt = new Date().toISOString();
  return { order, duplicate: false };
}

export function listCatalogueProductIds(): string[] {
  const adminIds = adminListProducts().map((p) => p.id);
  if (adminIds.length > 0) return adminIds;
  return listProducts().map((p) => p.id);
}
