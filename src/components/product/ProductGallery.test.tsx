import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductImage } from "@/domain/product";
import { ProductGallery } from "./ProductGallery";

vi.mock("next/image", () => ({
  default: (props: {
    alt: string;
    src: string;
    className?: string;
    width?: number;
    height?: number;
    fill?: boolean;
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

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
  vi.useRealTimers();
});

describe("ProductGallery", () => {
  it("announces slide changes and supports keyboard next/prev in lightbox", async () => {
    render(<ProductGallery images={images} productName="Demo wine" />);

    expect(screen.getByText(/Showing image 1 of 2/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Zoom" }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByTestId("img-/products/a-zoom.jpeg")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(screen.getByText(/Showing image 2 of 2/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByTestId("img-/products/b-zoom.jpeg"),
      ).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("builds a two-slide carousel from a single catalogue photo", () => {
    render(<ProductGallery images={[images[0]]} productName="Single bottle" />);
    expect(screen.getByText(/Showing image 1 of 2/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next image" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next image" }));
    expect(screen.getByText(/Showing image 2 of 2/i)).toBeInTheDocument();
  });

  it("loops from the last slide back to the first", () => {
    render(<ProductGallery images={images} productName="Demo wine" />);
    fireEvent.click(screen.getByRole("button", { name: "Next image" }));
    expect(screen.getByText(/Showing image 2 of 2/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next image" }));
    expect(screen.getByText(/Showing image 1 of 2/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous image" }));
    expect(screen.getByText(/Showing image 2 of 2/i)).toBeInTheDocument();
  });

  it("autoplay wraps from the last slide to the first", async () => {
    vi.useFakeTimers();
    render(<ProductGallery images={images} productName="Demo wine" />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(screen.getByText(/Showing image 2 of 2/i)).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(screen.getByText(/Showing image 1 of 2/i)).toBeInTheDocument();
  });

  it("auto-advances slides on an interval", async () => {
    vi.useFakeTimers();
    render(<ProductGallery images={[images[0]]} productName="Single bottle" />);
    expect(screen.getByText(/Showing image 1 of 2/i)).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(screen.getByText(/Showing image 2 of 2/i)).toBeInTheDocument();
  });

  it("zooms with + / - keys inside the dialog", async () => {
    render(<ProductGallery images={[images[0]]} productName="Single bottle" />);
    fireEvent.click(screen.getByRole("button", { name: "Zoom" }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: "+" });
    fireEvent.keyDown(document, { key: "+" });
    const stage = screen
      .getByRole("dialog")
      .querySelector(".will-change-transform");
    expect(stage).toBeTruthy();
    const transform = (stage as HTMLElement).style.transform;
    expect(Number(transform.match(/scale\(([\d.]+)\)/)?.[1])).toBeGreaterThan(
      1,
    );

    fireEvent.keyDown(document, { key: "0" });
    expect((stage as HTMLElement).style.transform).toMatch(/scale\(1\)/);
  });
});
