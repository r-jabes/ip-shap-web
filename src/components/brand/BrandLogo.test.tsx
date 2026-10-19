import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandLogo, logoSource } from "@/components/brand/BrandLogo";

describe("logoSource", () => {
  it("never serves the charcoal logo on a dark surface", () => {
    expect(logoSource("on-ink", "full")).toBe(
      "/branding/main-logo-reversed.png",
    );
    expect(logoSource("on-paper", "full")).toBe("/branding/main-logo.png");
  });

  it("uses the self-contained tile for the mark on any surface", () => {
    expect(logoSource("on-ink", "mark")).toBe("/branding/app-icon.png");
    expect(logoSource("on-paper", "mark")).toBe("/branding/app-icon.png");
  });
});

describe("BrandLogo", () => {
  it("links home with an accessible name and the legal name as alt text", () => {
    render(<BrandLogo tone="on-paper" />);
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByAltText(/IP SHAP/i)).toBeInTheDocument();
  });

  it("renders without a link when href is null", () => {
    render(<BrandLogo tone="on-ink" href={null} />);
    expect(screen.queryByRole("link")).toBeNull();
  });
});
