import { describe, expect, it } from "vitest";
import {
  createMemoryRestockStore,
  parseRestockContact,
} from "./restock-requests";

describe("parseRestockContact", () => {
  it("accepts and lower-cases an email", () => {
    expect(parseRestockContact("  Aline@Example.COM ")).toEqual({
      kind: "email",
      contact: "aline@example.com",
    });
  });

  it("accepts a Rwandan phone number in any spacing", () => {
    expect(parseRestockContact("0788 123 456")).toEqual({
      kind: "phone",
      contact: "0788123456",
    });
  });

  it("rejects things that are neither", () => {
    expect(parseRestockContact("")).toBeNull();
    expect(parseRestockContact("hello")).toBeNull();
    expect(parseRestockContact("a@b")).toBeNull();
    expect(parseRestockContact("0123")).toBeNull();
  });
});

describe("restock store", () => {
  const now = new Date("2026-10-23T10:00:00Z");
  const email = { kind: "email", contact: "a@example.com" } as const;

  it("ignores the same shopper asking twice for the same drink", async () => {
    const store = createMemoryRestockStore();
    expect(await store.add("p1", email, now)).toBe("added");
    expect(await store.add("p1", email, now)).toBe("exists");
    expect(await store.add("p2", email, now)).toBe("added");
  });

  it("stops listing a request once it is answered", async () => {
    const store = createMemoryRestockStore();
    await store.add("p1", email, now);
    const [request] = await store.listWaiting({ productId: "p1" });
    await store.markNotified([request.id], now);
    expect(await store.listWaiting({ productId: "p1" })).toHaveLength(0);
  });

  it("deletes answered requests after a month and unanswered ones after six", async () => {
    const store = createMemoryRestockStore();
    await store.add("p1", email, now);
    await store.add("p2", { kind: "phone", contact: "0788123456" }, now);
    const [first] = await store.listWaiting({ productId: "p1" });
    await store.markNotified([first.id], now);

    const aMonthLater = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000);
    expect(await store.purge(aMonthLater)).toBe(1);
    expect(store.rows).toHaveLength(1);

    const sevenMonthsLater = new Date(now.getTime() + 200 * 24 * 60 * 60 * 1000);
    expect(await store.purge(sevenMonthsLater)).toBe(1);
    expect(store.rows).toHaveLength(0);
  });
});
