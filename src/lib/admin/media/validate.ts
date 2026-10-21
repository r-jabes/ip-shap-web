/** Upload limits and magic-byte checks for product imagery (P3). */

export const MAX_ORIGINAL_BYTES = 10 * 1024 * 1024; // 10 MiB
export const MAX_DERIVATIVE_EDGE = 1600;

export type DetectedImageKind = "jpeg" | "png" | "webp";

const KIND_MIME: Record<DetectedImageKind, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export function detectImageKind(bytes: Uint8Array): DetectedImageKind | null {
  if (bytes.length < 12) return null;
  // JPEG
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }
  // PNG
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }
  // WEBP: RIFF....WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

export function mimeForKind(kind: DetectedImageKind): string {
  return KIND_MIME[kind];
}

export function assertValidImageUpload(bytes: Uint8Array): DetectedImageKind {
  if (bytes.byteLength === 0) {
    throw new Error("Empty upload.");
  }
  if (bytes.byteLength > MAX_ORIGINAL_BYTES) {
    throw new Error("Image exceeds 10 MiB limit.");
  }
  const kind = detectImageKind(bytes);
  if (!kind) {
    throw new Error("Only JPEG, PNG, or WebP images are allowed.");
  }
  return kind;
}
