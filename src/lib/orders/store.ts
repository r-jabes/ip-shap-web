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
  assertValidPaymentAmount,
  describeManualPayment,
  type ManualPaymentInput,
} from "@/lib/orders/manual-payment";
import {
  insufficientStockMessage,
  unavailableMessage,
} from "@/lib/orders/stock-messages";
import {
  assertFulfilmentTransition,
  type FulfilmentStatus,
  type FulfillmentMethod,
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
  fulfillmentMethod: FulfillmentMethod;
  fulfilmentStatus: FulfilmentStatus;
  paymentStatus: PaymentStatus;
  subtotal: MoneyRwf;
  deliveryFee: MoneyRwf | null;
  total: MoneyRwf;
  /** Amount staff recorded as received (may differ from `total`, e.g. a discount). Null until recorded. */
  amountPaid?: MoneyRwf | null;
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
  /** True after place-order decremented on-hand inventory (not confirm/payment). */
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
  /** Defaults to delivery when omitted (older callers / demos). */
  fulfillmentMethod?: FulfillmentMethod;
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
    `Hello IP SHAP, I have a question about order ${order.reference}. Total: ${order.total.amount} RWF.`,
  );
  return `https://wa.me/${phone}?text=${text}`;
}

/** On-hand units for counted stock (unknown ≠ counted). */
function remainingStock(product: DemoProduct): number | null {
  if (
    !isCountedStock({
      availability: product.availability,
      quantity: product.stockQuantity,
    })
  ) {
    return null;
  }
  return product.stockQuantity as number;
}

/** Decrement on-hand at place-order (idempotent via stockCommitted). */
function reserveOrderStock(order: StoredOrder): void {
  if (order.stockCommitted) return;

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

  order.stockReserved = true;
  order.stockCommitted = true;
}

function restoreReservedStock(order: StoredOrder) {
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
  order.stockReserved = false;
  order.reservationExpiresAt = null;
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

  const method: FulfillmentMethod =
    input.fulfillmentMethod === "pickup" ? "pickup" : "delivery";

  const zone =
    method === "pickup" ? undefined : getDeliveryZone(input.deliveryZoneId);
  if (method === "delivery" && input.deliveryZoneId && !zone) {
    throw new Error("Selected delivery zone is not available.");
  }

  const snapshots: OrderItemSnapshot[] = [];
  let subtotalAmount = 0;
  let hasCountedStockLines = false;

  // Validate lines first (no mutations) so a mid-cart failure cannot leave partial decrements.
  for (const line of input.items) {
    if (
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > 99
    ) {
      throw new Error("Invalid quantity.");
    }
    const product = resolveProduct(line.productId);
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

  // Aggregate demand per product, then check + decrement once (place-order reserve).
  const demandByProduct = new Map<string, number>();
  for (const snap of snapshots) {
    demandByProduct.set(
      snap.productId,
      (demandByProduct.get(snap.productId) ?? 0) + snap.quantity,
    );
  }
  for (const [productId, qty] of demandByProduct) {
    const product = resolveProduct(productId)!;
    const remaining = remainingStock(product);
    if (remaining === null) continue;
    if (remaining < qty) {
      throw new Error(insufficientStockMessage(product.name, remaining));
    }
    hasCountedStockLines = true;
  }

  const deliveryFeeAmount = method === "pickup" ? null : (zone?.feeRwf ?? null);
  const totalAmount = subtotalAmount + (deliveryFeeAmount ?? 0);

  const now = new Date();
  const reservationExpiresAt = new Date(
    now.getTime() + 48 * 60 * 60 * 1000,
  ).toISOString();

  // Pickup always tracks payment (awaiting payment → paid). Delivery via the
  // assisted channel stays not_applicable until staff records cash later if needed.
  const paymentStatus: PaymentStatus =
    method === "pickup" || input.channel === "online_payment"
      ? "unpaid"
      : "not_applicable";

  const order: StoredOrder = {
    id: randomUUID(),
    reference: makeReference(),
    lookupToken: makeLookupToken(),
    channel: input.channel,
    fulfillmentMethod: method,
    fulfilmentStatus: "awaiting_confirmation",
    paymentStatus,
    subtotal: moneyRwf(subtotalAmount),
    deliveryFee:
      deliveryFeeAmount === null ? null : moneyRwf(deliveryFeeAmount),
    total: moneyRwf(totalAmount),
    amountPaid: null,
    items: snapshots,
    customerName: input.customerName.trim(),
    customerPhone: normalizePhone(input.customerPhone),
    deliveryDistrict:
      method === "pickup"
        ? undefined
        : input.deliveryDistrict?.trim() || undefined,
    deliverySector:
      method === "pickup" ? undefined : input.deliverySector?.trim() || undefined,
    deliveryCell:
      method === "pickup" ? undefined : input.deliveryCell?.trim() || undefined,
    deliveryVillage:
      method === "pickup"
        ? undefined
        : input.deliveryVillage?.trim() || undefined,
    deliveryDirections:
      method === "pickup"
        ? undefined
        : input.deliveryDirections?.trim() || undefined,
    deliveryInstructions:
      method === "pickup"
        ? undefined
        : input.deliveryInstructions?.trim() || undefined,
    customerNotes: input.customerNotes?.trim() || undefined,
    deliveryZoneId: method === "pickup" ? undefined : zone?.id,
    idempotencyKey: input.idempotencyKey,
    stockReserved: false,
    stockCommitted: false,
    reservationExpiresAt: hasCountedStockLines ? reservationExpiresAt : null,
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

  // Stock is reserved (on-hand decremented) at place — not on confirm/payment.
  if (hasCountedStockLines) {
    reserveOrderStock(order);
  }

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
  assertFulfilmentTransition(
    order.fulfilmentStatus,
    "cancelled",
    order.fulfillmentMethod,
  );
  if (order.fulfilmentStatus === "cancelled") return order;

  restoreReservedStock(order);

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
    fulfillmentMethod: order.fulfillmentMethod,
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
  assertFulfilmentTransition(
    order.fulfilmentStatus,
    to,
    order.fulfillmentMethod,
  );
  if (order.fulfilmentStatus === to) return order;

  if (to === "cancelled") {
    return cancelOrder(orderId, reason);
  }

  // Confirm/payment do not touch stock — inventory was reserved at place-order.

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
 * Manual payment recording by staff after they have checked the money themselves.
 * The amount is required (it may differ from the total); reference and note are optional.
 * Does not accept browser redirects as proof.
 */
export function markManualPayment(
  orderId: string,
  input: ManualPaymentInput,
): StoredOrder {
  const order = getOrderById(orderId);
  if (!order) throw new Error("Order not found");
  assertValidPaymentAmount(input.amount);
  if (order.paymentStatus === "paid") {
    throw new Error("Payment already marked paid.");
  }
  order.paymentStatus = "paid";
  order.amountPaid = moneyRwf(input.amount);
  order.statusHistory.push({
    from: order.fulfilmentStatus,
    to: order.fulfilmentStatus,
    reason: describeManualPayment(input),
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
