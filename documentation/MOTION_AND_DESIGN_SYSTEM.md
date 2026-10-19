# Motion and design system

## Brand identity

Legal name: **THE IP SHAP BUSINESS LTD**  
Short brand: **IP SHAP** (subject to owner approval)

Authoritative palette (`prompts/BRAND_IDENTITY.md`):

| Token                  | Hex       | Usage                                                 |
| ---------------------- | --------- | ----------------------------------------------------- |
| `--brand-charcoal`     | `#20201E` | Primary text, header/footer, hero grounding           |
| `--brand-warm-white`   | `#F5F1E8` | Main canvas                                           |
| `--brand-burnt-orange` | `#F07836` | Selective accent (CTA, focus, badges, price emphasis) |
| `--brand-dark-neutral` | `#343430` | Secondary surfaces / muted text                       |

### Explicit exclusions

Do **not** use green, emerald, lime, burgundy/wine, or gold as core brand colours.

Tokens live in `src/app/globals.css` and map to Tailwind `brand-*` utilities.

## Typography

| Role            | Family   | Implementation                    |
| --------------- | -------- | --------------------------------- |
| Display / brand | Archivo (variable, `wdth` axis) | `--font-display`, `.font-display` (800, stretch 108%), `.font-display-hero` (900, stretch 118%, uppercase) |
| Body / UI       | DM Sans                         | `--font-body` / `font-sans`                                                                                 |

Fluid scale (CSS variables in `globals.css`): `--type-hero`, `--type-display`, `--type-h2`, `--type-h3`, `--type-body`. Use `.tabular` for prices and counts.

Tailwind v4 notes: preflight no longer sets pointer cursors, so `@layer base` restores them. Custom classes such as `.font-display` live in `@layer components` so utilities can still override them. `.on-ink` only flips `--focus-ring` (charcoal on light, orange on dark); it does not set colours.

## Component kit (`src/components/ui/`)

`Button` (primary/secondary/ghost/on-dark/link, sm/md/lg, loading, icons), `IconButton` (label required), `Badge`, `Chip`, `Field/Input/Select/Checkbox`, `QuantityStepper`, `Skeleton`, `PriceTag`, `ArchFrame`, `SectionHeading`, `Marquee`, `Overlay` (portal, focus trap, Escape, ref-counted scroll lock, focus restore; drawer/sheet/dialog sides), `icons`.

`/dev/design` renders every piece on both surfaces for review. It is `noindex` and returns 404 in production builds.

Not built yet: Tooltip, Switch, Radio, Toast.

## Storefront shell

Announcement bar, ivory sticky header with mega menu (built from catalogue groups and counts), search overlay with instant suggestions (`/` or Ctrl/Cmd+K), mobile menu sheet and bottom bar, charcoal footer, cart drawer. Contact details come from `src/lib/site-config.ts` (`NEXT_PUBLIC_*`) and are rendered only when configured. `PreviewIndicator` is the only place demo data is admitted, and only in development.

Cart: one derived list (`items`) feeds the badge, drawer, cart page and checkout. Storage key is versioned (`ip-shap-cart-v2`), parsed with zod, quantities clamped to 1–99, unresolvable lines pruned with a notice, and tabs stay in sync.

## Layout principles

- Full-bleed charcoal hero with warm-white type and one primary CTA
- Editorial collection rows (border-led, not card grids in marketing sections)
- Catalogue uses a consistent **4:5** product frame on warm-neutral `#E8E2D6` via `ProductImageFrame`
- Orange is a fill on ivory (CTAs, badges) and text only on charcoal; never orange text on ivory
- Product photography system: roles, processing status and zoom-on-demand (see `CONTENT_AND_IMAGES.md`)

## Motion stack (Phase 03 + R7)

**Choice:** CSS custom properties + keyframes + small client helpers (`Reveal`, `PageEnter`).  
**Not used:** GSAP / ScrollTrigger. **View Transitions API** deferred until a Next.js upgrade that supports stable App Router VT — fallback is `PageEnter`.

JS mirror of tokens: `src/lib/motion.ts` (`MOTION`, `prefersReducedMotion`).

### Timing tokens

| Token                | Value                            | Use                                          |
| -------------------- | -------------------------------- | -------------------------------------------- |
| `--motion-fast`      | 140ms                            | Micro opacity / link feedback                |
| `--motion-ui`        | 220ms                            | Drawers, gallery fade, cart pulse, page enter |
| `--motion-editorial` | 520ms                            | Section reveals, cart fly-dot                |
| `--motion-hero`      | 700ms                            | Hero media settle (stagger ends ~760ms)      |
| `--ease-out`         | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances                                    |
| `--ease-ui`          | `cubic-bezier(0.33, 1, 0.68, 1)` | Panels / UI                                  |
| `--ease-soft`        | `cubic-bezier(0.4, 0, 0.2, 1)`   | Crossfades / content settle                  |
| `--ease-settle`      | `cubic-bezier(0.16, 1, 0.3, 1)`  | Cart fly-in                                  |

No spring overshoot on product UI.

### Patterns

| Pattern            | Implementation                                                                 | Reduced motion                         |
| ------------------ | ------------------------------------------------------------------------------ | -------------------------------------- |
| Hero entrance      | `.hero-media` + `.hero-stagger` children (~40–420ms delays)                    | Instant static layout; CTA always live |
| Editorial reveals  | `Reveal` — home + About/Delivery story cards + FAQ; not on product grids       | Content visible immediately            |
| Product card       | `scale` / lift on `group-hover` **and** `group-focus-within`                   | Scale disabled                         |
| Gallery change     | `.gallery-crossfade`; swipe remains pointer-threshold                          | Instant swap                           |
| Lightbox / drawers | Overlay enter classes                                                          | Instant show                           |
| Cart feedback      | Fly-dot + bag catch + count pulse + `aria-live` + visible toast + drawer text  | Motion off; text remains               |
| Shop settle        | `.content-settle` on product grid mount                                        | Instant                                |
| Route settle       | `PageEnter` keyed to pathname (VT deferred)                                    | Instant                                |
| Marquee            | `.marquee-track` CSS transform                                                 | Static wrapped list                    |

### Principles applied

- Hierarchy: motion highlights one moment (hero → editorial → UI), not every card.
- Physicality: restrained image scale only; no fake bottle drops.
- Continuity: drawer/lightbox and cart toast explain state changes.
- Performance: transform/opacity only; no scroll hijack / pinned sequences / grid scroll-linking.
- Budgets: aim LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 (field targets — not claimed from lab alone).

## Accessibility

- Skip link to `#main-content`
- Visible `:focus-visible` ring (charcoal on paper, orange on ink via `.on-ink`)
- Cart and lightbox dialogs restore focus; body scroll locked while open
- Gallery: visible prev/next, keyboard arrows in lightbox, `aria-live` slide status
- Zoom is a dedicated control (never hover-only discovery)
- Cart confirmation is textual (+ optional motion), not colour/animation alone
- No content waits on animation completion before becoming available

Operator checklist: [QUALITY_GATES.md](./QUALITY_GATES.md).

## Visual references (inspiration only)

- https://www.ciaokombucha.com/
- https://lefrenchystudio.com/

Do not copy layouts, assets or proprietary details.

## Performance comparison notes

| Check                         | Before (Phase 02) | After (Phase 03 / R7)                          |
| ----------------------------- | ----------------- | ---------------------------------------------- |
| Extra animation libraries     | none              | none (CSS + tiny Reveal / PageEnter)           |
| Homepage JS for motion        | hero CSS only     | + `Reveal` islands on editorial                |
| Shop / product / cart bundles | unchanged intent  | no GSAP; gallery fade CSS-only; PageEnter tiny |
| CLS risk from reveals         | n/a               | transform/opacity only                         |

Re-measure LCP/INP/CLS in production after deploy; do not assert field CWV without data.
