"use server";

import { headers } from "next/headers";
import { getCachedProductsByIds } from "@/lib/catalogue/cache";
import { logger } from "@/lib/logger";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import {
  getRestockStore,
  parseRestockContact,
} from "@/lib/stock/restock-requests";

export type RestockRequestState = {
  ok?: boolean;
  message?: string;
  error?: string;
};

const HOUR_MS = 60 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** "Tell me when it is back" — saves the request; an email or a staff WhatsApp follows when stock returns. */
export async function requestRestockAction(
  _previous: RestockRequestState,
  formData: FormData,
): Promise<RestockRequestState> {
  // Hidden field real people never fill in: bots do. Pretend it worked.
  if (String(formData.get("website") ?? "").trim()) {
    return { ok: true, message: "Thank you. We will let you know." };
  }

  const productId = String(formData.get("productId") ?? "");
  const contact = parseRestockContact(String(formData.get("contact") ?? ""));
  if (!UUID.test(productId)) {
    return { error: "We could not find that drink. Please refresh the page." };
  }
  if (!contact) {
    return {
      error: "Enter a valid email address or phone number, like 0788 123 456.",
    };
  }

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const [byIp, byContact] = await Promise.all([
    consumeRateLimit(`restock:ip:${ip}`, 10, HOUR_MS),
    consumeRateLimit(`restock:contact:${contact.contact}`, 5, 24 * HOUR_MS),
  ]);
  if (!byIp.ok || !byContact.ok) {
    return { error: "Too many requests. Please try again later." };
  }

  const [product] = await getCachedProductsByIds([productId]);
  if (!product || product.status !== "published") {
    return { error: "We could not find that drink. Please refresh the page." };
  }

  try {
    await getRestockStore().add(product.id, contact, new Date());
  } catch (error) {
    logger.error("Could not save restock request", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return { error: "Something went wrong. Please try again in a moment." };
  }

  return {
    ok: true,
    message:
      contact.kind === "email"
        ? "Done. We will email you once, as soon as it is back."
        : "Done. We will message you on WhatsApp as soon as it is back.",
  };
}
