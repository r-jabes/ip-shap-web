# Changelog

## Unreleased — UI redesign R0–R8 + handover P0

- Handover **P0**: env matrix (staging vs prod), `PLATFORM_BOOTSTRAP.md`, `THREAT_MODEL.md`, CI critical dependency audit, expanded `.env.example`
- Admin restyle (R8): `/admin` shell, login, dashboard, products, stock, orders and import use storefront tokens, sticker buttons, Field kit and panel frames — look only, no new behaviour
- Motion / quality (R7): cart fly-in + visible toast; `PageEnter` route settle (View Transitions deferred); shop `.content-settle`; story/FAQ reveals; `QUALITY_GATES.md`; motion + performance docs updated
- Shop polish: sticky filter panel (opacity-only page enter so sticky works); facet-driven range/brand checklists with brand search; quick-view image fills modal height
- Content pages (R6): About story cards; Contact WhatsApp card + enquiry hand-off + Maps link; Delivery/FAQ/Privacy/Terms in the new system; FAQ accordion; 404 and error restyled; shared Accordion
- Cart / checkout / confirmation (R5): shared Cart → Details → Confirmed steps; restyled cart lines and sticky summary; checkout uses Field kit with channel cards and field-level errors; confirmation status timeline + Message us panel; order lookup restyled to match

- Shop (R3): product cards with 4:5 frame, hover shift, stock pill, quick add + quick view; sticky filter sidebar and mobile sheet with “Show N results”; multi-select range/brand chips with facet counts; price bounds; applied-filter chips; URL state; sort, pagination, skeletons and empty state
- Product (R4): arch gallery with desktop magnifier and full-screen zoom (wheel/pinch/drag/double-tap + keyboard); buy box with WhatsApp CTA and brand sibling chips; details accordion; related products that skip shared photos; mobile sticky add-to-cart bar
- Shop/product polish: viewport-capped image carousel; card Add/View fixed (no Ask-us pill); sample sale UI + stronger orange prices; details no longer slide under CTAs
- Product gallery: arch matched to photo aspect (cover fills); sticky media scaled to fit laptop viewport height; buy box fills the row (no empty right column); carousel loops (next/prev + autoplay wrap); autoplay every 5s (pauses on hover/zoom/reduced motion)

- Logo: reversed asset for dark surfaces, `BrandLogo` now requires `tone`; ivory header, charcoal footer/menu
- Tokens and type: Archivo + DM Sans, new radii/shadows/motion tokens, pointer cursors and focus rings restored under Tailwind v4
- Component kit in `components/ui` and `/dev/design` reference page (dev only)
- Header with mega menu, mobile menu, bottom bar, search overlay with suggestions, announcement bar, footer, cart drawer
- Cart integrity: badge, drawer, cart page and checkout read one derived list; versioned storage; stale lines pruned with a notice
- Customer-facing copy no longer mentions demo/provisional/unverified/prototype; `PreviewIndicator` (dev only) replaces it; a test guards this
- Catalogue grouped into Whisky, Vodka, Gin, Wine, Sparkling; contact details from `NEXT_PUBLIC_*` via `site-config`
- Home redesign: arch hero (whisky photo), range ticker, collections bento, featured carousel (admin-ready data shape), how-it-works, WhatsApp band, trust/FAQ; photos allocated via `range-media`
- Favicon: replace default Next/Vercel `favicon.ico` with the IP SHAP mark; add App Router `icon.png`
- Product stage frames: dashed orange nearer echo + solid charcoal deeper offset, gaps tightened so bottles dominate
- Hero: image fills its column flush to the container edge; arch height follows the viewport height so the first screen stays in view; no decorative rails/rules (they collided with content at some widths)
- Brand atmosphere: soft masked wash that blends under the header; product stage = photo overlapping one offset frame + sticker; hero scroll cue is a mouse icon
- Range ticker under the hero: charcoal band, scrolling linked ranges with bottle counts and a "Shop all" sticker; static list under reduced motion
- Featured: 4 slides (photos may repeat until the admin replaces them); counter sits outside any border; autoplay every 5 s with a progress bar, pause/play button, keyboard-focus pause, off under reduced motion; hover/click no longer freeze it

## 0.9.0 — Phase 08 hardening (2026-10-19)

- Security headers/CSP, middleware request id, open-redirect helper
- Shop pagination; sitemap omits transactional routes; SVG optimizer off
- A11y: cart focus trap, filter Escape, checkout alert contrast
- Money/rate-limit/logger/reservation tests; performance + release docs

## 0.8.0 — Phase 07 payments, admin orders, notifications (2026-10-19)

- Sandbox payment helpers + HMAC webhook route (`/api/payments/webhook`)
- Admin orders list/detail: fulfilment transitions and verified manual payment
- Log-only notifications on create / payment / fulfilment; order status UX copy
- Env: `PAYMENT_PROVIDER`, `PAYMENT_WEBHOOK_SECRET`

## 0.7.0 — Phase 06 checkout and orders (2026-10-19)

- Guest checkout with server-side price recompute, idempotency and order snapshots
- WhatsApp-assisted channel; online payment gated until provider enabled
- Confirmation + private token lookup; delivery fee unavailable when zones unset
- Document checkout flow (`CHECKOUT.md`)

## 0.6.0 — Phase 05 admin product management (2026-10-19)

- Split storefront into `(storefront)` route group; add `/admin` operational UI
- Bootstrap admin login (HMAC session, rate limit, generic errors) + role-gated server actions
- Product create/edit/archive, stock adjustments with audit, CSV dry-run import
- Document admin secrets, permissions and noindex for `/admin`

## 0.5.0 — Phase 03 purposeful motion (2026-10-19)

- Add motion tokens (fast / UI / editorial / hero) and CSS choreography
- Staggered hero entrance; IntersectionObserver editorial reveals (not on grids)
- Gallery crossfade, drawer/lightbox enter motion, cart count pulse + text feedback
- Match product-card hover/focus image scale; document reduced-motion + perf rationale

## 0.4.0 — Phase 02 product image system (2026-10-19)

- Add image roles, processing status and metadata helpers (`product-image`)
- Add `ProductImageFrame` with reserved 4:5 aspect and missing/error fallback
- Harden product gallery: swipe, focus trap, keyboard arrows, zoom-on-demand
- Enrich provisional fixtures with `zoomSrc`, `originalRef`, crop/rights notes
- Enable Next.js AVIF/WebP image formats; expand content/image documentation

## 0.3.0 — Client assets + provisional catalogue (2026-10-19)

- Copy client logo, app icon and product photographs into `public/`
- Wire logo into header/footer; configure favicon / Apple icon
- Replace placeholder SVG catalogue with 13 provisional SKUs from client photos
- Document filename→price mapping, multi-bottle ambiguity and confirmation needs
- Use real product photography on the homepage hero

## 0.2.0 — Phase 01 storefront prototype (2026-10-19)

- Build client-facing storefront: home, shop, product detail, cart, content pages
- Add typed demo catalogue fixtures gated by `NEXT_PUBLIC_DEMO_MODE`
- Add accessible product gallery (thumbnails, prev/next, zoom lightbox)
- Add cart drawer/page with empty and populated demo states
- Add shop filters (category, brand, availability, sort, search) + mobile drawer
- Add temporary SVG product placeholders and demo badges
- Add robots (disallow all) + sitemap scaffolding; Open Graph defaults
- Expand design-system and content/image documentation

## 0.1.0 — Phase 00 foundation (2026-10-19)

- Scaffold Next.js 15 App Router + TypeScript + Tailwind CSS v4
- Centralize approved brand colour tokens
- Add money helpers (integer RWF), env validation, structured logger
- Add domain product types (no seeded catalogue)
- Add Vitest, Prettier, GitHub Actions CI
- Add foundation documentation set
- Minimal accessible shell (header/footer/skip link)
