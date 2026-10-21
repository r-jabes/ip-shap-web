import { randomUUID } from "node:crypto";
import sharp from "sharp";
import {
  assertValidImageUpload,
  MAX_DERIVATIVE_EDGE,
  mimeForKind,
} from "@/lib/admin/media/validate";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export type UploadedProductImage = {
  imageId: string;
  originalRef: string;
  src: string;
  zoomSrc: string;
  width: number;
  height: number;
  mime: string;
};

/**
 * Validate → private original → re-encoded public derivative.
 * Originals never go in the public bucket.
 */
export async function uploadProductImage(input: {
  productId: string;
  bytes: Uint8Array;
  alt: string;
  role?: "catalogue_primary" | "catalogue_secondary";
}): Promise<UploadedProductImage> {
  const client = getSupabaseServiceClient();
  if (!client) {
    throw new Error("Supabase service role is required for image upload.");
  }

  const kind = assertValidImageUpload(input.bytes);
  const imageId = randomUUID();
  const originalPath = `${input.productId}/${imageId}.original.${kind}`;
  const derivativePath = `${input.productId}/${imageId}.catalogue.jpg`;

  const originalBuffer = Buffer.from(input.bytes);
  const { error: originalError } = await client.storage
    .from("product-originals")
    .upload(originalPath, originalBuffer, {
      contentType: mimeForKind(kind),
      upsert: false,
    });
  if (originalError) {
    throw new Error(`Original upload failed: ${originalError.message}`);
  }

  const derived = await sharp(originalBuffer)
    .rotate()
    .resize({
      width: MAX_DERIVATIVE_EDGE,
      height: MAX_DERIVATIVE_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  const { error: derivedError } = await client.storage
    .from("product-catalogue")
    .upload(derivativePath, derived.data, {
      contentType: "image/jpeg",
      upsert: false,
      cacheControl: "31536000",
    });
  if (derivedError) {
    throw new Error(`Derivative upload failed: ${derivedError.message}`);
  }

  const { data: publicUrl } = client.storage
    .from("product-catalogue")
    .getPublicUrl(derivativePath);

  const role = input.role ?? "catalogue_primary";
  const { error: rowError } = await client.from("product_images").insert({
    id: imageId,
    product_id: input.productId,
    role,
    src: publicUrl.publicUrl,
    zoom_src: publicUrl.publicUrl,
    alt: input.alt.trim() || "Product image",
    width: derived.info.width,
    height: derived.info.height,
    sort_order: 0,
    processing_status: "approved_for_catalogue",
    original_ref: originalPath,
  });
  if (rowError) {
    throw new Error(`Image metadata insert failed: ${rowError.message}`);
  }

  return {
    imageId,
    originalRef: originalPath,
    src: publicUrl.publicUrl,
    zoomSrc: publicUrl.publicUrl,
    width: derived.info.width,
    height: derived.info.height,
    mime: "image/jpeg",
  };
}
