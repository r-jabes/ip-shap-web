# Changelog

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
