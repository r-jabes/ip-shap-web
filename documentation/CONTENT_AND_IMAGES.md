# Content and images

## Brand assets (status)

Client-supplied originals currently live outside this repository:

`../resources/`

| Source file                                 | Role                                                            |
| ------------------------------------------- | --------------------------------------------------------------- |
| `main_logo.png`                             | Primary logo (882×256)                                          |
| `app_icon.png`                              | App / favicon candidate (158×155)                               |
| `12k.jpeg` … `60k.jpeg`, `28k-68k-78k.jpeg` | Product photographs (prices encoded in filenames — provisional) |

Phase 00 does **not** copy these into `public/` yet. Integration belongs to the assets/catalogue phase after the Phase 01 prototype shell exists.

## Planned public layout

```text
public/
  branding/
    main-logo.png
    app-icon.png
  products/
    drink-*.jpeg
```

## Rules

1. Preserve originals in `resources/`; copy derivatives into the frontend.
2. Do not invent product facts (ABV, volume, origin, stock, reviews) as verified data.
3. Filenames that encode prices are provisional catalogue hints only.
4. Multi-bottle photos must be flagged when reused across SKUs.
5. Prefer Next.js `Image` with explicit dimensions / `sizes`.
6. Alt text describes visible product content — never the price filename.

## Image roles (for later metadata)

`catalogue_primary`, `catalogue_secondary`, `editorial`, `thumbnail`, `zoom`
