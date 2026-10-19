import { describe, expect, it } from "vitest";
import {
  displayableImages,
  parseProductImage,
  primaryCatalogueImage,
  resolveZoomSrc,
  sizesForRole,
} from "./product-image";
import type { ProductImage } from "@/domain/product";

const baseImage: ProductImage = {
  id: "img-1",
  role: "catalogue_primary",
  src: "/products/drink-17000.jpeg",
  alt: "Green glass wine bottle with ornate cream label",
  width: 810,
  height: 1080,
  sortOrder: 0,
  processingStatus: "needs_review",
  sourceFilename: "17k.jpeg",
  originalRef: "resources/17k.jpeg",
  rightsNote: "Client-supplied shop photograph",
};

describe("parseProductImage", () => {
  it("accepts complete metadata", () => {
    expect(parseProductImage(baseImage).id).toBe("img-1");
  });

  it("rejects empty alt text", () => {
    expect(() => parseProductImage({ ...baseImage, alt: "" })).toThrow();
  });

  it("rejects non-positive dimensions", () => {
    expect(() => parseProductImage({ ...baseImage, width: 0 })).toThrow();
  });
});

describe("displayableImages", () => {
  it("excludes rejected and archived images", () => {
    const images: ProductImage[] = [
      baseImage,
      {
        ...baseImage,
        id: "img-2",
        sortOrder: 1,
        processingStatus: "rejected",
      },
      {
        ...baseImage,
        id: "img-3",
        sortOrder: 2,
        processingStatus: "archived",
      },
    ];
    expect(displayableImages(images).map((image) => image.id)).toEqual([
      "img-1",
    ]);
  });

  it("can hide needs_review when not allowed", () => {
    expect(
      displayableImages([baseImage], { allowNeedsReview: false }),
    ).toHaveLength(0);
  });
});

describe("helpers", () => {
  it("resolves zoom src fallback", () => {
    expect(resolveZoomSrc(baseImage)).toBe(baseImage.src);
    expect(
      resolveZoomSrc({ ...baseImage, zoomSrc: "/products/zoom.jpeg" }),
    ).toBe("/products/zoom.jpeg");
  });

  it("picks primary catalogue image", () => {
    const images: ProductImage[] = [
      { ...baseImage, id: "a", role: "thumbnail", sortOrder: 0 },
      { ...baseImage, id: "b", role: "catalogue_primary", sortOrder: 1 },
    ];
    expect(primaryCatalogueImage(images)?.id).toBe("b");
  });

  it("returns role-specific sizes", () => {
    expect(sizesForRole("zoom")).toBe("100vw");
    expect(sizesForRole("thumbnail")).toBe("64px");
  });
});
