# Motion and design system

## Brand identity

Legal name: **THE IP SHAP BUSINESS LTD**  
Short brand: **IP SHAP** (subject to owner approval)

Authoritative palette (`prompts/BRAND_IDENTITY.md`):

| Token                  | Hex       | Usage                                         |
| ---------------------- | --------- | --------------------------------------------- |
| `--brand-charcoal`     | `#20201E` | Primary text, header/footer, grounding        |
| `--brand-warm-white`   | `#F5F1E8` | Main canvas                                   |
| `--brand-burnt-orange` | `#F07836` | Selective accent (CTA, focus, price emphasis) |
| `--brand-dark-neutral` | `#343430` | Secondary dark surfaces / muted text          |

### Explicit exclusions

Do **not** use green, emerald, lime, burgundy/wine, or gold as core brand colours.

Tokens are centralized in `src/app/globals.css` and exposed to Tailwind as `brand-*` colours.

## Typography (Phase 00 baseline)

| Role            | Family   | Notes                 |
| --------------- | -------- | --------------------- |
| Display / brand | Fraunces | Editorial headings    |
| Body / UI       | DM Sans  | Legible storefront UI |

Phase 01 may refine the type scale with fluid `clamp()` sizes while keeping these roles.

## Motion (Phase 00)

- No advanced choreography yet
- Global `prefers-reduced-motion` CSS kill-switch is enabled
- Prototype interactions in Phase 01 should stay within ~150–220ms transitions

## Accessibility

- Skip link to `#main-content`
- Visible `:focus-visible` ring using burnt orange
- Do not rely on colour alone for state
- Maintain contrast between charcoal text and warm white canvas

## Visual references (inspiration only)

- https://www.ciaokombucha.com/
- https://lefrenchystudio.com/

Do not copy layouts, assets or proprietary details.
