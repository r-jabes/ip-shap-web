import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProductImage } from "@/domain/product";
import { ProductImageFrame } from "./ProductImageFrame";

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    onError,
  }: {
    alt: string;
    src: string;
    onError?: () => void;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      src={src}
      data-testid="frame-img"
      onClick={() => onError?.()}
    />
  ),
}));

const image: ProductImage = {
  id: "img",
  role: "catalogue_primary",
  src: "/products/drink-17000.jpeg",
  alt: "Green glass wine bottle",
  width: 810,
  height: 1080,
  sortOrder: 0,
  processingStatus: "needs_review",
};

afterEach(() => cleanup());

describe("ProductImageFrame", () => {
  it("renders the image when metadata is present", () => {
    render(<ProductImageFrame image={image} />);
    expect(screen.getByTestId("frame-img")).toHaveAttribute("src", image.src);
  });

  it("shows a reserved-aspect fallback when image is missing", () => {
    render(<ProductImageFrame image={null} alt="Missing SKU photo" />);
    expect(
      screen.getByRole("img", { name: "Missing SKU photo" }),
    ).toHaveTextContent("Image unavailable");
  });
});
