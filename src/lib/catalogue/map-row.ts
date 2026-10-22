import type { DemoProduct, ProductAvailability } from "@/domain/catalogue";
import type {
  ImageProcessingStatus,
  ProductImage,
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
  is_shared_multi_product_photo: boolean | null;
  needs_client_confirmation: boolean | null;
};

type InventoryRow = {
  quantity: number | null;
  availability: string;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_rwf: number | string | null;
  compare_at_price_rwf?: number | string | null;
  status: string;
  availability: string;
  is_provisional: boolean | null;
  is_featured?: boolean | null;
  featured_sort?: number | null;
  sku?: string | null;
  barcode?: string | null;
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

function coercePriceRwf(value: number | string | null | undefined): number {
  const raw =
    typeof value === "string" ? Number.parseFloat(value) : Number(value);
  if (!Number.isFinite(raw) || raw < 0) {
    return 0;
  }
  return Math.round(raw);
}

function mapImageRow(image: ImageRow): ProductImage | null {
  if (!image?.id || !image.src) return null;
  const width = Number(image.width);
  const height = Number(image.height);
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    return null;
  }
  return {
    id: image.id,
    role: (image.role || "catalogue_primary") as ProductImageRole,
    src: image.src,
    zoomSrc: image.zoom_src ?? undefined,
    alt: image.alt?.trim() || "Product image",
    width: Math.round(width),
    height: Math.round(height),
    sortOrder: Number.isFinite(Number(image.sort_order))
      ? Math.max(0, Math.round(Number(image.sort_order)))
      : 0,
    processingStatus: (image.processing_status ||
      "approved_for_catalogue") as ImageProcessingStatus,
    originalRef: image.original_ref ?? undefined,
    sourceFilename: image.source_filename ?? undefined,
    cropInstructions: image.crop_instructions ?? undefined,
    rightsNote: image.rights_note ?? undefined,
    isSharedMultiProductPhoto: Boolean(image.is_shared_multi_product_photo),
    needsClientConfirmation: Boolean(image.needs_client_confirmation),
  };
}

export function mapProductRow(row: ProductRow): DemoProduct {
  const images = [...(row.product_images ?? [])]
    .map(mapImageRow)
    .filter((image): image is ProductImage => image !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const inventory = firstEmbed(row.inventory_levels);
  const brand = firstEmbed(row.brands);
  const category = firstEmbed(row.categories);
  const brandSlug = brand?.slug ?? "unknown";
  const brandName = brand?.name ?? "Unknown";
  const priceAmount = coercePriceRwf(row.price_rwf);
  const compareRaw =
    row.compare_at_price_rwf === null || row.compare_at_price_rwf === undefined
      ? 0
      : coercePriceRwf(row.compare_at_price_rwf);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name ?? "Untitled product",
    description: row.description ?? "",
    price: moneyRwf(priceAmount),
    compareAtPrice:
      compareRaw > priceAmount ? moneyRwf(compareRaw) : undefined,
    categorySlug: category?.slug,
    status: (row.status || "draft") as ProductStatus,
    images,
    isProvisional: Boolean(row.is_provisional),
    brandSlug,
    brandName,
    availability: (inventory?.availability ??
      row.availability ??
      "unknown") as ProductAvailability,
    demoLabel: "",
    stockQuantity: inventory?.quantity ?? null,
    isFeatured: Boolean(row.is_featured),
    featuredSort: row.featured_sort ?? 0,
    sku: row.sku ?? undefined,
    barcode: row.barcode ?? undefined,
  };
}
