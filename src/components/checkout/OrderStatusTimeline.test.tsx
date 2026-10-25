import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OrderStatusTimeline } from "./OrderStatusTimeline";

afterEach(() => cleanup());

describe("OrderStatusTimeline", () => {
  it("marks the current fulfilment step on the delivery path", () => {
    render(<OrderStatusTimeline status="awaiting_confirmation" />);
    expect(screen.getByText("Waiting for our confirmation")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(
      screen.getByText("Waiting for our confirmation").closest("[aria-current]"),
    ).toHaveAttribute("aria-current", "step");
  });

  it("shows the pickup path when method is pickup", () => {
    render(
      <OrderStatusTimeline status="ready_for_pickup" method="pickup" />,
    );
    expect(screen.getByText("Ready for pickup")).toBeInTheDocument();
    expect(screen.getByText("Picked up")).toBeInTheDocument();
    expect(screen.queryByText("Out for delivery")).not.toBeInTheDocument();
  });

  it("shows a cancelled state", () => {
    render(<OrderStatusTimeline status="cancelled" />);
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
    expect(screen.queryByText("Current")).not.toBeInTheDocument();
  });
});
