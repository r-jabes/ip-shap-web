import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "./Reveal";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Reveal", () => {
  it("shows content immediately when reduced motion is preferred", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      })),
    );

    render(
      <Reveal>
        <p>Editorial copy</p>
      </Reveal>,
    );

    const wrap = screen.getByText("Editorial copy").parentElement;
    expect(wrap).toHaveClass("reveal");
    expect(wrap).not.toHaveClass("reveal--pending");
  });
});
