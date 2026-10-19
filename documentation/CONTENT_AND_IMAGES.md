# Content and images

## Source and destinations

| Location                              | Role                                                              |
| ------------------------------------- | ----------------------------------------------------------------- |
| `../resources/`                       | Client originals (do not delete; not served publicly from parent) |
| `public/branding/`                    | Copied logo + app icon for the storefront                         |
| `public/products/`                    | Copied product photographs for catalogue use                      |
| `src/app/icon.png` / `apple-icon.png` | Next.js favicon / Apple touch icon (from `app_icon.png`)          |
| `src/fixtures/demo/catalogue.ts`      | Provisional product fixtures (demo mode only)                     |

Originals remain in `../resources/`. Frontend copies only what the storefront needs.

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

Formats preserved (PNG / JPEG). No WebP conversion in this phase.

Legacy SVG placeholders under `public/products/placeholders/` remain for fallback testing but are no longer referenced by the live provisional catalogue.

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

## Catalogue presentation

- Product frames remain **4:5** with `object-cover object-center` for shop photography consistency.
- Shared multi-product photos are flagged in data (`isSharedMultiProductPhoto`) and called out on product detail.
- Alt text describes visible content — never the price filename.
- Gallery/zoom behaviour from Phase 01 retained; single-image products stay single-image (no duplicated fake slides).

## Future photo workflow

1. Capture/retake individual SKU photos (square-on, label legible, consistent light).
2. Keep originals outside public if private; export web derivatives to `public/products/` or Storage.
3. Prefer 4:5 WebP/AVIF derivatives with documented conversion; keep a source copy.
4. Replace shared multi-product `src` per SKU; clear `isSharedMultiProductPhoto`.
5. Confirm prices and names with Rosine; remove “unverified” / provisional badges.
6. Manual review: crop, background, label legibility, no upscaling, no label recolouring.

## Manual review checklist

- [ ] Every SKU has its own primary photo (no shared multi-bottle where avoidable)
- [ ] Label legible at catalogue thumbnail size
- [ ] Price confirmed (not filename-inferred)
- [ ] Name/brand confirmed (not only OCR/guess from packaging)
- [ ] Johnnie Walker L→R price mapping confirmed
- [ ] ROZZITA / LIBOLL / Pinta Negra price splits confirmed
- [ ] Logo contrast OK on header/footer
- [ ] Favicon correct in production build
