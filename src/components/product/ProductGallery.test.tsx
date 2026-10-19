import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProductImage } from "@/domain/product";
import { ProductGallery } from "./ProductGallery";

vi.mock("next/image", () => ({
  default: (props: {
    alt: string;
    src: string;
    className?: string;
    width?: number;
    height?: number;
  }) => {
    const { alt, src, className, width, height } = props;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt}
        src={src}
        className={className}
        width={width}
        height={height}
        data-testid={`img-${src}`}
      />
    );
  },
}));

const images: ProductImage[] = [
  {
    id: "a",
    role: "catalogue_primary",
    src: "/products/a.jpeg",
    zoomSrc: "/products/a-zoom.jpeg",
    alt: "Bottle A",
    width: 810,
    height: 1080,
    sortOrder: 0,
    processingStatus: "needs_review",
  },
  {
    id: "b",
    role: "catalogue_secondary",
    src: "/products/b.jpeg",
    zoomSrc: "/products/b-zoom.jpeg",
    alt: "Bottle B",
    width: 810,
    height: 1080,
    sortOrder: 1,
    processingStatus: "approved_for_catalogue",
  },
];

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

describe("ProductGallery", () => {
  it("announces slide changes and supports keyboard next/prev in lightbox", () => {
    render(<ProductGallery images={images} productName="Demo wine" />);

    expect(screen.getByText(/Showing image 1 of 2/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Zoom" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("img-/products/a-zoom.jpeg")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(screen.getByText(/Showing image 2 of 2/i)).toBeInTheDocument();
    expect(screen.getByTestId("img-/products/b-zoom.jpeg")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("handles a single image without fake slides", () => {
    render(<ProductGallery images={[images[0]]} productName="Single bottle" />);
    expect(screen.queryByRole("button", { name: "Next image" })).toBeNull();
    expect(screen.queryByLabelText("Thumbnails")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Zoom" }));
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  });
});
