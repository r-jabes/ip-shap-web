import type { MoneyRwf } from "@/lib/money";

/**
 * Catalogue domain shapes for THE IP SHAP BUSINESS LTD.
 * Stable product identity must never depend on image filenames.
 */

export type ProductStatus = "draft" | "demo" | "published" | "archived";

export type ProductImageRole =
  | "catalogue_primary"
  | "catalogue_secondary"
  | "editorial"
  | "thumbnail"
  | "zoom";

/**
 * Operator review / processing lifecycle for product imagery.
 * Unreviewed AI-edited images must never auto-publish.
 */
export type ImageProcessingStatus =
  | "source_received"
  | "needs_review"
  | "approved_for_catalogue"
  | "rejected"
  | "archived";

export type ProductImage = {
  id: string;
  role: ProductImageRole;
  /** Public derivative path/URL served to browsers. */
  src: string;
  /**
   * Optional higher-resolution asset loaded only when zoom/lightbox opens.
   * Falls back to `src` when omitted.
   */
  zoomSrc?: string;
  alt: string;
  width: number;
  height: number;
  sortOrder: number;
  processingStatus: ImageProcessingStatus;
  /** True when the photograph shows more than one sellable SKU. */
  isSharedMultiProductPhoto?: boolean;
  /** Original filename or storage key for operator reference — not product identity. */
  sourceFilename?: string;
  /** Private/original storage reference (not publicly exposed by default). */
  originalRef?: string;
  cropInstructions?: string;
  rightsNote?: string;
  needsClientConfirmation?: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Integer RWF. Provisional prices must be confirmed before production. */
  price: MoneyRwf;
  categorySlug?: string;
  status: ProductStatus;
  images: ProductImage[];
  /** Internal notes for operators; do not render as verified facts. */
  internalNotes?: string[];
  isProvisional: boolean;
};

export type CatalogueQuery = {
  categorySlug?: string;
  q?: string;
  sort?: "price_asc" | "price_desc" | "name_asc";
};
