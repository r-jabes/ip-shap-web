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
import type { CatalogueRepository } from "@/lib/catalogue/repository";
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

export function createSupabaseCatalogueRepository(
  client: SupabaseClient,
): CatalogueRepository {
  async function fetchPublished(): Promise<DemoProduct[]> {
    const { data, error } = await client
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "published");

    if (error) {
      throw new Error(`Catalogue read failed: ${error.message}`);
    }

    return ((data ?? []) as unknown as ProductRow[]).map(mapProductRow);
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

      const featured = ((data ?? []) as unknown as ProductRow[]).map(
        mapProductRow,
      );
      if (featured.length) return featured;

      return filterAndSortProducts(await fetchPublished(), {
        sort: "name_asc",
      }).slice(0, limit);
    },
  };
}
