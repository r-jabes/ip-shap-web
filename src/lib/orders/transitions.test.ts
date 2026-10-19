import { describe, expect, it } from "vitest";
import {
  assertFulfilmentTransition,
  canTransitionFulfilment,
} from "./transitions";

describe("fulfilment transitions", () => {
  it("blocks skipping ahead to delivered", () => {
    expect(canTransitionFulfilment("awaiting_confirmation", "delivered")).toBe(
      false,
    );
  });

  it("allows cancel from awaiting_confirmation", () => {
    expect(() =>
      assertFulfilmentTransition("awaiting_confirmation", "cancelled"),
    ).not.toThrow();
  });
});
