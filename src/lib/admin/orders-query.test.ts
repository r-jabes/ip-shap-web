import { describe, expect, it } from "vitest";
import { moneyRwf } from "@/lib/money";
import type { StoredOrder } from "@/lib/orders/store";
import {
  filterAndSortOrders,
  parseOrderSort,
} from "./orders-query";

function order(partial: Partial<StoredOrder> & Pick<StoredOrder, "id" | "reference">): StoredOrder {
  return {
    lookupToken: "token",
    channel: "whatsapp_assisted",
    fulfilmentStatus: "awaiting_confirmation",
    paymentStatus: "unpaid",
    subtotal: moneyRwf(10000),
    deliveryFee: null,
    total: moneyRwf(10000),
    items: [],
    customerName: "Ada",
    customerPhone: "+250780000000",
    idempotencyKey: partial.id,
    stockReserved: false,
    stockCommitted: false,
    reservationExpiresAt: null,
    statusHistory: [],
    createdAt: "2026-01-02T10:00:00.000Z",
    updatedAt: "2026-01-02T10:00:00.000Z",
    ...partial,
  };
}

describe("filterAndSortOrders", () => {
  const orders = [
    order({
      id: "1",
      reference: "IPS-100",
      customerName: "Jean",
      customerPhone: "+250781111111",
      fulfilmentStatus: "confirmed",
      paymentStatus: "paid",
      total: moneyRwf(50000),
      createdAt: "2026-01-03T10:00:00.000Z",
    }),
    order({
      id: "2",
      reference: "IPS-200",
      customerName: "Marie",
      customerPhone: "+250782222222",
      fulfilmentStatus: "awaiting_confirmation",
      paymentStatus: "unpaid",
      total: moneyRwf(20000),
      createdAt: "2026-01-01T10:00:00.000Z",
    }),
  ];

  it("filters by search, fulfilment, and payment", () => {
    const byPhone = filterAndSortOrders(orders, { q: "782222" });
    expect(byPhone.map((row) => row.id)).toEqual(["2"]);

    const byFulfilment = filterAndSortOrders(orders, {
      fulfilment: "confirmed",
    });
    expect(byFulfilment.map((row) => row.id)).toEqual(["1"]);

    const byPayment = filterAndSortOrders(orders, { payment: "unpaid" });
    expect(byPayment.map((row) => row.id)).toEqual(["2"]);
  });

  it("sorts by newest, oldest, and total", () => {
    expect(filterAndSortOrders(orders, { sort: "newest" }).map((o) => o.id)).toEqual([
      "1",
      "2",
    ]);
    expect(filterAndSortOrders(orders, { sort: "oldest" }).map((o) => o.id)).toEqual([
      "2",
      "1",
    ]);
    expect(
      filterAndSortOrders(orders, { sort: "total_asc" }).map((o) => o.id),
    ).toEqual(["2", "1"]);
  });
});

describe("parseOrderSort", () => {
  it("defaults to newest", () => {
    expect(parseOrderSort(undefined)).toBe("newest");
    expect(parseOrderSort("nope")).toBe("newest");
    expect(parseOrderSort("total_desc")).toBe("total_desc");
  });
});
