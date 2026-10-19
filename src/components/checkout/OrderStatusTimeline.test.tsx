import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OrderStatusTimeline } from "./OrderStatusTimeline";

afterEach(() => cleanup());

describe("OrderStatusTimeline", () => {
  it("marks the current fulfilment step", () => {
    render(<OrderStatusTimeline status="awaiting_confirmation" />);
    expect(screen.getByText("Awaiting confirmation")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(
      screen.getByText("Awaiting confirmation").closest("[aria-current]"),
    ).toHaveAttribute("aria-current", "step");
  });

  it("shows a cancelled state", () => {
    render(<OrderStatusTimeline status="cancelled" />);
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
    expect(screen.queryByText("Current")).not.toBeInTheDocument();
  });
});
