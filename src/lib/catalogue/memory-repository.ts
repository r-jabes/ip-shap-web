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
import type {
  CatalogueIndexEntry,
  CatalogueRepository,
} from "@/lib/catalogue/repository";

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
      // Only what has been featured on purpose; never an automatic pick.
      return products
        .filter(
          (row) =>
            isStorefrontVisible(row) &&
            (row as DemoProduct & { isFeatured?: boolean }).isFeatured === true,
        )
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, limit);
    },
    async listIndex(): Promise<CatalogueIndexEntry[]> {
      if (!options.enabled) return [];
      return products.filter(isStorefrontVisible).map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        brandSlug: product.brandSlug,
        brandName: product.brandName,
        categorySlug: product.categorySlug,
        availability: product.availability,
        status: product.status,
        price: product.price,
      }));
    },
    async getProductsByIds(ids: string[]) {
      if (!options.enabled) return [];
      const byId = new Map(products.map((product) => [product.id, product]));
      return [...new Set(ids)]
        .map((id) => byId.get(id))
        .filter(
          (product): product is DemoProduct =>
            !!product && isStorefrontVisible(product),
        );
    },
    async searchProductIds() {
      // The index is small here; the caller matches text on it directly.
      return null;
    },
  };
}
