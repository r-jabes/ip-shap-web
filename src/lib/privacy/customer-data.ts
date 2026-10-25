import { listOrdersDurable } from "@/lib/orders/durable";
import { isValidCheckoutPhone, normalizePhone, phonesMatch } from "@/lib/orders/phone";
import type { StoredOrder } from "@/lib/orders/store";
import { hasDurableStorage } from "@/lib/supabase/config";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getRestockStore } from "@/lib/stock/restock-requests";

const MAX_ORDERS_SCANNED = 5000;
const FINISHED: StoredOrder["fulfilmentStatus"][] = [
  "delivered",
  "picked_up",
  "cancelled",
];

export type CustomerDataSummary = {
  orders: number;
  ordersInProgress: number;
  waitingRequests: number;
};

export function parseCustomerPhone(raw: string): string | null {
  const value = normalizePhone(raw);
  return isValidCheckoutPhone(value) ? value : null;
}

async function ordersForPhone(phone: string): Promise<StoredOrder[]> {
  const all = await listOrdersDurable({ limit: MAX_ORDERS_SCANNED });
  return all.filter((order) => phonesMatch(order.customerPhone, phone));
}

async function requestsForPhone(phone: string) {
  const waiting = await getRestockStore().listWaiting({ kind: "phone", limit: 5000 });
  return waiting.filter((request) => phonesMatch(request.contact, phone));
}

/** What we hold for this phone number, without the details. */
export async function summariseCustomerData(
  phone: string,
): Promise<CustomerDataSummary> {
  const [orders, requests] = await Promise.all([
    ordersForPhone(phone),
    requestsForPhone(phone),
  ]);
  return {
    orders: orders.length,
    ordersInProgress: orders.filter(
      (order) => !FINISHED.includes(order.fulfilmentStatus),
    ).length,
    waitingRequests: requests.length,
  };
}

/** Everything we hold for this phone number, as a plain object ready to hand to the customer. */
export async function exportCustomerData(phone: string) {
  const [orders, requests] = await Promise.all([
    ordersForPhone(phone),
    requestsForPhone(phone),
  ]);
  return {
    exportedAt: new Date().toISOString(),
    phone,
    orders: orders.map((order) => ({
      reference: order.reference,
      placedAt: order.createdAt,
      status: order.fulfilmentStatus,
      paymentStatus: order.paymentStatus,
      totalRwf: order.total.amount,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      delivery: {
        district: order.deliveryDistrict ?? null,
        sector: order.deliverySector ?? null,
        cell: order.deliveryCell ?? null,
        village: order.deliveryVillage ?? null,
        directions: order.deliveryDirections ?? null,
        instructions: order.deliveryInstructions ?? null,
      },
      notes: order.customerNotes ?? null,
      items: order.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        unitPriceRwf: item.unitPrice.amount,
      })),
    })),
    stockRequests: requests.map((request) => ({
      productId: request.productId,
      askedAt: request.createdAt,
    })),
  };
}

export type ErasureResult = {
  ordersErased: number;
  ordersInProgress: number;
  requestsDeleted: number;
};

/**
 * Blanks the personal details on finished orders for this phone number and deletes its stock
 * requests. Orders still in progress are left alone, and reported so staff can come back later.
 */
export async function eraseCustomerData(phone: string): Promise<ErasureResult> {
  if (!hasDurableStorage()) {
    throw new Error("Erasing customer details needs the live database.");
  }
  const { data, error } = await getSupabaseServiceClient()!.rpc(
    "erase_customer_data",
    { p_phone_last9: phone },
  );
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  return {
    ordersErased: Number(row?.orders_erased ?? 0),
    ordersInProgress: Number(row?.orders_in_progress ?? 0),
    requestsDeleted: Number(row?.requests_deleted ?? 0),
  };
}
