import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FaqList } from "./FaqList";

afterEach(() => cleanup());

describe("FaqList", () => {
  it("opens the first item by default and toggles others", () => {
    render(
      <FaqList
        items={[
          { question: "How do I order?", answer: "Add to cart first." },
          { question: "When do I pay?", answer: "When we confirm." },
        ]}
      />,
    );

    expect(screen.getByText("Add to cart first.")).toBeInTheDocument();
    expect(screen.queryByText("When we confirm.")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "When do I pay?" }));
    expect(screen.getByText("When we confirm.")).toBeInTheDocument();
  });
});
