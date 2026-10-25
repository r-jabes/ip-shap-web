# Performance report

## Conditions

| Item        | Value                                                         |
| ----------- | ------------------------------------------------------------- |
| Date        | 2026-10-19                                                    |
| Environment | Local production build (`next build` + `next start` intended) |
| Network     | Lab only — no field RUM yet                                   |
| Device      | Developer workstation (not mid-range Android field)           |

Lab scores are **not** field proof. Target CWV when field data exists: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 (p75).

## Engineering controls in place

- Product grids paginated (`CATALOGUE_PAGE_SIZE = 12`)
- Next image AVIF/WebP; LCP candidates should use priority only on hero
- `poweredByHeader: false`; static assets excluded from middleware matcher
- Motion uses transform/opacity; `prefers-reduced-motion` respected in CSS
- No analytics/third-party trackers until consent reviewed
- Sitemap omits cart/checkout/order/admin

## Manual Lighthouse (operator)

After `npm run build && npm run start`:

1. Chrome DevTools → Lighthouse → Mobile, navigation to `/` and `/shop`
2. Record LCP element, transfer size of hero image, JS bundle main
3. Paste scores into the table below when measured

| Route   | LCP | INP/TBT | CLS | Notes                                      |
| ------- | --- | ------- | --- | ------------------------------------------ |
| `/`     | —   | —       | —   | Operator: fill after local prod Lighthouse |
| `/shop` | —   | —       | —   | Operator: fill after local prod Lighthouse |
| `/product/[slug]` | — | —     | —   | Sticky gallery + buy box; watch CLS        |

Motion (R7): CSS + `Reveal` / `PageEnter` only — no GSAP. See `MOTION_AND_DESIGN_SYSTEM.md` and `QUALITY_GATES.md`.

## Performance budgets

| Budget | Target | How |
| ------ | ------ | --- |
| LCP (field p75) | ≤ 2.5s | CrUX / RUM after domain live |
| INP (field p75) | ≤ 200ms | CrUX / RUM |
| CLS (field p75) | ≤ 0.1 | CrUX / RUM |
| Public smoke | `/`, `/shop`, `/contact`, `/api/health` OK under concurrency 8+ | `npm run smoke:public` |
| Bundle | No admin/sharp on storefront entry | `npm run analyze` |

## Residual risks

- Demo catalogue images may be large; confirm derivatives before launch
- CSP still allows unsafe-inline/eval for Next.js hydration (documented waiver)
- In-memory rate limits are per serverless isolate — add edge/provider limits at scale
