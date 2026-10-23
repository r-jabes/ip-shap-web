import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.9" }),
}));

const published = {
  id: "11111111-1111-4111-8111-111111111111",
  status: "published",
};
const getCachedProductsByIds = vi.fn(async () => [published]);
vi.mock("@/lib/catalogue/cache", () => ({
  getCachedProductsByIds: () => getCachedProductsByIds(),
}));

import { resetRateLimitForTests } from "@/lib/security/rate-limit";
import {
  createMemoryRestockStore,
  setRestockStoreForTests,
} from "@/lib/stock/restock-requests";
import { requestRestockAction } from "./actions";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("requestRestockAction", () => {
  let store: ReturnType<typeof createMemoryRestockStore>;

  beforeEach(() => {
    store = createMemoryRestockStore();
    setRestockStoreForTests(store);
    resetRateLimitForTests();
    getCachedProductsByIds.mockResolvedValue([published]);
  });

  it("saves an email request and says so in plain English", async () => {
    const result = await requestRestockAction(
      {},
      form({ productId: published.id, contact: "Aline@Example.com" }),
    );
    expect(result.ok).toBe(true);
    expect(result.message).toMatch(/email you/i);
    expect(store.rows).toHaveLength(1);
    expect(store.rows[0].contact).toBe("aline@example.com");
  });

  it("does not save a second identical request", async () => {
    const fields = { productId: published.id, contact: "a@example.com" };
    await requestRestockAction({}, form(fields));
    await requestRestockAction({}, form(fields));
    expect(store.rows).toHaveLength(1);
  });

  it("asks for a valid contact instead of saving junk", async () => {
    const result = await requestRestockAction(
      {},
      form({ productId: published.id, contact: "not a contact" }),
    );
    expect(result.error).toMatch(/valid email/i);
    expect(store.rows).toHaveLength(0);
  });

  it("quietly ignores bots that fill the hidden field", async () => {
    const result = await requestRestockAction(
      {},
      form({ productId: published.id, contact: "a@example.com", website: "spam.example" }),
    );
    expect(result.ok).toBe(true);
    expect(store.rows).toHaveLength(0);
  });

  it("refuses unknown or unpublished products", async () => {
    getCachedProductsByIds.mockResolvedValueOnce([]);
    const result = await requestRestockAction(
      {},
      form({ productId: published.id, contact: "a@example.com" }),
    );
    expect(result.error).toBeDefined();
    expect(store.rows).toHaveLength(0);
  });

  it("limits how many requests one address can make per hour", async () => {
    for (let index = 0; index < 10; index += 1) {
      await requestRestockAction(
        {},
        form({ productId: published.id, contact: `person${index}@example.com` }),
      );
    }
    const result = await requestRestockAction(
      {},
      form({ productId: published.id, contact: "one-too-many@example.com" }),
    );
    expect(result.error).toMatch(/too many/i);
  });
});
