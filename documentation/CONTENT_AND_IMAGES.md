# Content and images

## Source and destinations

| Location                              | Role                                                              |
| ------------------------------------- | ----------------------------------------------------------------- |
| `../resources/`                       | Client originals (do not delete; not served publicly from parent) |
| `public/branding/`                    | Copied logo + app icon for the storefront                         |
| `public/products/`                    | Copied product photographs for catalogue use                      |
| `src/app/icon.png` / `apple-icon.png` | Next.js favicon / Apple touch icon (from `app_icon.png`)          |
| `src/fixtures/demo/catalogue.ts`      | Provisional product fixtures (demo mode only)                     |

Originals remain in `../resources/`. Frontend copies only what the storefront needs. Product identity is always the stable product UUID/slug — never a filename.

## Image roles

| Role                  | Use                                         | Typical `sizes`                 |
| --------------------- | ------------------------------------------- | ------------------------------- |
| `catalogue_primary`   | Shop grid / card                            | `25vw`–`50vw` breakpoints       |
| `catalogue_secondary` | Product detail main frame                   | `100vw` mobile / `50vw` desktop |
| `thumbnail`           | Gallery rail, cart line                     | fixed ~64–96px                  |
| `zoom`                | Lightbox only (`zoomSrc`, mounts when open) | `100vw`                         |
| `editorial`           | Marketing / shop-atmosphere sections        | large viewport fractions        |

Helpers live in `src/lib/product-image.ts`. UI frames use `ProductImageFrame` (`src/components/media/ProductImageFrame.tsx`).

## Metadata (required fields)

Each `ProductImage` carries:

- `id`, `role`, `src`, optional `zoomSrc`
- `alt`, intrinsic `width` / `height`, `sortOrder`
- `processingStatus`: `source_received` → `needs_review` → `approved_for_catalogue` (or `rejected` / `archived`)
- Optional operator fields: `sourceFilename`, `originalRef`, `cropInstructions`, `rightsNote`, `isSharedMultiProductPhoto`, `needsClientConfirmation`

**Rules**

- Rejected / archived images are never displayable.
- Unreviewed AI-edited images must not auto-publish; demo may show `needs_review` with provisional labels.
- `originalRef` points at private/original storage; do not expose originals publicly by default.
- Filenames are operator references only.

## Original vs derivative

| Asset           | Storage intent                                      | Public?                       |
| --------------- | --------------------------------------------------- | ----------------------------- |
| Original        | `resources/` or private Supabase bucket (later)     | No                            |
| Derivative      | `public/products/` or public CDN/Storage derivative | Yes                           |
| Zoom derivative | Separate higher-res file when available             | Yes, only when lightbox opens |

Never overwrite originals when exporting. Re-encode uploads server-side before public serve (see backend `contracts/product-image-upload.ts`).

## Canvas and processing standards

- Aspect: **4:5** catalogue frame (`CATALOGUE_ASPECT_RATIO`)
- Surface: warm neutral `#E8E2D6` behind `object-contain` / careful `object-cover`
- Prefer consistent padding, scale and white-balance across SKUs
- Avoid aggressive cut-out around glass, foil, dark glass, thin necks
- **Accuracy:** do not alter labels, logos, capacity marks, liquid colour, or bottle geometry. If cleanup is unsafe, keep a tidy real background and consistent crop/light only.

## Operator batch workflow (300+ SKUs)

1. Ingest originals into private storage / `resources/` with stable product ID association.
2. Batch crop/export via an external editor (recommended: Adobe Lightroom / Capture One / digiKam + ImageMagick script) to 4:5 WebP/AVIF + JPEG fallback.
3. Write derivatives beside metadata (`role`, alt, crop notes, rights).
4. Set `processingStatus` to `needs_review`.
5. Human QA against the checklist below.
6. On approval: `approved_for_catalogue` and publish derivatives only.
7. Replace shared multi-bottle photos with per-SKU shots when available; clear `isSharedMultiProductPhoto`.

Recommended local export sketch (do not run blindly; tune paths):

```bash
# Example: resize longest side, keep aspect, export JPEG derivative
magick input.jpg -auto-orient -resize 1600x2000^ -gravity center -extent 1600x2000 -quality 82 output.jpg
```

No paid SaaS or custom processing API is approved yet.

## Asset inventory and mapping

| Source (`resources/`) | Frontend path                                                           | Role                            | Dimensions |
| --------------------- | ----------------------------------------------------------------------- | ------------------------------- | ---------- |
| `main_logo.png`       | `public/branding/main-logo.png`                                         | Logo (header/footer)            | 882×256    |
| `app_icon.png`        | `public/branding/app-icon.png` (+ `src/app/icon.png`, `apple-icon.png`) | Favicon / app icon              | 158×155    |
| `12k.jpeg`            | `public/products/drink-12000.jpeg`                                      | Multi-product photo (4 bottles) | 810×1080   |
| `13k.jpeg`            | `public/products/drink-13000.jpeg`                                      | Multi-product photo (2 bottles) | 810×1080   |
| `17k.jpeg`            | `public/products/drink-17000.jpeg`                                      | Single-product photo            | 810×1080   |
| `20k.jpeg`            | `public/products/drink-20000.jpeg`                                      | Multi-product photo (2 bottles) | 810×1080   |
| `60k.jpeg`            | `public/products/drink-60000.jpeg`                                      | Single-product photo (+ box)    | 810×1080   |
| `28k-68k-78k.jpeg`    | `public/products/drink-28000-68000-78000.jpeg`                          | Multi-product photo (3 bottles) | 810×1080   |

Formats preserved for current demo copies (JPEG/PNG). Next.js image optimizer may serve AVIF/WebP to supporting browsers.

Legacy SVG placeholders under `public/products/placeholders/` remain for fallback testing but are not referenced by the live provisional catalogue.

## Filename → provisional price

| Source filename    | Provisional RWF          | Notes                                                                                              |
| ------------------ | ------------------------ | -------------------------------------------------------------------------------------------------- |
| `12k.jpeg`         | 12,000                   | Applied to **four** ROZZITA entries sharing one photo — which bottle owns the price is unconfirmed |
| `13k.jpeg`         | 13,000                   | Applied to **two** Pinta Negra entries — per-bottle assignment unconfirmed                         |
| `17k.jpeg`         | 17,000                   | Single product                                                                                     |
| `20k.jpeg`         | 20,000                   | Applied to **two** LIBOLL entries — per-bottle assignment unconfirmed                              |
| `60k.jpeg`         | 60,000                   | Single product                                                                                     |
| `28k-68k-78k.jpeg` | 28,000 / 68,000 / 78,000 | Three Johnnie Walker entries; L→R assumed Red / Black / Double Black — **mapping unconfirmed**     |

All prices are **provisional catalogue values** and must be confirmed with Rosine before production launch.

## Provisional product entries (13)

| ID suffix | Display name                                | Price RWF | Image                | Uncertainty            |
| --------- | ------------------------------------------- | --------- | -------------------- | ---------------------- |
| …001      | ROZZITA Chocolate (unverified)              | 12,000    | shared `12k`         | price split + identity |
| …002      | ROZZITA Raspberry (unverified)              | 12,000    | shared `12k`         | price split + identity |
| …003      | ROZZITA Original (unverified)               | 12,000    | shared `12k`         | price split + identity |
| …004      | ROZZITA Green Apple (unverified)            | 12,000    | shared `12k`         | price split + identity |
| …005      | Pinta Negra Red 2024 (unverified)           | 13,000    | shared `13k`         | price split            |
| …006      | Pinta Negra White 2024 (unverified)         | 13,000    | shared `13k`         | price split            |
| …007      | Valdepablo Vino Para Consagrar (unverified) | 17,000    | single `17k`         | name/details           |
| …008      | LIBOLL Rosé Extra Dry (unverified)          | 20,000    | shared `20k`         | price split            |
| …009      | LIBOLL Extra Dry (unverified)               | 20,000    | shared `20k`         | price split            |
| …010      | Grands Domaines Gin Bio (unverified)        | 60,000    | single `60k`         | details                |
| …011      | Johnnie Walker Red Label (unverified)       | 28,000    | shared `28k-68k-78k` | bottle↔price map       |
| …012      | Johnnie Walker Black Label (unverified)     | 68,000    | shared `28k-68k-78k` | bottle↔price map       |
| …013      | Johnnie Walker Double Black (unverified)    | 78,000    | shared `28k-68k-78k` | bottle↔price map       |

Inferred names from packaging are marked **(unverified)**. Volume, ABV, origin, stock, discounts and reviews are not asserted as verified facts.

## Logo and favicon

- Logo integrated in header and footer via `BrandLogo` (`/branding/main-logo.png`), aspect ratio preserved on charcoal surfaces (logo includes black background).
- App icon wired through Next.js `src/app/icon.png`, `apple-icon.png`, and metadata `icons` pointing at `/branding/app-icon.png`.
- Source is PNG 158×155 — suitable as-is; no fake `.ico` rename. Next.js generates appropriate favicon responses.

## Frontend delivery

- `ProductImageFrame` reserves 4:5 space (CLS-safe) and falls back when src fails/missing.
- Grid/gallery/thumbnail/zoom use role-specific `sizes` and quality.
- Zoom asset (`zoomSrc`) loads only while the lightbox is open.
- Gallery: swipe, keyboard arrows, visible prev/next, thumbnail rail, `aria-live` status, Escape + focus trap/restoration.
- Zoom is a visible button — never hover-only.
- No blur placeholders unless generated from the real image later.
- Gallery code is client-only on product routes; unrelated routes do not import zoom libraries (none are used).

## Manual review checklist

- [ ] Every SKU has its own primary photo (no shared multi-bottle where avoidable)
- [ ] Label legible at catalogue thumbnail size
- [ ] No label/logo/geometry alteration; glass edges intact
- [ ] `processingStatus` is `approved_for_catalogue` before production publish
- [ ] Price confirmed (not filename-inferred)
- [ ] Name/brand confirmed (not only OCR/guess from packaging)
- [ ] Johnnie Walker L→R price mapping confirmed
- [ ] ROZZITA / LIBOLL / Pinta Negra price splits confirmed
- [ ] Alt text describes visible content — never the price filename
- [ ] Logo contrast OK on header/footer
- [ ] Favicon correct in production build
- [ ] Derivatives only in public buckets; originals private
