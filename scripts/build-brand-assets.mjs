/**
 * Builds derived brand assets from the client originals.
 *
 * Input : public/branding/main-logo.png  (transparent PNG, charcoal glyphs + orange accent)
 * Output: public/branding/main-logo-reversed.png (ivory glyphs + orange accent, for dark surfaces)
 *
 * The mapping is deterministic: every pixel keeps its alpha; its colour is a blend between
 * ivory and the brand orange, driven by how "orange" the source pixel is (red minus blue).
 * Charcoal -> ivory, orange -> orange, anti-aliased edges blend smoothly.
 *
 * Run: node scripts/build-brand-assets.mjs
 * If the owner supplies a vector (SVG) logo, replace both PNGs with it and delete this script.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "public/branding/main-logo.png");
const target = path.join(root, "public/branding/main-logo-reversed.png");

const IVORY = [0xf5, 0xf1, 0xe8];
const ORANGE = [0xf0, 0x78, 0x36];
const ORANGE_SPREAD = ORANGE[0] - ORANGE[2]; // red - blue of pure orange (186)

const input = await readFile(source);
const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const out = Buffer.from(data);
for (let i = 0; i < out.length; i += 4) {
  const alpha = data[i + 3];
  if (alpha === 0) continue;
  const spread = data[i] - data[i + 2];
  const t = Math.min(1, Math.max(0, spread / ORANGE_SPREAD));
  for (let c = 0; c < 3; c += 1) {
    out[i + c] = Math.round(IVORY[c] + (ORANGE[c] - IVORY[c]) * t);
  }
}

await sharp(out, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png({ compressionLevel: 9 })
  .toFile(target);

console.log(
  `Wrote ${path.relative(root, target)} (${info.width}x${info.height})`,
);
