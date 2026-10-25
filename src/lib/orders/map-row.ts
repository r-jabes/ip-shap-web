import { moneyRwf } from "@/lib/money";
import type {
  CheckoutChannel,
  OrderItemSnapshot,
  StoredOrder,
} from "@/lib/orders/store";
import type {
  FulfilmentStatus,
  FulfillmentMethod,
  PaymentStatus,
} from "@/lib/orders/transitions";

export type OrderRow = {
  id: string;
  reference: string;
  lookup_token: string;
  channel: CheckoutChannel;
  fulfillment_method?: FulfillmentMethod | null;
  fulfilment_status: FulfilmentStatus;
  payment_status: PaymentStatus;
  subtotal_rwf: number;
  delivery_fee_rwf: number | null;
  total_rwf: number;
  /** Amount staff recorded as received; null until a manual payment is recorded. */
  amount_paid_rwf?: number | null;
  customer_name: string;
  customer_phone: string;
  delivery_district: string | null;
  delivery_sector: string | null;
  delivery_cell: string | null;
  delivery_village: string | null;
  delivery_directions: string | null;
  delivery_instructions: string | null;
  customer_notes: string | null;
  delivery_zone_id: string | null;
  idempotency_key: string;
  stock_reserved: boolean;
  stock_committed?: boolean;
  reservation_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  product_id: string | null;
  product_name_snapshot: string;
  product_slug_snapshot: string;
  sku_snapshot: string | null;
  quantity: number;
  unit_price_rwf: number;
  line_total_rwf: number;
};

export type OrderHistoryRow = {
  from_fulfilment: FulfilmentStatus | null;
  to_fulfilment: FulfilmentStatus;
  reason: string;
  created_at: string;
};

export function mapOrderItemRow(row: OrderItemRow): OrderItemSnapshot {
  return {
    productId: row.product_id ?? "unknown",
    productName: row.product_name_snapshot,
    productSlug: row.product_slug_snapshot,
    sku: row.sku_snapshot ?? undefined,
    quantity: row.quantity,
    unitPrice: moneyRwf(row.unit_price_rwf),
    lineTotal: moneyRwf(row.line_total_rwf),
  };
}

export function mapOrderRow(
  row: OrderRow,
  items: OrderItemRow[],
  history: OrderHistoryRow[] = [],
): StoredOrder {
  return {
    id: row.id,
    reference: row.reference,
    lookupToken: row.lookup_token,
    channel: row.channel,
    fulfillmentMethod:
      row.fulfillment_method === "pickup" ? "pickup" : "delivery",
    fulfilmentStatus: row.fulfilment_status,
    paymentStatus: row.payment_status,
    subtotal: moneyRwf(row.subtotal_rwf),
    deliveryFee:
      row.delivery_fee_rwf === null ? null : moneyRwf(row.delivery_fee_rwf),
    total: moneyRwf(row.total_rwf),
    amountPaid:
      row.amount_paid_rwf === null || row.amount_paid_rwf === undefined
        ? null
        : moneyRwf(row.amount_paid_rwf),
    items: items.map(mapOrderItemRow),
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    deliveryDistrict: row.delivery_district ?? undefined,
    deliverySector: row.delivery_sector ?? undefined,
    deliveryCell: row.delivery_cell ?? undefined,
    deliveryVillage: row.delivery_village ?? undefined,
    deliveryDirections: row.delivery_directions ?? undefined,
    deliveryInstructions: row.delivery_instructions ?? undefined,
    customerNotes: row.customer_notes ?? undefined,
    deliveryZoneId: row.delivery_zone_id ?? undefined,
    idempotencyKey: row.idempotency_key,
    stockReserved: row.stock_reserved,
    stockCommitted: Boolean(row.stock_committed),
    reservationExpiresAt: row.reservation_expires_at,
    statusHistory: history.map((entry) => ({
      from: entry.from_fulfilment,
      to: entry.to_fulfilment,
      reason: entry.reason,
      at: entry.created_at,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
