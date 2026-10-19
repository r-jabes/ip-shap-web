"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  bulkImportTemplateCsv,
  validateBulkImportCsv,
} from "@/lib/admin/bulk-import";
import { consumeRateLimit } from "@/lib/admin/rate-limit";
import { roleHasPermission, type AdminPermission } from "@/lib/admin/roles";
import {
  clearAdminSessionCookie,
  getAdminSession,
  safeEqualString,
  setAdminSessionCookie,
  type AdminSession,
} from "@/lib/admin/session";
import {
  adminAdjustStock,
  adminArchiveProduct,
  adminExistingSlugs,
  adminUpsertProduct,
  type AdminProductInput,
} from "@/lib/admin/store";
import { getServerEnv } from "@/lib/env";

const GENERIC_AUTH_ERROR = "Invalid credentials.";

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
  const env = getServerEnv();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const token = String(formData.get("token") ?? "");

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = consumeRateLimit(`admin-login:${ip}`, 8, 15 * 60 * 1000);
  if (!limit.ok) {
    return { error: GENERIC_AUTH_ERROR };
  }

  if (!env.ADMIN_SESSION_SECRET || !env.ADMIN_BOOTSTRAP_TOKEN) {
    return {
      error:
        "Admin login is not configured. Set ADMIN_SESSION_SECRET and ADMIN_BOOTSTRAP_TOKEN.",
    };
  }

  if (!email || !token) {
    return { error: GENERIC_AUTH_ERROR };
  }

  if (env.ADMIN_BOOTSTRAP_EMAIL && email !== env.ADMIN_BOOTSTRAP_EMAIL) {
    return { error: GENERIC_AUTH_ERROR };
  }

  if (!safeEqualString(token, env.ADMIN_BOOTSTRAP_TOKEN)) {
    return { error: GENERIC_AUTH_ERROR };
  }

  await setAdminSessionCookie({
    sub: randomUUID(),
    email,
    role: "owner",
  });
  redirect("/admin");
}

export async function adminLogoutAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

export async function saveProductAction(formData: FormData) {
  const session = await requireSession("products:write");
  const id = String(formData.get("id") ?? "") || undefined;
  const priceRaw = String(formData.get("priceAmount") ?? "");
  const priceAmount = Number.parseInt(priceRaw, 10);
  if (!Number.isInteger(priceAmount) || priceAmount < 0) {
    throw new Error("Price must be a non-negative integer RWF amount.");
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
  };

  const product = adminUpsertProduct(session, input);
  redirect(`/admin/products/${product.id}?saved=1`);
}

export async function archiveProductAction(formData: FormData) {
  const session = await requireSession("products:write");
  const id = String(formData.get("id") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (confirm !== "ARCHIVE") {
    throw new Error("Type ARCHIVE to confirm.");
  }
  adminArchiveProduct(session, id);
  redirect("/admin/products?archived=1");
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

  adminAdjustStock(session, {
    productId,
    newQuantity,
    newAvailability,
    reason,
    expectedQuantity,
  });
  redirect("/admin/stock?adjusted=1");
}

export async function previewBulkImportAction(formData: FormData): Promise<{
  reportJson: string;
}> {
  await requireSession("import:run");
  const csv = String(formData.get("csv") ?? "");
  const report = validateBulkImportCsv(csv, {
    dryRun: true,
    existingSlugs: adminExistingSlugs(),
  });
  return { reportJson: JSON.stringify(report) };
}

export async function downloadBulkTemplateAction() {
  await requireSession("import:run");
  return bulkImportTemplateCsv();
}
