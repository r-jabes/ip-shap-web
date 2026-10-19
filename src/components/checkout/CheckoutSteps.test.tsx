import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CheckoutSteps } from "./CheckoutSteps";

afterEach(() => cleanup());

describe("CheckoutSteps", () => {
  it("marks the active step", () => {
    render(<CheckoutSteps current="checkout" />);
    expect(screen.getByText("Details").closest("[aria-current]")).toHaveAttribute(
      "aria-current",
      "step",
    );
  });
});
