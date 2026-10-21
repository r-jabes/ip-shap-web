import type {
  Brand,
  CatalogueFilters,
  Category,
  DemoProduct,
} from "@/domain/catalogue";
import {
  DEMO_BRANDS,
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
} from "@/fixtures/demo/catalogue";
import {
  filterAndSortProducts,
  isStorefrontVisible,
} from "@/lib/catalogue/filter";
import type { CatalogueRepository } from "@/lib/catalogue/repository";

export type MemoryRepositoryOptions = {
  /** When false, all reads return empty (production fail-closed). */
  enabled: boolean;
  products?: DemoProduct[];
  categories?: Category[];
  brands?: Brand[];
};

export function createMemoryCatalogueRepository(
  options: MemoryRepositoryOptions,
): CatalogueRepository {
  const products = options.products ?? DEMO_PRODUCTS;
  const categories = options.categories ?? DEMO_CATEGORIES;
  const brands = options.brands ?? DEMO_BRANDS;

  return {
    async listCategories() {
      return options.enabled ? [...categories] : [];
    },
    async listBrands() {
      return options.enabled ? [...brands] : [];
    },
    async listProducts(filters: CatalogueFilters = {}) {
      if (!options.enabled) return [];
      return filterAndSortProducts(products, filters);
    },
    async getProductBySlug(slug: string) {
      if (!options.enabled) return undefined;
      const product = products.find((row) => row.slug === slug);
      return product && isStorefrontVisible(product) ? product : undefined;
    },
    async getProductById(id: string) {
      if (!options.enabled) return undefined;
      const product = products.find((row) => row.id === id);
      return product && isStorefrontVisible(product) ? product : undefined;
    },
    async getFeaturedProducts(limit = 4) {
      if (!options.enabled) return [];
      const featured = products
        .filter(
          (row) =>
            isStorefrontVisible(row) &&
            (row as DemoProduct & { isFeatured?: boolean }).isFeatured === true,
        )
        .sort((a, b) => a.name.localeCompare(b.name));
      if (featured.length) return featured.slice(0, limit);
      return filterAndSortProducts(products, { sort: "name_asc" }).slice(
        0,
        limit,
      );
    },
  };
}
