import type { DemoProduct, ProductAvailability } from "@/domain/catalogue";
import type {
  ImageProcessingStatus,
  ProductImageRole,
  ProductStatus,
} from "@/domain/product";
import { moneyRwf } from "@/lib/money";

type TaxonomyRef = { slug: string; name: string };

type ImageRow = {
  id: string;
  role: string;
  src: string;
  zoom_src: string | null;
  alt: string;
  width: number;
  height: number;
  sort_order: number;
  processing_status: string;
  original_ref: string | null;
  source_filename: string | null;
  crop_instructions: string | null;
  rights_note: string | null;
  is_shared_multi_product_photo: boolean;
  needs_client_confirmation: boolean;
};

type InventoryRow = {
  quantity: number | null;
  availability: string;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_rwf: number;
  status: string;
  availability: string;
  is_provisional: boolean;
  is_featured?: boolean;
  featured_sort?: number;
  /** Supabase may type FK embeds as object or one-element array. */
  categories: TaxonomyRef | TaxonomyRef[] | null;
  brands: TaxonomyRef | TaxonomyRef[] | null;
  product_images: ImageRow[] | null;
  inventory_levels: InventoryRow | InventoryRow[] | null;
};

function firstEmbed<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function mapProductRow(row: ProductRow): DemoProduct {
  const images = [...(row.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => ({
      id: image.id,
      role: image.role as ProductImageRole,
      src: image.src,
      zoomSrc: image.zoom_src ?? undefined,
      alt: image.alt,
      width: image.width,
      height: image.height,
      sortOrder: image.sort_order,
      processingStatus: image.processing_status as ImageProcessingStatus,
      originalRef: image.original_ref ?? undefined,
      sourceFilename: image.source_filename ?? undefined,
      cropInstructions: image.crop_instructions ?? undefined,
      rightsNote: image.rights_note ?? undefined,
      isSharedMultiProductPhoto: image.is_shared_multi_product_photo,
      needsClientConfirmation: image.needs_client_confirmation,
    }));

  const inventory = firstEmbed(row.inventory_levels);
  const brand = firstEmbed(row.brands);
  const category = firstEmbed(row.categories);
  const brandSlug = brand?.slug ?? "unknown";
  const brandName = brand?.name ?? "Unknown";

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: moneyRwf(row.price_rwf),
    categorySlug: category?.slug,
    status: row.status as ProductStatus,
    images,
    isProvisional: row.is_provisional,
    brandSlug,
    brandName,
    availability: (inventory?.availability ??
      row.availability) as ProductAvailability,
    demoLabel: "",
    stockQuantity: inventory?.quantity ?? null,
  };
}
