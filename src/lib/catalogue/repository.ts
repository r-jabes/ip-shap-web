import type {
  Brand,
  CatalogueFilters,
  Category,
  DemoProduct,
} from "@/domain/catalogue";

/**
 * One row of the slim storefront index: just what listing, filtering, sorting, counting and menus
 * need (no images or descriptions). A few thousand of these are tens of kilobytes, so the index can
 * be cached and filtered quickly while full product rows are loaded only for the page being shown.
 */
export type CatalogueIndexEntry = Pick<
  DemoProduct,
  | "id"
  | "slug"
  | "name"
  | "brandSlug"
  | "brandName"
  | "categorySlug"
  | "availability"
  | "status"
  | "price"
>;

/**
 * Durable catalogue access. Sync demo helpers in `catalogue.ts` stay for the
 * fixture path; this interface is the production system-of-record boundary.
 */
export type CatalogueRepository = {
  listCategories(): Promise<Category[]>;
  listBrands(): Promise<Brand[]>;
  listProducts(filters?: CatalogueFilters): Promise<DemoProduct[]>;
  getProductBySlug(slug: string): Promise<DemoProduct | undefined>;
  getProductById(id: string): Promise<DemoProduct | undefined>;
  /** Only products an admin has chosen to feature. Empty when none are. */
  getFeaturedProducts(limit?: number): Promise<DemoProduct[]>;
  /** Slim index of every published product. */
  listIndex(): Promise<CatalogueIndexEntry[]>;
  /** Full rows for the given ids, in the same order. Unknown or unpublished ids are skipped. */
  getProductsByIds(ids: string[]): Promise<DemoProduct[]>;
  /**
   * Ids of products matching free text (typo tolerant, accent insensitive) when the store can do
   * that itself, or `null` to let the caller match on the index.
   */
  searchProductIds(query: string): Promise<string[] | null>;
};
