# SEO runbook — THE IP SHAP BUSINESS LTD

## Indexing policy

| Mode                         | Behaviour                                                |
| ---------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_DEMO_MODE=true` | Global `noindex`; `robots.txt` disallows `/` (prototype) |
| Demo off + published content | Index public pages; disallow `/cart` and `/api/`         |

Filtered shop URLs (`q`, brand, non-default sort/page, etc.) set `robots: noindex,follow` and keep canonical `/shop` to avoid duplicate indexation.

Cart is always `noindex`.

## Per-URL metadata

- **Shop / category filter:** unique title/description via `shopMetadata`; category name when `?category=` is present.
- **Product:** unique title, description, canonical, Open Graph/Twitter, product image when available (`lib/seo.ts`).
- **Canonical:** product → `/product/{currentSlug}`; shop → `/shop` even when filters are applied.

## Structured data

- `Product` JSON-LD with integer RWF `offers.price`, `priceCurrency: RWF`, brand, and schema.org availability.
- **Never** emit reviews, aggregate ratings, or invented prices/availability.
- `unknown` stock → `LimitedAvailability` (not `InStock`).
- Visible breadcrumbs + matching `BreadcrumbList` JSON-LD.

## Sitemap & robots

- Sitemap includes static marketing routes + **public catalogue slugs only**.
- Omits `/cart` and querystring filter variants.
- Slug history: `previousSlugs` / `product_slug_redirects` → `308/301` via `permanentRedirect` to the current slug.

## 404 / removed products

- Unknown slug → Next.js `notFound()` (404).
- Archived/draft never resolved by the public catalogue adapter.
- Business may later choose 410 for permanently removed SKUs; not automated yet.

## Internationalisation readiness

- `lang="en"`, Open Graph `locale: en_RW`, RWF formatting with `en-RW`.
- Do not invent address, phone, opening hours, or delivery guarantees in metadata.

## Image alt

- Use factual photograph descriptions from image metadata.
- Do not keyword-stuff prices or filename tokens into alt text.

## Cache notes

- Cache only public published catalogue responses when a CDN/data cache is added.
- Never cache private order/account/admin payloads in a shared public cache.
- Bound query params (`q` ≤ 120, `pageSize` ≤ 48) at the contract layer.
