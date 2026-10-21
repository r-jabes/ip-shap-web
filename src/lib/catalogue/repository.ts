import type {
  Brand,
  CatalogueFilters,
  Category,
  DemoProduct,
} from "@/domain/catalogue";

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
  getFeaturedProducts(limit?: number): Promise<DemoProduct[]>;
};
