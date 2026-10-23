"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import {
  actionError,
  actionOk,
  toActionError,
  type AdminActionResult,
} from "@/lib/admin/action-result";
import {
  GENERIC_AUTH_ERROR,
  resolveAdminLogin,
} from "@/lib/admin/auth-login";
import {
  bulkImportTemplateCsv,
  validateBulkImportCsv,
} from "@/lib/admin/bulk-import";
import {
  impliedDiscountPercent,
  parseDiscountPercent,
} from "@/lib/admin/discount";
import {
  inviteAdminByEmail,
  resendInvite,
  updateAdminMember,
} from "@/lib/admin/profiles";
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
  adminListBrandsDurable,
  adminListCategoriesDurable,
  adminSetDiscountDurable,
  adminListProductsDurable,
  adminSetFeaturedDurable,
  adminSetStatusBulkDurable,
  adminUpsertBrandDurable,
  adminUpsertCategoryDurable,
  adminUpsertProductDurable,
} from "@/lib/admin/catalogue-durable";
import { uploadProductImage } from "@/lib/admin/media/upload";
import { publishIssues } from "@/lib/admin/readiness";
import type { AdminProductInput } from "@/lib/admin/store";
import { revalidateCatalogue } from "@/lib/catalogue/cache";
import { getServerEnv } from "@/lib/env";
import { queueBackInStockNotices } from "@/lib/notifications/back-in-stock";
import { processDueNotifications } from "@/lib/notifications/outbox";
import {
  eraseCustomerData,
  parseCustomerPhone,
} from "@/lib/privacy/customer-data";
import { primaryCatalogueImage } from "@/lib/product-image";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { isValidSlug, uniqueSlug } from "@/lib/slug";
import { adjustStockDurable } from "@/lib/stock/durable";
import { getRestockStore } from "@/lib/stock/restock-requests";

const SLUG_RULE =
  "Web address names can only use lowercase letters, numbers and hyphens.";

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

/** Refresh every admin page plus the public catalogue after a change. */
function refreshAdmin() {
  revalidatePath("/admin", "layout");
  revalidateCatalogue();
  // After the response is sent: email shoppers waiting for a drink that has just come back.
  try {
    after(async () => {
      try {
        if ((await queueBackInStockNotices()) > 0) {
          await processDueNotifications({ limit: 20 });
        }
      } catch {
        // The daily maintenance run retries, so a failure here is never user-visible.
      }
    });
  } catch {
    // Not inside a request (tests): skip, the daily run covers it.
  }
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function actorUserId(session: AdminSession): string | null {
  return session.sub.startsWith("bootstrap:") ? null : session.sub;
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
  const limit = await consumeRateLimit(`admin-login:${ip}`, 8, 15 * 60 * 1000);
  if (!limit.ok) {
    return { error: GENERIC_AUTH_ERROR };
  }

  if (!getServerEnv().ADMIN_SESSION_SECRET) {
    console.error(
      JSON.stringify({
        type: "admin_login_misconfigured",
        reason: "ADMIN_SESSION_SECRET_missing",
      }),
    );
    return {
      error: "Sign-in is temporarily unavailable. Please try again later.",
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

// ───────────────────────────── Team ─────────────────────────────

export async function inviteAdminAction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const session = await requireSession("admins:manage");
    const email = text(formData, "email").toLowerCase();
    const roleRaw = text(formData, "role") || "staff";
    const displayName = text(formData, "displayName");

    if (!email.includes("@")) return actionError("Enter a valid email address.");
    if (!isAdminRole(roleRaw)) return actionError("Choose a valid role.");

    // Only an existing owner may create another owner.
    const role: AdminRole = roleRaw;
    if (role === "owner" && session.role !== "owner") {
      return actionError("You do not have permission to do that.");
    }

    const limit = await consumeRateLimit(
      `admin-invite:${session.sub}`,
      10,
      60 * 60 * 1000,
    );
    if (!limit.ok) return actionError("Too many invites. Try again later.");

    const result = await inviteAdminByEmail({
      email,
      role,
      displayName: displayName || undefined,
      invitedByUserId: actorUserId(session),
    });

    if (!result.ok) {
      if (result.error.includes("already on the team")) {
        return actionError(result.error);
      }
      console.error(
        JSON.stringify({ type: "admin_invite_error", message: result.error }),
      );
      return actionError(
        "Could not send the invite. Check the email address and try again.",
      );
    }

    refreshAdmin();
    return actionOk(result.message ?? `Invite sent to ${email}.`);
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateMemberAction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const session = await requireSession("admins:manage");
    const userId = text(formData, "userId");
    const roleRaw = text(formData, "role");
    if (!userId) return actionError("Member not found.");
    if (roleRaw && !isAdminRole(roleRaw)) return actionError("Choose a valid role.");

    const result = await updateAdminMember({
      userId,
      actorUserId: actorUserId(session),
      displayName: text(formData, "displayName") || null,
      role: roleRaw && isAdminRole(roleRaw) ? roleRaw : undefined,
    });
    if (!result.ok) return actionError(result.error);

    refreshAdmin();
    return actionOk("Team member updated.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function setMemberActiveAction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const session = await requireSession("admins:manage");
    const userId = text(formData, "userId");
    const isActive = text(formData, "active") === "true";
    if (!userId) return actionError("Member not found.");

    const result = await updateAdminMember({
      userId,
      actorUserId: actorUserId(session),
      isActive,
    });
    if (!result.ok) return actionError(result.error);

    refreshAdmin();
    return actionOk(isActive ? "Access restored." : "Access removed.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function resendInviteAction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const session = await requireSession("admins:manage");
    const userId = text(formData, "userId");
    if (!userId) return actionError("Member not found.");

    const limit = await consumeRateLimit(
      `admin-invite:${session.sub}`,
      10,
      60 * 60 * 1000,
    );
    if (!limit.ok) return actionError("Too many invites. Try again later.");

    const result = await resendInvite({
      userId,
      actorUserId: actorUserId(session),
    });
    if (!result.ok) return actionError(result.error);

    refreshAdmin();
    return actionOk("Invite sent again.");
  } catch (error) {
    return toActionError(error);
  }
}

// ──────────────────────────── Products ───────────────────────────

const EDITABLE_STATUSES = ["draft", "published", "archived"] as const;

/** A brand is optional: a blank name means "no brand". */
async function resolveBrand(
  brandName: string,
): Promise<{ brandSlug: string; brandName: string }> {
  if (!brandName) return { brandSlug: "", brandName: "" };
  const brands = await adminListBrandsDurable();
  const match = brands.find(
    (brand) => brand.name.toLowerCase() === brandName.toLowerCase(),
  );
  if (match) return { brandSlug: match.slug, brandName: match.name };
  const slug = uniqueSlug(
    brandName,
    new Set(brands.map((brand) => brand.slug)),
    "brand",
  );
  return { brandSlug: slug, brandName };
}

export async function saveProductAction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const session = await requireSession("products:write");
    const id = text(formData, "id") || undefined;

    const name = text(formData, "name");
    if (!name) return actionError("Product name is required.");
    const brandNameRaw = text(formData, "brandName");

    const existing = id ? await adminGetProductDurable(id) : undefined;
    if (id && !existing) return actionError("That product no longer exists.");

    let priceAmount = Number.parseInt(text(formData, "priceAmount"), 10);
    if (!Number.isInteger(priceAmount) || priceAmount < 0) {
      return actionError("Price must be a whole number of RWF, like 15000.");
    }
    let discountPercent = parseDiscountPercent(text(formData, "discountPercent"));

    if (!roleHasPermission(session.role, "products:price")) {
      if (!existing) {
        return actionError("You do not have permission to set prices.");
      }
      const regular = existing.compareAtPrice?.amount ?? existing.price.amount;
      if (priceAmount !== regular) {
        return actionError("You do not have permission to change prices.");
      }
      priceAmount = regular;
      discountPercent = impliedDiscountPercent(
        existing.price.amount,
        existing.compareAtPrice?.amount,
      );
    }

    const availability = text(
      formData,
      "availability",
    ) as AdminProductInput["availability"];
    const stockRaw = text(formData, "stockQuantity");
    let stockQuantity: number | null = null;
    if (availability === "unknown") {
      stockQuantity = null;
    } else if (stockRaw === "") {
      stockQuantity = availability === "out_of_stock" ? 0 : null;
    } else {
      stockQuantity = Number.parseInt(stockRaw, 10);
      if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
        return actionError("Stock quantity must be a whole number, 0 or more.");
      }
    }

    const statusRaw = text(formData, "status") || "draft";
    if (!(EDITABLE_STATUSES as readonly string[]).includes(statusRaw)) {
      return actionError("Choose a valid status.");
    }

    const imageFile = formData.get("image");
    const willUpload =
      imageFile instanceof File && imageFile.size > 0;
    const hasExistingImage = !!primaryCatalogueImage(existing?.images ?? []);
    let status = statusRaw as AdminProductInput["status"];
    let heldAsDraftForImage = false;
    if (status === "published" && !willUpload && !hasExistingImage) {
      status = "draft";
      heldAsDraftForImage = true;
    }

    // Web address name: generated from the name unless someone chose their own.
    let slug = text(formData, "slug").toLowerCase();
    if (slug) {
      if (!isValidSlug(slug)) return actionError(SLUG_RULE);
    } else if (existing) {
      slug = existing.slug;
    } else {
      slug = uniqueSlug(name, await adminExistingSlugsDurable(), "product");
    }

    const brand = await resolveBrand(brandNameRaw);

    const input: AdminProductInput = {
      id,
      slug,
      name,
      description: text(formData, "description"),
      priceAmount,
      discountPercent,
      categorySlug: text(formData, "categorySlug") || undefined,
      brandSlug: brand.brandSlug,
      brandName: brand.brandName,
      status,
      availability,
      isProvisional: formData.get("isProvisional") === "on",
      sku: text(formData, "sku") || undefined,
      barcode: text(formData, "barcode") || undefined,
      stockQuantity,
    };

    let product = await adminUpsertProductDurable(session, input);

    if (willUpload && imageFile instanceof File) {
      try {
        const buffer = new Uint8Array(await imageFile.arrayBuffer());
        await uploadProductImage({
          productId: product.id,
          bytes: buffer,
          alt: text(formData, "imageAlt") || product.name,
          role: "catalogue_primary",
        });
      } catch (error) {
        if (status === "published") {
          product = await adminUpsertProductDurable(session, {
            ...input,
            id: product.id,
            status: "draft",
          });
          refreshAdmin();
          revalidatePath(`/product/${product.slug}`);
          return actionOk(
            "Product saved as a draft — the image failed to upload. Fix the image, then publish.",
          );
        }
        console.error(
          JSON.stringify({
            type: "admin_product_image_with_save_error",
            message: error instanceof Error ? error.message : String(error),
          }),
        );
        refreshAdmin();
        return actionOk(
          "Product saved, but the image failed to upload. Try uploading it again.",
        );
      }
    }

    refreshAdmin();
    revalidatePath(`/product/${product.slug}`);
    if (heldAsDraftForImage) {
      return actionOk(
        "Saved as a draft. Add a product photo before you publish it.",
      );
    }
    return actionOk(id ? "Product saved." : "Product added.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function setDiscountAction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const session = await requireSession("products:price");
    const id = text(formData, "id");
    const percent = parseDiscountPercent(text(formData, "discountPercent"));
    const product = await adminSetDiscountDurable(session, id, percent);
    refreshAdmin();
    revalidatePath(`/product/${product.slug}`);
    return actionOk(percent > 0 ? `${percent}% discount applied.` : "Discount removed.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function setFeaturedAction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const session = await requireSession("products:write");
    const id = text(formData, "id");
    const isFeatured = text(formData, "featured") !== "false";
    const sortRaw = text(formData, "featuredSort") || "0";
    const featuredSort = Number.parseInt(sortRaw, 10);
    if (!Number.isInteger(featuredSort) || featuredSort < 0) {
      return actionError("Position must be a whole number, 0 or more.");
    }
    const product = await adminSetFeaturedDurable(
      session,
      id,
      isFeatured,
      featuredSort,
    );
    refreshAdmin();
    revalidatePath("/");
    revalidatePath(`/product/${product.slug}`);
    return actionOk(
      isFeatured ? "Featured products updated." : "Removed from featured.",
    );
  } catch (error) {
    return toActionError(error);
  }
}

export async function archiveProductAction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const session = await requireSession("products:write");
    const id = text(formData, "id");
    const product = await adminArchiveProductDurable(session, id);
    refreshAdmin();
    revalidatePath(`/product/${product.slug}`);
    return actionOk("Product archived. It is hidden from the shop.");
  } catch (error) {
    return toActionError(error);
  }
}

/** Staff messaged a shopper who asked to be told when a drink is back: take them off the list. */
export async function markRestockContactedAction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    await requireSession("products:write");
    const id = text(formData, "id");
    const productId = text(formData, "productId");
    const store = getRestockStore();
    const waiting = await store.listWaiting({ productId });
    const target = waiting.filter((request) => request.id === id);
    if (target.length === 0) return actionOk("That request was already cleared.");
    await store.markNotified([id], new Date());
    revalidatePath(`/admin/products/${productId}`);
    return actionOk("Done. They are off the waiting list.");
  } catch (error) {
    return toActionError(error);
  }
}

/** Removes a customer's personal details on request (owner only). The activity log never stores the phone number. */
export async function eraseCustomerDataAction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const session = await requireSession("admins:manage");
    const phone = parseCustomerPhone(text(formData, "phone"));
    if (!phone) return actionError("Enter a valid phone number first.");

    const result = await eraseCustomerData(phone);
    const client = getSupabaseServiceClient();
    await client?.from("audit_events").insert({
      actor_user_id: actorUserId(session),
      action: "privacy.erase",
      entity_type: "customer_data",
      entity_id: null,
      metadata: { ...result },
    });
    revalidatePath("/admin/privacy");

    const left =
      result.ordersInProgress > 0
        ? ` ${result.ordersInProgress} order(s) are still in progress and were kept. Come back once they are delivered or cancelled.`
        : "";
    return actionOk(
      `Removed details from ${result.ordersErased} finished order(s) and deleted ${result.requestsDeleted} stock request(s).${left}`,
    );
  } catch (error) {
    return toActionError(error);
  }
}

const BULK_LIMIT = 200;

/** Publish, move to drafts, or archive several products at once from the Products list. */
export async function bulkProductsAction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const session = await requireSession("products:write");
    const intent = text(formData, "intent");
    const status =
      intent === "publish"
        ? "published"
        : intent === "draft"
          ? "draft"
          : intent === "archive"
            ? "archived"
            : null;
    if (!status) return actionError("Choose what to do with the selected products.");

    const ids = [
      ...new Set(formData.getAll("ids").map((value) => String(value))),
    ].slice(0, BULK_LIMIT);
    if (ids.length === 0) return actionError("Select at least one product first.");

    const all = await adminListProductsDurable();
    const selected = all.filter((product) => ids.includes(product.id));
    let eligible = selected;
    const held: string[] = [];

    if (status === "published") {
      // Never put an unfinished product in front of customers.
      eligible = selected.filter((product) => {
        const issues = publishIssues(product);
        if (issues.length > 0) held.push(`${product.name} (${issues.join(", ").toLowerCase()})`);
        return issues.length === 0;
      });
    }

    const changed = await adminSetStatusBulkDurable(
      session,
      eligible.map((product) => product.id),
      status,
    );
    refreshAdmin();
    revalidatePath("/");

    const verb =
      status === "published"
        ? "published"
        : status === "draft"
          ? "moved to drafts"
          : "archived";
    const base = `${changed} ${changed === 1 ? "product" : "products"} ${verb}.`;
    if (held.length > 0) {
      return actionOk(
        `${base} Not published because something is missing: ${held.slice(0, 3).join("; ")}${held.length > 3 ? ` and ${held.length - 3} more` : ""}.`,
      );
    }
    return actionOk(base);
  } catch (error) {
    return toActionError(error);
  }
}

// ─────────────────────── Categories and brands ───────────────────

export async function saveCategoryAction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const session = await requireSession("products:write");
    const name = text(formData, "name");
    const description = text(formData, "description");
    if (!name) return actionError("Category name is required.");

    // Existing category (edit): the web address name never changes.
    const existingSlug = text(formData, "existingSlug").toLowerCase();
    let slug = existingSlug || text(formData, "slug").toLowerCase();
    if (slug) {
      if (!isValidSlug(slug)) return actionError(SLUG_RULE);
      if (!existingSlug) {
        const taken = new Set(
          (await adminListCategoriesDurable()).map((row) => row.slug),
        );
        if (taken.has(slug)) {
          return actionError("A category with that web address name already exists.");
        }
      }
    } else {
      const taken = new Set(
        (await adminListCategoriesDurable()).map((row) => row.slug),
      );
      slug = uniqueSlug(name, taken, "category");
    }

    await adminUpsertCategoryDurable(session, { slug, name, description });
    refreshAdmin();
    return actionOk(existingSlug ? "Category saved." : "Category added.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function saveBrandAction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const session = await requireSession("products:write");
    const name = text(formData, "name");
    if (!name) return actionError("Brand name is required.");

    const existingSlug = text(formData, "existingSlug").toLowerCase();
    let slug = existingSlug || text(formData, "slug").toLowerCase();
    const taken = new Set(
      (await adminListBrandsDurable()).map((row) => row.slug),
    );
    if (slug) {
      if (!isValidSlug(slug)) return actionError(SLUG_RULE);
      if (!existingSlug && taken.has(slug)) {
        return actionError("A brand with that web address name already exists.");
      }
    } else {
      slug = uniqueSlug(name, taken, "brand");
    }

    await adminUpsertBrandDurable(session, { slug, name });
    refreshAdmin();
    return actionOk(existingSlug ? "Brand saved." : "Brand added.");
  } catch (error) {
    return toActionError(error);
  }
}

// ───────────────────────────── Images ────────────────────────────

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
    return { error: humanizeUploadError(error) };
  }
  refreshAdmin();
  revalidatePath(`/admin/products/${productId}`);
  return { ok: true };
}

function humanizeUploadError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  const lower = message.toLowerCase();
  if (
    lower.includes("service role") ||
    lower.includes("not configured")
  ) {
    return "Image upload is temporarily unavailable. Please try again later.";
  }
  if (
    lower.includes("bucket") ||
    lower.includes("not found") ||
    lower.includes("row-level security") ||
    lower.includes("unauthorized") ||
    lower.includes("permission")
  ) {
    return "Image storage is not ready for this environment. Ask an owner to finish media setup.";
  }
  if (lower.includes("10 mib") || lower.includes("exceeds")) {
    return "That file is too large. Use an image under 10 MB.";
  }
  if (
    lower.includes("unsupported") ||
    lower.includes("magic") ||
    lower.includes("empty upload")
  ) {
    return "Use a JPEG, PNG, or WebP image.";
  }
  if (message) {
    console.error(
      JSON.stringify({ type: "admin_product_image_upload_error", message }),
    );
  }
  return "Could not upload the image. Please try again.";
}

// ───────────────────────────── Stock ─────────────────────────────

export async function adjustStockAction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const session = await requireSession("inventory:adjust");
    const productId = text(formData, "productId");
    const reason = text(formData, "reason");
    const newAvailability = (text(formData, "newAvailability") ||
      "unknown") as AdminProductInput["availability"];
    const qtyRaw = text(formData, "newQuantity");
    const expectedRaw = text(formData, "expectedQuantity");

    if (!productId) return actionError("Choose a product.");
    if (!reason) return actionError("Add a short reason for this change.");

    const newQuantity =
      newAvailability === "unknown"
        ? null
        : qtyRaw === ""
          ? newAvailability === "out_of_stock"
            ? 0
            : null
          : Number.parseInt(qtyRaw, 10);
    if (
      newQuantity !== null &&
      (!Number.isInteger(newQuantity) || newQuantity < 0)
    ) {
      return actionError("Stock quantity must be a whole number, 0 or more.");
    }

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
    refreshAdmin();
    return actionOk("Stock updated.");
  } catch (error) {
    return toActionError(error);
  }
}

// ───────────────────────────── Import ────────────────────────────

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
    refreshAdmin();
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
