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

## Motion stack (Phase 03)

**Choice:** CSS custom properties + keyframes + one small `Reveal` client helper (IntersectionObserver).  
**Not used:** GSAP / ScrollTrigger — hero and editorial moments do not justify a second runtime. No route-transition library (Next.js App Router + a11y risk).

JS mirror of tokens: `src/lib/motion.ts`.

### Timing tokens

| Token                | Value                            | Use                                     |
| -------------------- | -------------------------------- | --------------------------------------- |
| `--motion-fast`      | 140ms                            | Micro opacity / link feedback           |
| `--motion-ui`        | 220ms                            | Drawers, gallery fade, cart pulse       |
| `--motion-editorial` | 520ms                            | Section reveals                         |
| `--motion-hero`      | 700ms                            | Hero media settle (stagger ends ~760ms) |
| `--ease-out`         | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances                               |
| `--ease-ui`          | `cubic-bezier(0.33, 1, 0.68, 1)` | Panels / UI                             |
| `--ease-soft`        | `cubic-bezier(0.4, 0, 0.2, 1)`   | Crossfades                              |

No spring overshoot on product UI.

### Patterns

| Pattern            | Implementation                                                            | Reduced motion                         |
| ------------------ | ------------------------------------------------------------------------- | -------------------------------------- |
| Hero entrance      | `.hero-media` scale/opacity + `.hero-stagger` children (~40–420ms delays) | Instant static layout; CTA always live |
| Editorial reveals  | `Reveal` — one-time IO; transform/opacity only; not on product grids      | Content visible immediately            |
| Product card       | `scale(1.03)` on `group-hover` **and** `group-focus-within`               | Scale disabled                         |
| Gallery change     | `.gallery-crossfade` on image key change; swipe remains pointer-threshold | Instant swap                           |
| Lightbox / drawers | `.lightbox-enter`, `.drawer-backdrop`, `.drawer-panel` / `-left`          | Instant show                           |
| Cart feedback      | Count pulse + textual `feedback` (`aria-live` + visible status in drawer) | Pulse off; text remains                |
| Route transitions  | None (intentional)                                                        | n/a                                    |

### Principles applied

- Hierarchy: motion highlights one moment (hero → editorial → UI), not every card.
- Physicality: restrained image scale only; no fake bottle drops (hero uses a full-bleed shop photo, not isolated cut-outs).
- Continuity: drawer/lightbox opacity+translate explain open state.
- Performance: transform/opacity only; motion CSS is global and tiny; `Reveal` is homepage-scoped; no scroll hijack / pinned sequences / grid scroll-linking.
- Budgets: aim LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 (field targets — not claimed from lab alone). Prefer mid-range mobile / CPU throttle when profiling.

## Accessibility

- Skip link to `#main-content`
- Visible `:focus-visible` ring (burnt orange)
- Cart and lightbox dialogs restore focus; body scroll locked while open
- Gallery: visible prev/next, thumbnails, keyboard arrows in lightbox, `aria-live` slide status
- Zoom is a dedicated control (never hover-only discovery)
- Cart confirmation is textual, not colour/animation alone
- Demo labels are textual, not colour-only
- No content waits on animation completion before becoming available

## Visual references (inspiration only)

- https://www.ciaokombucha.com/
- https://lefrenchystudio.com/

Do not copy layouts, assets or proprietary details.

## Visual QA checklist

- [ ] Mobile 360–430px: header, hero stagger, shop filters drawer, product gallery, cart drawer
- [ ] Tablet ~768px: two-column product detail
- [ ] Desktop / wide: shop sidebar + 4-column grid
- [ ] Keyboard: tab through nav, filters, gallery, zoom, cart; card focus scales image like hover
- [ ] Reduced motion enabled: hero/reveals/drawers static; CTAs immediately usable
- [ ] Product grid does not scroll-animate
- [ ] Add-to-cart announces text feedback (screen reader + drawer status)

## Performance comparison notes

| Check                         | Before (Phase 02) | After (Phase 03)                        |
| ----------------------------- | ----------------- | --------------------------------------- |
| Extra animation libraries     | none              | none (CSS + tiny Reveal)                |
| Homepage JS for motion        | hero CSS only     | + `Reveal` client islands on editorial  |
| Shop / product / cart bundles | unchanged intent  | no GSAP; gallery fade is CSS-only       |
| CLS risk from reveals         | n/a               | reserved layout; transform/opacity only |

Re-measure LCP/INP/CLS in production after deploy; do not assert field CWV without data.
