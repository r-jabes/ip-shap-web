import type { Brand, Category, DemoProduct } from "@/domain/catalogue";
import type { AdminProductInput } from "@/lib/admin/store";
import {
  adminArchiveProduct,
  adminExistingSlugs,
  adminGetProduct,
  adminListProducts,
  adminUpsertBrandMemory,
  adminUpsertCategoryMemory,
  adminUpsertProduct,
  adminListBrandsMemory,
  adminListCategoriesMemory,
} from "@/lib/admin/store";
import type { AdminSession } from "@/lib/admin/session";
import { mapProductRow, type ProductRow } from "@/lib/catalogue/map-row";
import { hasSupabaseServiceConfig } from "@/lib/supabase/config";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { BulkImportRow } from "@/lib/admin/bulk-import";

const ADMIN_PRODUCT_SELECT = `
  id, slug, name, description, price_rwf, status, availability, is_provisional,
  is_featured, featured_sort,
  categories ( slug, name ),
  brands ( slug, name ),
  product_images (
    id, role, src, zoom_src, alt, width, height, sort_order, processing_status,
    original_ref, source_filename, crop_instructions, rights_note,
    is_shared_multi_product_photo, needs_client_confirmation
  ),
  inventory_levels ( quantity, availability )
`;

function isDurableCatalogueEnabled(): boolean {
  return hasSupabaseServiceConfig();
}

export async function adminListProductsDurable(): Promise<DemoProduct[]> {
  if (!isDurableCatalogueEnabled()) return adminListProducts();

  const client = getSupabaseServiceClient()!;
  const { data, error } = await client
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .order("name");
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as ProductRow[]).map((row) => {
    const product = mapProductRow(row);
    return {
      ...product,
      isFeatured: Boolean(row.is_featured),
      featuredSort: row.featured_sort ?? 0,
    };
  });
}

export async function adminGetProductDurable(
  id: string,
): Promise<DemoProduct | undefined> {
  if (!isDurableCatalogueEnabled()) return adminGetProduct(id);

  const client = getSupabaseServiceClient()!;
  const { data, error } = await client
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return undefined;
  const row = data as unknown as ProductRow;
  const product = mapProductRow(row);
  return {
    ...product,
    isFeatured: Boolean(row.is_featured),
    featuredSort: row.featured_sort ?? 0,
  };
}

export async function adminListCategoriesDurable(): Promise<Category[]> {
  if (!isDurableCatalogueEnabled()) return adminListCategoriesMemory();

  const client = getSupabaseServiceClient()!;
  const { data, error } = await client
    .from("categories")
    .select("slug, name, description")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
  }));
}

export async function adminListBrandsDurable(): Promise<Brand[]> {
  if (!isDurableCatalogueEnabled()) return adminListBrandsMemory();

  const client = getSupabaseServiceClient()!;
  const { data, error } = await client
    .from("brands")
    .select("slug, name")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ slug: row.slug, name: row.name }));
}

export async function adminUpsertCategoryDurable(
  actor: AdminSession,
  input: { slug: string; name: string; description: string },
): Promise<Category> {
  if (!isDurableCatalogueEnabled()) return adminUpsertCategoryMemory(actor, input);

  const client = getSupabaseServiceClient()!;
  const { data, error } = await client
    .from("categories")
    .upsert(
      {
        slug: input.slug,
        name: input.name,
        description: input.description,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    )
    .select("slug, name, description")
    .single();
  if (error) throw new Error(error.message);
  await client.from("audit_events").insert({
    actor_user_id: actor.sub.startsWith("bootstrap:") ? null : actor.sub,
    action: "category.upsert",
    entity_type: "categories",
    entity_id: data.slug,
    metadata: { name: data.name },
  });
  return {
    slug: data.slug,
    name: data.name,
    description: data.description ?? "",
  };
}

export async function adminUpsertBrandDurable(
  actor: AdminSession,
  input: { slug: string; name: string },
): Promise<Brand> {
  if (!isDurableCatalogueEnabled()) return adminUpsertBrandMemory(actor, input);

  const client = getSupabaseServiceClient()!;
  const { data, error } = await client
    .from("brands")
    .upsert(
      {
        slug: input.slug,
        name: input.name,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    )
    .select("slug, name")
    .single();
  if (error) throw new Error(error.message);
  await client.from("audit_events").insert({
    actor_user_id: actor.sub.startsWith("bootstrap:") ? null : actor.sub,
    action: "brand.upsert",
    entity_type: "brands",
    entity_id: data.slug,
    metadata: { name: data.name },
  });
  return { slug: data.slug, name: data.name };
}

export async function adminUpsertProductDurable(
  actor: AdminSession,
  input: AdminProductInput,
): Promise<DemoProduct> {
  if (!isDurableCatalogueEnabled()) return adminUpsertProduct(actor, input);

  const client = getSupabaseServiceClient()!;

  let categoryId: string | null = null;
  if (input.categorySlug) {
    const { data: cat } = await client
      .from("categories")
      .select("id")
      .eq("slug", input.categorySlug)
      .maybeSingle();
    categoryId = cat?.id ?? null;
    if (!categoryId) {
      const { data: created, error } = await client
        .from("categories")
        .insert({
          slug: input.categorySlug,
          name: input.categorySlug,
          description: "",
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      categoryId = created.id;
    }
  }

  const { data: brandExisting } = await client
    .from("brands")
    .select("id")
    .eq("slug", input.brandSlug)
    .maybeSingle();
  let brandId = brandExisting?.id ?? null;
  if (!brandId) {
    const { data: created, error } = await client
      .from("brands")
      .insert({ slug: input.brandSlug, name: input.brandName })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    brandId = created.id;
  } else {
    await client
      .from("brands")
      .update({ name: input.brandName, updated_at: new Date().toISOString() })
      .eq("id", brandId);
  }

  let productId = input.id;
  if (productId) {
    const existing = await adminGetProductDurable(productId);
    const publishedAt =
      input.status === "published"
        ? existing?.status === "published"
          ? undefined
          : new Date().toISOString()
        : existing?.status === "published"
          ? undefined
          : null;

    const { error } = await client
      .from("products")
      .update({
        slug: input.slug,
        name: input.name,
        description: input.description,
        price_rwf: input.priceAmount,
        status: input.status,
        availability: input.availability,
        category_id: categoryId,
        brand_id: brandId,
        is_provisional: input.isProvisional,
        is_featured: input.isFeatured ?? false,
        featured_sort: input.featuredSort ?? 0,
        ...(publishedAt !== undefined ? { published_at: publishedAt } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await client
      .from("products")
      .insert({
        slug: input.slug,
        name: input.name,
        description: input.description,
        price_rwf: input.priceAmount,
        status: input.status,
        availability: input.availability,
        category_id: categoryId,
        brand_id: brandId,
        is_provisional: input.isProvisional,
        is_featured: input.isFeatured ?? false,
        featured_sort: input.featuredSort ?? 0,
        published_at:
          input.status === "published" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    productId = data.id;
  }

  await client.from("inventory_levels").upsert(
    {
      product_id: productId,
      quantity: input.stockQuantity,
      availability: input.availability,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "product_id" },
  );

  await client.from("audit_events").insert({
    actor_user_id: actor.sub.startsWith("bootstrap:") ? null : actor.sub,
    action: input.id ? "product.update" : "product.create",
    entity_type: "products",
    entity_id: productId,
    metadata: { slug: input.slug, status: input.status },
  });

  const product = await adminGetProductDurable(productId!);
  if (!product) throw new Error("Product save failed");
  return product;
}

export async function adminArchiveProductDurable(
  actor: AdminSession,
  id: string,
): Promise<DemoProduct> {
  if (!isDurableCatalogueEnabled()) return adminArchiveProduct(actor, id);

  const client = getSupabaseServiceClient()!;
  const { error } = await client
    .from("products")
    .update({
      status: "archived",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await client.from("audit_events").insert({
    actor_user_id: actor.sub.startsWith("bootstrap:") ? null : actor.sub,
    action: "product.archive",
    entity_type: "products",
    entity_id: id,
    metadata: {},
  });
  const product = await adminGetProductDurable(id);
  if (!product) throw new Error("Product not found");
  return product;
}

export async function adminExistingSlugsDurable(): Promise<Set<string>> {
  if (!isDurableCatalogueEnabled()) return adminExistingSlugs();
  const products = await adminListProductsDurable();
  return new Set(products.map((p) => p.slug));
}

export async function adminApplyBulkImportDurable(
  actor: AdminSession,
  rows: BulkImportRow[],
): Promise<{ applied: number }> {
  if (!isDurableCatalogueEnabled()) {
    for (const row of rows) {
      adminUpsertProduct(actor, {
        slug: row.slug,
        name: row.name,
        description: row.description,
        priceAmount: row.price_rwf,
        categorySlug: row.category_slug,
        brandSlug: row.brand_slug ?? "unknown",
        brandName: row.brand_name ?? row.brand_slug ?? "Unknown",
        status: row.status,
        availability: row.availability,
        isProvisional: row.is_provisional,
        sku: row.sku,
        barcode: row.barcode,
        stockQuantity:
          row.stock_quantity === undefined ? null : row.stock_quantity,
      });
    }
    return { applied: rows.length };
  }

  const client = getSupabaseServiceClient()!;
  const { data, error } = await client.rpc("apply_bulk_catalogue_import", {
    payload: rows,
  });
  if (error) throw new Error(error.message);

  await client.from("audit_events").insert({
    actor_user_id: actor.sub.startsWith("bootstrap:") ? null : actor.sub,
    action: "catalogue.bulk_import",
    entity_type: "products",
    metadata: { applied: (data as { applied?: number })?.applied ?? rows.length },
  });

  return {
    applied: (data as { applied?: number })?.applied ?? rows.length,
  };
}
