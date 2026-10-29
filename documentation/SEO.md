# SEO runbook — THE IP SHAP BUSINESS LTD

Technical SEO makes the site crawlable and eligible to rank. It does **not** guarantee first place. Local ranking also needs Google Business Profile, consistent name/address/phone, and a published catalogue.

## Indexing policy

| Mode                         | Behaviour                                                |
| ---------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_DEMO_MODE=true` | Global `noindex`; `robots.txt` disallows `/` (prototype) |
| Demo off + published content | Index public pages; disallow private/transactional paths |

Production must keep `NEXT_PUBLIC_DEMO_MODE=false` and **`NEXT_PUBLIC_APP_URL=https://www.the-ipshap.com`** (the live host). Apex `https://the-ipshap.com` **308-redirects to www** — if `APP_URL` is apex-only, sitemap `<loc>` URLs and canonicals disagree with the crawled host and Search Console may report “Sitemap could not be read” / 0 discovered pages.

Filtered shop URLs (`q`, brand, multi-category, non-default price/availability filters) set `robots: noindex,follow` and keep canonical `/shop` to avoid duplicate indexation.

Single-category landings (`/shop?category={slug}`) are **indexable** with a matching canonical.

Cart, checkout, orders, saved, admin, API, and `/dev` are disallowed / noindex as appropriate.

## Google Search Console

1. Set `GOOGLE_SITE_VERIFICATION` in Vercel to the HTML-tag content token from Search Console (not a secret).
2. Set `NEXT_PUBLIC_APP_URL=https://www.the-ipshap.com` (www, not apex). Redeploy.
3. Submit sitemap: `https://www.the-ipshap.com/sitemap.xml` (same host as `APP_URL`).
4. Use URL Inspection → **Test live URL** on `https://www.the-ipshap.com/` (clears stale “blocked by robots.txt” from an older crawl), then request indexing. Repeat for one category URL.

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

1. Confirm Vercel: `NEXT_PUBLIC_DEMO_MODE=false`, `NEXT_PUBLIC_APP_URL=https://www.the-ipshap.com`, `GOOGLE_SITE_VERIFICATION=<token>`.
2. Open `https://www.the-ipshap.com/robots.txt` — `Allow: /` (not `Disallow: /`). Open sitemap — every `<loc>` must be **www**, not apex.
3. In GSC: submit/resubmit `https://www.the-ipshap.com/sitemap.xml` → Test live URL on Home → request indexing.
4. Keep Google Business Profile NAP aligned with `NEXT_PUBLIC_ADDRESS` / phone env vars.

### GSC troubleshooting

| Symptom | Likely cause |
| ------- | ------------ |
| “Indexed, though blocked by robots.txt” with crawl date days ago | Stale crawl from when demo `Disallow: /` was live. Live `robots.txt` already allows `/` — use **Test live URL**. |
| “Sitemap could not be read” / 0 discovered pages | `APP_URL` apex while site redirects to www (host mismatch in `<loc>`). Fix env to www and redeploy. |
