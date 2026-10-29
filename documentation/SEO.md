# SEO runbook — THE IP SHAP BUSINESS LTD

Technical SEO makes the site crawlable and eligible to rank. It does **not** guarantee first place. Local ranking also needs Google Business Profile, consistent name/address/phone, and a published catalogue.

## Indexing policy

| Mode                         | Behaviour                                                |
| ---------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_DEMO_MODE=true` | Global `noindex`; `robots.txt` disallows `/` (prototype) |
| Demo off + published content | Index public pages; disallow private/transactional paths |

Production must keep `NEXT_PUBLIC_DEMO_MODE=false` and `NEXT_PUBLIC_APP_URL=https://the-ipshap.com`.

Filtered shop URLs (`q`, brand, multi-category, non-default price/availability filters) set `robots: noindex,follow` and keep canonical `/shop` to avoid duplicate indexation.

Single-category landings (`/shop?category={slug}`) are **indexable** with a matching canonical.

Cart, checkout, orders, saved, admin, API, and `/dev` are disallowed / noindex as appropriate.

## Google Search Console

1. Set `GOOGLE_SITE_VERIFICATION` in Vercel to the HTML-tag content token from Search Console (not a secret).
2. Redeploy, then verify the property.
3. Submit sitemap: `https://the-ipshap.com/sitemap.xml`.
4. Use URL Inspection on `/` and one category URL (e.g. `/shop?category=wine`).

## Per-URL metadata

- **Home / marketing pages:** unique title + description via `pageMetadata` (`lib/seo.ts`).
- **Shop / category:** unique title/description via `shopMetadata`; category landings use wholesale + Rwanda wording.
- **Product:** unique title, description, canonical, Open Graph/Twitter, product image when available.
- **Canonical:** product → `/product/{currentSlug}`; category shop → `/shop?category={slug}`; filtered shop → `/shop`.

## Structured data

- `LiquorStore` + `WebSite` (with `SearchAction` → `/shop?q={search_term_string}`) on the homepage.
- `Product` JSON-LD with integer RWF `offers.price`, `priceCurrency: RWF`, brand, and schema.org availability.
- `FAQPage` JSON-LD on `/faq` from the same Q&A shown on the page.
- **Never** emit reviews, aggregate ratings, or invented prices/availability.
- `unknown` stock → `LimitedAvailability` (not `InStock`).
- Visible breadcrumbs + matching `BreadcrumbList` JSON-LD.

## Sitemap & robots

- Sitemap includes static marketing routes, **one URL per category**, and **public catalogue slugs**.
- Omits `/cart`, `/checkout`, `/order`, `/saved`, `/admin`, `/dev`, and querystring filter variants (except category landings).
- Slug history: `previousSlugs` / `product_slug_redirects` → `308/301` via `permanentRedirect` to the current slug.

## 404 / removed products

- Unknown slug → Next.js `notFound()` (404).
- Archived/draft never resolved by the public catalogue adapter.
- Business may later choose 410 for permanently removed SKUs; not automated yet.

## Internationalisation readiness

- `lang="en"`, Open Graph `locale: en_RW`, RWF formatting with `en-RW`.
- Do not invent address, phone, opening hours, or delivery guarantees in metadata beyond confirmed `SITE` / env values.

## Image alt

- Use factual photograph descriptions from image metadata.
- Do not keyword-stuff prices or filename tokens into alt text.

## Cache notes

- Cache only public published catalogue responses when a CDN/data cache is added.
- Never cache private order/account/admin payloads in a shared public cache.
- Bound query params (`q` ≤ 120, `pageSize` ≤ 48) at the contract layer.

## Post-deploy checklist

1. Confirm Vercel: `NEXT_PUBLIC_DEMO_MODE=false`, `NEXT_PUBLIC_APP_URL=https://the-ipshap.com`, `GOOGLE_SITE_VERIFICATION=<token>`.
2. Open `/robots.txt` and `/sitemap.xml` on production — crawl allowed; categories + products listed.
3. In GSC: verify → submit sitemap → inspect Home and one category URL.
4. Keep Google Business Profile NAP aligned with `NEXT_PUBLIC_ADDRESS` / phone env vars.
