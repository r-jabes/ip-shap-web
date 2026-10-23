import { describe, expect, it } from "vitest";
import {
  forgetOrder,
  MAX_REMEMBERED_ORDERS,
  parseRememberedOrders,
  rememberOrder,
  type RememberedOrder,
} from "./recent-orders";

function order(reference: string): RememberedOrder {
  return {
    reference,
    token: "abcdef123456",
    placedAt: "2026-10-23T10:00:00.000Z",
    totalRwf: 15000,
  };
}

describe("remembered orders", () => {
  it("ignores broken or unsafe stored data", () => {
    expect(parseRememberedOrders(null)).toEqual([]);
    expect(parseRememberedOrders("oops")).toEqual([]);
    const raw = JSON.stringify([
      order("IPS-0001"),
      { ...order("IPS-0002"), token: "short" },
      { ...order("bad ref!") },
      { reference: "IPS-0003" },
    ]);
    expect(parseRememberedOrders(raw).map((entry) => entry.reference)).toEqual([
      "IPS-0001",
    ]);
  });

  it("puts the newest order first and does not repeat one", () => {
    const list = rememberOrder([order("IPS-0001")], order("IPS-0002"));
    const again = rememberOrder(list, order("IPS-0001"));
    expect(again.map((entry) => entry.reference)).toEqual([
      "IPS-0001",
      "IPS-0002",
    ]);
  });

  it("keeps only the newest few", () => {
    let list: RememberedOrder[] = [];
    for (let index = 1; index <= MAX_REMEMBERED_ORDERS + 3; index += 1) {
      list = rememberOrder(list, order(`IPS-${String(index).padStart(4, "0")}`));
    }
    expect(list).toHaveLength(MAX_REMEMBERED_ORDERS);
    expect(list[0]!.reference).toBe("IPS-0008");
  });

  it("can forget one order", () => {
    const list = [order("IPS-0001"), order("IPS-0002")];
    expect(forgetOrder(list, "IPS-0001").map((entry) => entry.reference)).toEqual(
      ["IPS-0002"],
    );
  });
});
