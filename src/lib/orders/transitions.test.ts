import { describe, expect, it } from "vitest";
import {
  assertFulfilmentTransition,
  canTransitionFulfilment,
  nextFulfilmentStatuses,
} from "./transitions";

describe("fulfilment transitions", () => {
  it("allows jumping straight to any later delivery step", () => {
    expect(
      canTransitionFulfilment("awaiting_confirmation", "delivered", "delivery"),
    ).toBe(true);
    expect(
      canTransitionFulfilment("confirmed", "out_for_delivery", "delivery"),
    ).toBe(true);
  });

  it("lists every later delivery step plus cancel, in order", () => {
    expect(nextFulfilmentStatuses("processing", "delivery")).toEqual([
      "ready_for_dispatch",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ]);
  });

  it("uses the pickup path for pickup orders", () => {
    expect(nextFulfilmentStatuses("confirmed", "pickup")).toEqual([
      "ready_for_pickup",
      "picked_up",
      "cancelled",
    ]);
    expect(
      canTransitionFulfilment("confirmed", "ready_for_pickup", "pickup"),
    ).toBe(true);
    expect(canTransitionFulfilment("confirmed", "delivered", "pickup")).toBe(
      false,
    );
    expect(
      canTransitionFulfilment("confirmed", "out_for_delivery", "pickup"),
    ).toBe(false);
  });

  it("never goes backwards", () => {
    expect(canTransitionFulfilment("processing", "confirmed", "delivery")).toBe(
      false,
    );
    expect(
      canTransitionFulfilment(
        "out_for_delivery",
        "awaiting_confirmation",
        "delivery",
      ),
    ).toBe(false);
    expect(
      canTransitionFulfilment("ready_for_pickup", "confirmed", "pickup"),
    ).toBe(false);
  });

  it("allows cancel from any unfinished status", () => {
    expect(() =>
      assertFulfilmentTransition(
        "awaiting_confirmation",
        "cancelled",
        "delivery",
      ),
    ).not.toThrow();
    expect(() =>
      assertFulfilmentTransition("ready_for_pickup", "cancelled", "pickup"),
    ).not.toThrow();
  });

  it("treats delivered, picked_up and cancelled as final", () => {
    expect(nextFulfilmentStatuses("delivered", "delivery")).toEqual([]);
    expect(nextFulfilmentStatuses("picked_up", "pickup")).toEqual([]);
    expect(nextFulfilmentStatuses("cancelled", "delivery")).toEqual([]);
    expect(() =>
      assertFulfilmentTransition("delivered", "cancelled", "delivery"),
    ).toThrow(/Illegal/);
    expect(() =>
      assertFulfilmentTransition("picked_up", "cancelled", "pickup"),
    ).toThrow(/Illegal/);
  });
});
