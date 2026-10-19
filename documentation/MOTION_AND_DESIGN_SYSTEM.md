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

## Typography (Phase 01)

| Role            | Family   | Implementation                    |
| --------------- | -------- | --------------------------------- |
| Display / brand | Fraunces | `--font-display`, `.font-display` |
| Body / UI       | DM Sans  | `--font-body` / `font-sans`       |

Fluid scale (CSS variables):

- `--type-display`: `clamp(2.5rem, 5vw + 1rem, 4.5rem)` — hero
- `--type-h2`: `clamp(1.75rem, 2vw + 1rem, 2.5rem)` — section titles
- `--type-body`: `clamp(1rem, 0.2vw + 0.95rem, 1.125rem)` — body

## Layout principles (Phase 01–02)

- Full-bleed charcoal hero with warm-white type and one primary CTA
- Editorial collection rows (border-led, not card grids in marketing sections)
- Catalogue uses a consistent **4:5** product frame on warm-neutral `#E8E2D6` via `ProductImageFrame`
- Orange used sparingly for CTAs, focus rings and demo badges
- Product photography system: roles, processing status and zoom-on-demand (see `CONTENT_AND_IMAGES.md`)

## Motion (Phase 01–02 — restrained)

| Interaction                 | Behaviour                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------- |
| Buttons / links             | ~200ms colour/opacity transitions                                                   |
| Product card image          | Subtle `scale(1.03)` on hover; disabled under reduced motion                        |
| Hero copy                   | Short `hero-enter` fade/translate (~220ms)                                          |
| Cart drawer / filter drawer | Instant mount with short transform easing; Escape closes                            |
| Gallery swipe               | Pointer delta threshold (~40px); no momentum physics                                |
| Lightbox                    | Focus move to close; Tab trap; Escape restores focus; body scroll locked while open |

No scroll hijacking, pinned storytelling or intro gates.

`prefers-reduced-motion` disables non-essential animation globally.

## Accessibility

- Skip link to `#main-content`
- Visible `:focus-visible` ring (burnt orange)
- Cart and lightbox dialogs restore focus
- Gallery: visible prev/next, thumbnails, keyboard arrows in lightbox, `aria-live` slide status
- Zoom is a dedicated control (never hover-only discovery)
- Demo labels are textual, not colour-only

## Visual references (inspiration only)

- https://www.ciaokombucha.com/
- https://lefrenchystudio.com/

Do not copy layouts, assets or proprietary details.

## Visual QA checklist

- [ ] Mobile 360–430px: header, hero, shop filters drawer, product gallery, cart drawer
- [ ] Tablet ~768px: two-column product detail
- [ ] Desktop / wide: shop sidebar + 4-column grid
- [ ] Keyboard: tab through nav, filters, gallery, zoom, cart
- [ ] Reduced motion enabled: no distracting motion
