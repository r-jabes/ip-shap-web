import { describe, expect, it } from "vitest";
import {
  assertFulfilmentTransition,
  canTransitionFulfilment,
  nextFulfilmentStatuses,
} from "./transitions";

describe("fulfilment transitions", () => {
  it("allows jumping straight to any later step", () => {
    expect(canTransitionFulfilment("awaiting_confirmation", "delivered")).toBe(
      true,
    );
    expect(canTransitionFulfilment("confirmed", "out_for_delivery")).toBe(true);
  });

  it("lists every later step plus cancel, in order", () => {
    expect(nextFulfilmentStatuses("processing")).toEqual([
      "ready_for_dispatch",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ]);
  });

  it("never goes backwards", () => {
    expect(canTransitionFulfilment("processing", "confirmed")).toBe(false);
    expect(canTransitionFulfilment("out_for_delivery", "awaiting_confirmation")).toBe(
      false,
    );
  });

  it("allows cancel from any unfinished status", () => {
    expect(() =>
      assertFulfilmentTransition("awaiting_confirmation", "cancelled"),
    ).not.toThrow();
    expect(() =>
      assertFulfilmentTransition("out_for_delivery", "cancelled"),
    ).not.toThrow();
  });

  it("treats delivered and cancelled as final", () => {
    expect(nextFulfilmentStatuses("delivered")).toEqual([]);
    expect(nextFulfilmentStatuses("cancelled")).toEqual([]);
    expect(() => assertFulfilmentTransition("delivered", "cancelled")).toThrow(
      /Illegal/,
    );
  });
});
