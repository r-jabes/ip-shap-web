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

export type ProductImage = {
  id: string;
  role: ProductImageRole;
  src: string;
  alt: string;
  width: number;
  height: number;
  sortOrder: number;
  /** True when the photograph shows more than one sellable SKU. */
  isSharedMultiProductPhoto?: boolean;
  sourceFilename?: string;
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
