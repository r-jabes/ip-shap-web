# Changelog

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
