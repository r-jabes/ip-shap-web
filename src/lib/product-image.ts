import { z } from "zod";
import type { ProductImage, ProductImageRole } from "@/domain/product";

export const imageProcessingStatusSchema = z.enum([
  "source_received",
  "needs_review",
  "approved_for_catalogue",
  "rejected",
  "archived",
]);

export const productImageRoleSchema = z.enum([
  "catalogue_primary",
  "catalogue_secondary",
  "editorial",
  "thumbnail",
  "zoom",
]);

export const productImageSchema = z.object({
  id: z.string().min(1),
  role: productImageRoleSchema,
  src: z.string().min(1),
  zoomSrc: z.string().min(1).optional(),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  sortOrder: z.number().int().nonnegative(),
  processingStatus: imageProcessingStatusSchema,
  isSharedMultiProductPhoto: z.boolean().optional(),
  sourceFilename: z.string().optional(),
  originalRef: z.string().optional(),
  cropInstructions: z.string().optional(),
  rightsNote: z.string().optional(),
  needsClientConfirmation: z.boolean().optional(),
});

/** Catalogue canvas used across grid + gallery (width:height). */
export const CATALOGUE_ASPECT_RATIO = "4 / 5" as const;
export const CATALOGUE_ASPECT_CLASS = "aspect-[4/5]" as const;
export const CATALOGUE_SURFACE = "#E8E2D6" as const;

const ROLE_SIZES: Record<ProductImageRole, string> = {
  thumbnail: "64px",
  catalogue_primary: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  catalogue_secondary: "(max-width: 768px) 100vw, 50vw",
  editorial: "(max-width: 1024px) 100vw, 80vw",
  zoom: "100vw",
};

export function sizesForRole(role: ProductImageRole): string {
  return ROLE_SIZES[role];
}

export function qualityForRole(role: ProductImageRole): number {
  switch (role) {
    case "zoom":
      return 90;
    case "thumbnail":
      return 60;
    case "editorial":
      return 80;
    default:
      return 75;
  }
}

export function resolveZoomSrc(image: ProductImage): string {
  return image.zoomSrc ?? image.src;
}

export function sortProductImages(images: ProductImage[]): ProductImage[] {
  return [...images].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function primaryCatalogueImage(
  images: ProductImage[],
): ProductImage | undefined {
  const sorted = sortProductImages(images);
  return (
    sorted.find((image) => image.role === "catalogue_primary") ?? sorted[0]
  );
}

export function parseProductImage(input: unknown): ProductImage {
  return productImageSchema.parse(input);
}

/**
 * Soft gate for what the storefront may show.
 * Rejected/archived images are excluded; needs_review may still show in demo.
 */
export function isDisplayableImage(
  image: ProductImage,
  options?: { allowNeedsReview?: boolean },
): boolean {
  if (image.processingStatus === "rejected") return false;
  if (image.processingStatus === "archived") return false;
  if (
    image.processingStatus === "needs_review" &&
    options?.allowNeedsReview === false
  ) {
    return false;
  }
  return true;
}

export function displayableImages(
  images: ProductImage[],
  options?: { allowNeedsReview?: boolean },
): ProductImage[] {
  return sortProductImages(images).filter((image) =>
    isDisplayableImage(image, options),
  );
}
