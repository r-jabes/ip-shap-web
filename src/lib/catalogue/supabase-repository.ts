import type {
  Brand,
  CatalogueFilters,
  Category,
  DemoProduct,
} from "@/domain/catalogue";
import { categoryGroupForSlug } from "@/lib/catalogue/category-groups";
import { filterAndSortProducts } from "@/lib/catalogue/filter";
import {
  mapProductRow,
  type ProductRow,
} from "@/lib/catalogue/map-row";
import { moneyRwf } from "@/lib/money";
import type {
  CatalogueIndexEntry,
  CatalogueRepository,
} from "@/lib/catalogue/repository";
import type { SupabaseClient } from "@supabase/supabase-js";

const PRODUCT_SELECT = `
  id,
  slug,
  name,
  description,
  price_rwf,
  compare_at_price_rwf,
  status,
  availability,
  is_provisional,
  is_featured,
  featured_sort,
  categories ( slug, name ),
  brands ( slug, name ),
  product_images (
    id,
    role,
    src,
    zoom_src,
    alt,
    width,
    height,
    sort_order,
    processing_status,
    original_ref,
    source_filename,
    crop_instructions,
    rights_note,
    is_shared_multi_product_photo,
    needs_client_confirmation
  ),
  inventory_levels ( quantity, availability )
`;

const READ_PAGE = 1000;

/** Columns the slim index needs; no images, descriptions or stock counts. */
const INDEX_SELECT = `
  id, slug, name, price_rwf, status, availability,
  categories ( slug, name ),
  brands ( slug, name ),
  inventory_levels ( availability )
`;

type IndexRow = {
  id: string;
  slug: string;
  name: string;
  price_rwf: number | string | null;
  status: string;
  availability: string;
  categories: { slug: string } | Array<{ slug: string }> | null;
  brands:
    | { slug: string; name: string }
    | Array<{ slug: string; name: string }>
    | null;
  inventory_levels:
    | { availability: string }
    | Array<{ availability: string }>
    | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapIndexRow(row: IndexRow): CatalogueIndexEntry {
  const brand = first(row.brands);
  const amount = Math.max(0, Math.round(Number(row.price_rwf) || 0));
  return {
    id: row.id,
    slug: row.slug,
    name: row.name ?? "Untitled product",
    brandSlug: brand?.slug ?? "",
    brandName: brand?.name ?? "",
    categorySlug: first(row.categories)?.slug,
    status: (row.status || "draft") as DemoProduct["status"],
    availability: (first(row.inventory_levels)?.availability ??
      row.availability ??
      "unknown") as DemoProduct["availability"],
    price: moneyRwf(amount),
  };
}

export function createSupabaseCatalogueRepository(
  client: SupabaseClient,
): CatalogueRepository {
  /** PostgREST caps one response (1,000 rows by default), so read in stable pages. */
  async function fetchPublished(): Promise<DemoProduct[]> {
    const rows: ProductRow[] = [];
    for (let from = 0; ; from += READ_PAGE) {
      const { data, error } = await client
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("status", "published")
        .order("id")
        .range(from, from + READ_PAGE - 1);

      if (error) {
        throw new Error(`Catalogue read failed: ${error.message}`);
      }
      const batch = (data ?? []) as unknown as ProductRow[];
      rows.push(...batch);
      if (batch.length < READ_PAGE) break;
    }
    return rows.map(mapProductRow);
  }

  return {
    async listCategories() {
      const { data, error } = await client
        .from("categories")
        .select("slug, name, description")
        .order("name");
      if (error) {
        throw new Error(`Categories read failed: ${error.message}`);
      }
      return (data ?? []).map(
        (row): Category => ({
          slug: row.slug,
          name: row.name,
          group: categoryGroupForSlug(row.slug),
          description: row.description ?? "",
        }),
      );
    },

    async listBrands() {
      const { data, error } = await client
        .from("brands")
        .select("slug, name")
        .order("name");
      if (error) {
        throw new Error(`Brands read failed: ${error.message}`);
      }
      return (data ?? []).map(
        (row): Brand => ({
          slug: row.slug,
          name: row.name,
        }),
      );
    },

    async listProducts(filters: CatalogueFilters = {}) {
      const products = await fetchPublished();
      return filterAndSortProducts(products, filters);
    },

    async getProductBySlug(slug: string) {
      const { data, error } = await client
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) {
        throw new Error(`Product slug read failed: ${error.message}`);
      }
      return data ? mapProductRow(data as unknown as ProductRow) : undefined;
    },

    async getProductById(id: string) {
      const { data, error } = await client
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("id", id)
        .eq("status", "published")
        .maybeSingle();
      if (error) {
        throw new Error(`Product id read failed: ${error.message}`);
      }
      return data ? mapProductRow(data as unknown as ProductRow) : undefined;
    },

    async getFeaturedProducts(limit = 4) {
      const { data, error } = await client
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("status", "published")
        .eq("is_featured", true)
        .order("featured_sort", { ascending: true })
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Featured catalogue read failed: ${error.message}`);
      }

      // Nothing is featured until an admin chooses it: no automatic fallback.
      return ((data ?? []) as unknown as ProductRow[]).map(mapProductRow);
    },

    async listIndex() {
      const entries: CatalogueIndexEntry[] = [];
      for (let from = 0; ; from += READ_PAGE) {
        const { data, error } = await client
          .from("products")
          .select(INDEX_SELECT)
          .eq("status", "published")
          .order("id")
          .range(from, from + READ_PAGE - 1);
        if (error) {
          throw new Error(`Catalogue index read failed: ${error.message}`);
        }
        const batch = (data ?? []) as unknown as IndexRow[];
        entries.push(...batch.map(mapIndexRow));
        if (batch.length < READ_PAGE) break;
      }
      return entries;
    },

    async getProductsByIds(ids: string[]) {
      const unique = [...new Set(ids)].slice(0, 100);
      if (unique.length === 0) return [];
      const { data, error } = await client
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("status", "published")
        .in("id", unique);
      if (error) {
        throw new Error(`Products by id read failed: ${error.message}`);
      }
      const byId = new Map(
        ((data ?? []) as unknown as ProductRow[])
          .map(mapProductRow)
          .map((product) => [product.id, product] as const),
      );
      return unique
        .map((id) => byId.get(id))
        .filter((product): product is DemoProduct => !!product);
    },

    async searchProductIds(query: string) {
      const { data, error } = await client.rpc("search_catalogue_ids", {
        p_query: query,
      });
      // Older databases without the function fall back to matching on the index.
      if (error) return null;
      return Array.isArray(data) ? (data as string[]) : null;
    },
  };
}
