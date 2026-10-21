"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  GENERIC_AUTH_ERROR,
  resolveAdminLogin,
} from "@/lib/admin/auth-login";
import {
  bulkImportTemplateCsv,
  validateBulkImportCsv,
} from "@/lib/admin/bulk-import";
import { inviteAdminByEmail } from "@/lib/admin/profiles";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import {
  isAdminRole,
  roleHasPermission,
  type AdminPermission,
  type AdminRole,
} from "@/lib/admin/roles";
import {
  clearAdminSessionCookie,
  getAdminSession,
  setAdminSessionCookie,
  type AdminSession,
} from "@/lib/admin/session";
import {
  adminApplyBulkImportDurable,
  adminArchiveProductDurable,
  adminExistingSlugsDurable,
  adminGetProductDurable,
  adminUpsertBrandDurable,
  adminUpsertCategoryDurable,
  adminUpsertProductDurable,
} from "@/lib/admin/catalogue-durable";
import { uploadProductImage } from "@/lib/admin/media/upload";
import type { AdminProductInput } from "@/lib/admin/store";
import { revalidateCatalogue } from "@/lib/catalogue/cache";
import { getServerEnv } from "@/lib/env";
import { adjustStockDurable } from "@/lib/stock/durable";

async function requireSession(
  permission?: AdminPermission,
): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  if (permission && !roleHasPermission(session.role, permission)) {
    throw new Error("Not authorised for this action.");
  }
  return session;
}

export async function adminLoginAction(formData: FormData): Promise<{
  error?: string;
}> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const bootstrapToken = String(formData.get("token") ?? "");

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = consumeRateLimit(`admin-login:${ip}`, 8, 15 * 60 * 1000);
  if (!limit.ok) {
    return { error: GENERIC_AUTH_ERROR };
  }

  if (!getServerEnv().ADMIN_SESSION_SECRET) {
    return {
      error:
        "Admin sessions are not configured. Set ADMIN_SESSION_SECRET (≥ 32 chars).",
    };
  }

  const result = await resolveAdminLogin({
    email,
    password,
    bootstrapToken,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  await setAdminSessionCookie(result.session);
  redirect("/admin");
}

export async function adminLogoutAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

export async function inviteAdminAction(formData: FormData): Promise<{
  error?: string;
  ok?: boolean;
}> {
  const session = await requireSession("admins:manage");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const roleRaw = String(formData.get("role") ?? "staff");
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!isAdminRole(roleRaw)) {
    return { error: "Choose a valid role." };
  }

  // Only an existing owner may create another owner.
  const role: AdminRole = roleRaw;
  if (role === "owner" && session.role !== "owner") {
    return { error: "Not authorised for this action." };
  }

  const limit = consumeRateLimit(
    `admin-invite:${session.sub}`,
    10,
    60 * 60 * 1000,
  );
  if (!limit.ok) {
    return { error: "Too many invites. Try again later." };
  }

  const result = await inviteAdminByEmail({
    email,
    role,
    displayName: displayName || undefined,
    invitedByUserId: session.sub.startsWith("bootstrap:")
      ? null
      : session.sub,
  });

  if (!result.ok) {
    // Avoid leaking whether the email exists in Auth.
    return { error: "Could not send invite. Check the email and try again." };
  }

  return { ok: true };
}

export async function saveProductAction(formData: FormData) {
  const session = await requireSession("products:write");
  const id = String(formData.get("id") ?? "") || undefined;
  const priceRaw = String(formData.get("priceAmount") ?? "");
  let priceAmount = Number.parseInt(priceRaw, 10);
  if (!Number.isInteger(priceAmount) || priceAmount < 0) {
    throw new Error("Price must be a non-negative integer RWF amount.");
  }

  const existing = id ? await adminGetProductDurable(id) : undefined;
  const canSetPrice = roleHasPermission(session.role, "products:price");
  if (!canSetPrice) {
    if (!existing) {
      throw new Error("Not authorised to set product prices.");
    }
    if (priceAmount !== existing.price.amount) {
      throw new Error("Not authorised to change product prices.");
    }
    priceAmount = existing.price.amount;
  }

  const stockRaw = String(formData.get("stockQuantity") ?? "").trim();
  const availability = String(
    formData.get("availability") ?? "unknown",
  ) as AdminProductInput["availability"];
  let stockQuantity: number | null = null;
  if (availability === "unknown") {
    stockQuantity = null;
  } else if (stockRaw === "") {
    stockQuantity = availability === "out_of_stock" ? 0 : null;
  } else {
    stockQuantity = Number.parseInt(stockRaw, 10);
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      throw new Error("Stock quantity must be a non-negative integer.");
    }
  }

  const featuredSortRaw = String(formData.get("featuredSort") ?? "0").trim();
  const featuredSort = Number.parseInt(featuredSortRaw, 10);

  const input: AdminProductInput = {
    id,
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    priceAmount,
    categorySlug:
      String(formData.get("categorySlug") ?? "").trim() || undefined,
    brandSlug: String(formData.get("brandSlug") ?? "").trim(),
    brandName: String(formData.get("brandName") ?? "").trim(),
    status: String(
      formData.get("status") ?? "draft",
    ) as AdminProductInput["status"],
    availability,
    isProvisional: formData.get("isProvisional") === "on",
    sku: String(formData.get("sku") ?? "").trim() || undefined,
    barcode: String(formData.get("barcode") ?? "").trim() || undefined,
    stockQuantity,
    isFeatured: formData.get("isFeatured") === "on",
    featuredSort: Number.isInteger(featuredSort) && featuredSort >= 0
      ? featuredSort
      : 0,
  };

  const product = await adminUpsertProductDurable(session, input);
  revalidateCatalogue();
  if (product.slug) {
    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/product/${product.slug}`);
  }
  redirect(`/admin/products/${product.id}?saved=1`);
}

export async function archiveProductAction(formData: FormData) {
  const session = await requireSession("products:write");
  const id = String(formData.get("id") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (confirm !== "ARCHIVE") {
    throw new Error("Type ARCHIVE to confirm.");
  }
  await adminArchiveProductDurable(session, id);
  revalidateCatalogue();
  redirect("/admin/products?archived=1");
}

export async function saveCategoryAction(formData: FormData) {
  const session = await requireSession("products:write");
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !name) {
    throw new Error("Valid slug and name are required.");
  }
  await adminUpsertCategoryDurable(session, { slug, name, description });
  revalidateCatalogue();
  redirect("/admin/categories?saved=1");
}

export async function saveBrandAction(formData: FormData) {
  const session = await requireSession("products:write");
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !name) {
    throw new Error("Valid slug and name are required.");
  }
  await adminUpsertBrandDurable(session, { slug, name });
  revalidateCatalogue();
  redirect("/admin/brands?saved=1");
}

export async function uploadProductImageAction(formData: FormData): Promise<{
  error?: string;
  ok?: boolean;
}> {
  await requireSession("products:write");
  const productId = String(formData.get("productId") ?? "").trim();
  const alt = String(formData.get("alt") ?? "").trim();
  const file = formData.get("file");
  if (!productId || !(file instanceof File)) {
    return { error: "Product and image file are required." };
  }
  const product = await adminGetProductDurable(productId);
  if (!product) return { error: "Product not found." };

  const buffer = new Uint8Array(await file.arrayBuffer());
  try {
    await uploadProductImage({
      productId,
      bytes: buffer,
      alt: alt || product.name,
      role: "catalogue_primary",
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Upload failed.",
    };
  }
  return { ok: true };
}

export async function adjustStockAction(formData: FormData) {
  const session = await requireSession("inventory:adjust");
  const productId = String(formData.get("productId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const newAvailability = String(
    formData.get("newAvailability") ?? "unknown",
  ) as AdminProductInput["availability"];
  const qtyRaw = String(formData.get("newQuantity") ?? "").trim();
  const expectedRaw = String(formData.get("expectedQuantity") ?? "").trim();

  const newQuantity =
    newAvailability === "unknown"
      ? null
      : qtyRaw === ""
        ? newAvailability === "out_of_stock"
          ? 0
          : null
        : Number.parseInt(qtyRaw, 10);

  const expectedQuantity =
    expectedRaw === "" || expectedRaw === "null"
      ? null
      : Number.parseInt(expectedRaw, 10);

  await adjustStockDurable(session, {
    productId,
    newQuantity,
    newAvailability,
    reason,
    expectedQuantity,
  });
  revalidateCatalogue();
  redirect("/admin/stock?adjusted=1");
}

export async function previewBulkImportAction(formData: FormData): Promise<{
  reportJson: string;
}> {
  await requireSession("import:run");
  const csv = String(formData.get("csv") ?? "");
  const report = validateBulkImportCsv(csv, {
    dryRun: true,
    existingSlugs: await adminExistingSlugsDurable(),
  });
  return { reportJson: JSON.stringify(report) };
}

export async function applyBulkImportAction(formData: FormData): Promise<{
  error?: string;
  applied?: number;
  reportJson?: string;
}> {
  const session = await requireSession("import:run");
  const csv = String(formData.get("csv") ?? "");
  const report = validateBulkImportCsv(csv, {
    dryRun: false,
    existingSlugs: new Set(),
  });
  if (report.invalidRows > 0) {
    return {
      error: "Fix invalid rows before applying.",
      reportJson: JSON.stringify(report),
    };
  }
  const rows = report.results
    .filter((row) => row.ok)
    .map((row) => {
      if (!row.ok) throw new Error("unreachable");
      return row.data;
    });
  try {
    const result = await adminApplyBulkImportDurable(session, rows);
    revalidateCatalogue();
    return { applied: result.applied, reportJson: JSON.stringify(report) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Apply failed.",
      reportJson: JSON.stringify(report),
    };
  }
}

export async function downloadBulkTemplateAction() {
  await requireSession("import:run");
  return bulkImportTemplateCsv();
}
