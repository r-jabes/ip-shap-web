# Content and images

## Phase 01 status

The storefront prototype uses **temporary SVG bottle placeholders** under:

`public/products/placeholders/`

| File                  | Role                               |
| --------------------- | ---------------------------------- |
| `bottle-warm.svg`     | Catalogue primary (warm canvas)    |
| `bottle-charcoal.svg` | Catalogue / hero (dark canvas)     |
| `bottle-neutral.svg`  | Catalogue primary (neutral canvas) |
| `*-alt.svg`           | Secondary gallery frames           |

These are clearly labelled “DEMO / placeholder” in the artwork and via UI `DemoBadge`s. They are **not** client product photography.

## Client originals (not yet integrated)

Still located outside this repo at `../resources/`:

- `main_logo.png`, `app_icon.png`
- Product JPEGs priced by filename (`12k`, `13k`, `17k`, `20k`, `60k`, `28k-68k-78k`)

Integration of those assets belongs to the next assets/catalogue phase after visual direction review.

## Demo product fixtures

Typed fixtures: `src/fixtures/demo/catalogue.ts`  
Access adapter: `src/lib/catalogue.ts` (gated by `NEXT_PUBLIC_DEMO_MODE`)

Rules:

1. Never auto-seed demo fixtures into production databases
2. Names/prices/availability are illustrative
3. Stable UUIDs + slugs are independent of image filenames
4. UI marks demo prices and demo stock states conspicuously

## Image pipeline (for future real photos)

### Preferred source

- High-resolution photo of the actual product
- Label legible, camera square-on
- Neutral consistent light, clean surface

### Catalogue primary style

- Warm-neutral or white background (`#F5F1E8` / `#E8E2D6` family)
- Consistent 4:5 crop, bottle centred, comparable scale
- Preserve glass edges; avoid aggressive cut-outs that invent fake packaging

### Editorial style

- Genuine shop/lifestyle photos only in selected story slots
- Do not mix randomly into catalogue thumbnails

### Naming / metadata

- Stable product ID in data, not in filename identity
- Suggested derivative pattern: `{brand}-{product}-{view}-01.webp`
- Track roles: `catalogue_primary`, `catalogue_secondary`, `editorial`, `thumbnail`, `zoom`
- Alt text describes visible product content — never price filenames

### Manual review checklist

- [ ] Label legible
- [ ] No distorted geometry
- [ ] Background tidy without fake edges
- [ ] Rights/source noted
- [ ] Provisional prices confirmed before production

## Replacement steps

1. Copy client photos into `public/products/` (or Storage later)
2. Update fixture/API image `src`, dimensions and alt text
3. Remove SVG placeholders once every featured SKU has a real primary image
4. Set `NEXT_PUBLIC_DEMO_MODE=false` in production when real catalogue is live
