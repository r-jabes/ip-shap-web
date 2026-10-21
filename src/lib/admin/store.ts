import { randomUUID } from "node:crypto";
import type {
  Brand,
  Category,
  DemoProduct,
  ProductAvailability,
} from "@/domain/catalogue";
import {
  DEMO_BRANDS,
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
} from "@/fixtures/demo/catalogue";
import type { AdminSession } from "@/lib/admin/session";
import { moneyRwf } from "@/lib/money";

export type StockAdjustmentRecord = {
  id: string;
  productId: string;
  actorEmail: string;
  previousQuantity: number | null;
  newQuantity: number | null;
  previousAvailability: ProductAvailability;
  newAvailability: ProductAvailability;
  reason: string;
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

type AdminStore = {
  products: DemoProduct[];
  categories: Category[];
  brands: Brand[];
  adjustments: StockAdjustmentRecord[];
  audits: AuditEvent[];
};

declare global {
  var __ipShapAdminStore: AdminStore | undefined;
}

function getStore(): AdminStore {
  if (!globalThis.__ipShapAdminStore) {
    globalThis.__ipShapAdminStore = {
      products: structuredClone(DEMO_PRODUCTS).map((product) => ({
        ...product,
        stockQuantity:
          product.availability === "unknown"
            ? null
            : (product.stockQuantity ?? 0),
        isFeatured: product.isFeatured ?? false,
        featuredSort: product.featuredSort ?? 0,
      })),
      categories: structuredClone(DEMO_CATEGORIES),
      brands: structuredClone(DEMO_BRANDS),
      adjustments: [],
      audits: [],
    };
  }
  return globalThis.__ipShapAdminStore;
}

function writeAudit(
  actor: AdminSession | null,
  action: string,
  entityType: string,
  entityId?: string,
  metadata: Record<string, unknown> = {},
) {
  getStore().audits.unshift({
    id: randomUUID(),
    actorEmail: actor?.email ?? null,
    action,
    entityType,
    entityId,
    metadata,
    createdAt: new Date().toISOString(),
  });
}

export function adminListProducts(): DemoProduct[] {
  return [...getStore().products].sort((a, b) =>
    a.name.localeCompare(b.name, "en"),
  );
}

export function adminGetProduct(id: string): DemoProduct | undefined {
  return getStore().products.find((product) => product.id === id);
}

export function adminDashboardCounts() {
  const products = getStore().products;
  return {
    totalProducts: products.length,
    published: products.filter((p) => p.status === "published").length,
    draft: products.filter((p) => p.status === "draft" || p.status === "demo")
      .length,
    archived: products.filter((p) => p.status === "archived").length,
    unknownStock: products.filter((p) => p.availability === "unknown").length,
    outOfStock: products.filter((p) => p.availability === "out_of_stock")
      .length,
    recentAdjustments: getStore().adjustments.length,
  };
}

export type AdminProductInput = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  priceAmount: number;
  categorySlug?: string;
  brandSlug: string;
  brandName: string;
  status: DemoProduct["status"];
  availability: ProductAvailability;
  isProvisional: boolean;
  sku?: string;
  barcode?: string;
  stockQuantity: number | null;
  isFeatured?: boolean;
  featuredSort?: number;
};

export function adminListCategoriesMemory(): Category[] {
  return [...getStore().categories].sort((a, b) =>
    a.name.localeCompare(b.name, "en"),
  );
}

export function adminListBrandsMemory(): Brand[] {
  return [...getStore().brands].sort((a, b) =>
    a.name.localeCompare(b.name, "en"),
  );
}

export function adminUpsertCategoryMemory(
  actor: AdminSession,
  input: { slug: string; name: string; description: string },
): Category {
  const store = getStore();
  const index = store.categories.findIndex((row) => row.slug === input.slug);
  const next: Category = {
    slug: input.slug,
    name: input.name,
    description: input.description,
  };
  if (index >= 0) store.categories[index] = next;
  else store.categories.push(next);
  writeAudit(actor, "category.upsert", "category", input.slug, {
    name: input.name,
  });
  return next;
}

export function adminUpsertBrandMemory(
  actor: AdminSession,
  input: { slug: string; name: string },
): Brand {
  const store = getStore();
  const index = store.brands.findIndex((row) => row.slug === input.slug);
  const next: Brand = { slug: input.slug, name: input.name };
  if (index >= 0) store.brands[index] = next;
  else store.brands.push(next);
  writeAudit(actor, "brand.upsert", "brand", input.slug, { name: input.name });
  return next;
}

export function adminUpsertProduct(
  actor: AdminSession,
  input: AdminProductInput,
): DemoProduct {
  const store = getStore();
  const price = moneyRwf(input.priceAmount);
  const slugTaken = store.products.some(
    (product) => product.slug === input.slug && product.id !== input.id,
  );
  if (slugTaken) {
    throw new Error("Slug already in use");
  }

  if (input.id) {
    const index = store.products.findIndex(
      (product) => product.id === input.id,
    );
    if (index < 0) throw new Error("Product not found");
    const previous = store.products[index]!;
    const next: DemoProduct = {
      ...previous,
      slug: input.slug,
      name: input.name,
      description: input.description,
      price,
      categorySlug: input.categorySlug,
      brandSlug: input.brandSlug,
      brandName: input.brandName,
      status: input.status,
      availability: input.availability,
      isProvisional: input.isProvisional,
      sku: input.sku,
      barcode: input.barcode,
      stockQuantity: input.stockQuantity,
      isFeatured: input.isFeatured ?? previous.isFeatured ?? false,
      featuredSort: input.featuredSort ?? previous.featuredSort ?? 0,
      demoLabel:
        input.status === "demo" || input.isProvisional
          ? "Provisional"
          : previous.demoLabel,
    };
    store.products[index] = next;
    writeAudit(actor, "product.update", "product", next.id, {
      slug: next.slug,
      status: next.status,
    });
    return next;
  }

  const created: DemoProduct = {
    id: randomUUID(),
    slug: input.slug,
    name: input.name,
    description: input.description,
    price,
    categorySlug: input.categorySlug,
    brandSlug: input.brandSlug,
    brandName: input.brandName,
    status: input.status,
    availability: input.availability,
    isProvisional: input.isProvisional,
    sku: input.sku,
    barcode: input.barcode,
    stockQuantity: input.stockQuantity,
    isFeatured: input.isFeatured ?? false,
    featuredSort: input.featuredSort ?? 0,
    demoLabel:
      input.status === "demo" || input.isProvisional ? "Provisional" : "Admin",
    images: [],
  };
  store.products.unshift(created);
  writeAudit(actor, "product.create", "product", created.id, {
    slug: created.slug,
  });
  return created;
}

export function adminArchiveProduct(actor: AdminSession, id: string) {
  const product = adminGetProduct(id);
  if (!product) throw new Error("Product not found");
  product.status = "archived";
  writeAudit(actor, "product.archive", "product", id, { slug: product.slug });
  return product;
}

export function adminAdjustStock(
  actor: AdminSession,
  input: {
    productId: string;
    newQuantity: number | null;
    newAvailability: ProductAvailability;
    reason: string;
    expectedQuantity?: number | null;
  },
): StockAdjustmentRecord {
  const product = adminGetProduct(input.productId);
  if (!product) throw new Error("Product not found");

  const previousQuantity =
    product.stockQuantity === undefined ? null : product.stockQuantity;
  const previousAvailability = product.availability;

  if (
    input.expectedQuantity !== undefined &&
    input.expectedQuantity !== previousQuantity
  ) {
    throw new Error(
      "Stock changed since you loaded the form — refresh and retry",
    );
  }

  if (input.newQuantity !== null && input.newQuantity < 0) {
    throw new Error("Negative stock is not allowed");
  }
  if (input.newAvailability === "unknown" && input.newQuantity !== null) {
    throw new Error("Unknown availability requires empty quantity");
  }

  const newQuantity =
    input.newAvailability === "out_of_stock" && input.newQuantity === null
      ? 0
      : input.newQuantity;

  product.stockQuantity = newQuantity;
  product.availability = input.newAvailability;

  const record: StockAdjustmentRecord = {
    id: randomUUID(),
    productId: product.id,
    actorEmail: actor.email,
    previousQuantity,
    newQuantity,
    previousAvailability,
    newAvailability: input.newAvailability,
    reason: input.reason,
    createdAt: new Date().toISOString(),
  };
  getStore().adjustments.unshift(record);
  writeAudit(actor, "inventory.adjust", "product", product.id, {
    previousQuantity,
    newQuantity,
    reason: input.reason,
  });
  return record;
}

export function adminListAdjustments(limit = 20): StockAdjustmentRecord[] {
  return getStore().adjustments.slice(0, limit);
}

export function adminListAudits(limit = 30): AuditEvent[] {
  return getStore().audits.slice(0, limit);
}

export function adminExistingSlugs(): Set<string> {
  return new Set(getStore().products.map((product) => product.slug));
}
