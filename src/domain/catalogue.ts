import type { MoneyRwf } from "@/lib/money";
import type { Product, ProductImage } from "@/domain/product";

export type { Product, ProductImage };

export type AvailabilityFilter = "all" | "in_stock" | "unknown";

export type ProductAvailability =
  "in_stock" | "low_stock" | "out_of_stock" | "unknown";

export type Category = {
  slug: string;
  name: string;
  description: string;
};

export type Brand = {
  slug: string;
  name: string;
};

export type DemoProduct = Product & {
  brandSlug: string;
  brandName: string;
  availability: ProductAvailability;
  /** Conspicuous demo label for UI. */
  demoLabel: string;
};

export type CatalogueFilters = {
  categorySlug?: string;
  brandSlug?: string;
  availability?: AvailabilityFilter;
  q?: string;
  sort?: "price_asc" | "price_desc" | "name_asc";
  minPrice?: number;
  maxPrice?: number;
};

export type CartLine = {
  productId: string;
  quantity: number;
};

export function formatDemoPrice(price: MoneyRwf): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(price.amount);
}
