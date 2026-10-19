# Frontend architecture

## System shape

```text
Browser
  └── Next.js App Router (this repo)
        ├── Server Components / Route Handlers
        │     └── Supabase (service role only where justified)
        └── Client Components (interactions)
              └── Supabase anon key + RLS
Backend repo
  ├── SQL migrations + RLS
  ├── Storage policies
  ├── Edge Functions / webhooks
  └── contracts/ (typed payloads)
```

## Boundaries

1. **Presentation** — `src/app`, `src/components`
2. **Domain types** — `src/domain` (products, money-facing shapes)
3. **Infrastructure helpers** — `src/lib` (env, logger, money, security, orders)
4. **Demo fixtures** — `src/fixtures/demo/` gated by `NEXT_PUBLIC_DEMO_MODE`
5. **Edge middleware** — request id + block sensitive path probes (not authz)

Security headers/CSP are applied in `next.config.ts`. Authorisation remains in Server Actions / layouts / RLS.

Server Components are the default. Client Components are reserved for interactive UI (cart drawer, gallery controls, forms).

## Data access strategy

- Phase 00 does not call Supabase yet; env slots are prepared.
- Catalogue reads will prefer RLS-safe queries with the anon/publishable key where possible.
- Privileged writes (admin inventory, webhook reconciliation) must stay server-side or in Edge Functions.
- Money is integer RWF end-to-end; formatting happens only at the presentation edge.

## Routing plan (not all implemented yet)

| Route                                                    | Intent                     |
| -------------------------------------------------------- | -------------------------- |
| `/`                                                      | Home / editorial entry     |
| `/shop`                                                  | Catalogue                  |
| `/product/[slug]`                                        | Product detail             |
| `/cart`                                                  | Cart                       |
| `/checkout`                                              | Checkout (later phases)    |
| `/about`, `/contact`, `/delivery`, `/faq`, `/policies/*` | Content pages              |
| `/admin/*`                                               | Operator UI (later phases) |

## Cross-repo contracts

1. Author request/response schemas in `backend/contracts/`.
2. Generate or manually copy TypeScript types into frontend domain modules when the contract version changes.
3. Record the contract version in both changelogs.
4. Never `import` from `../backend` in application code.

## Performance posture

- Prefer Server Components and static/streaming rendering.
- Lazy-load heavy client-only galleries and motion.
- Reserve image width/height or aspect-ratio to limit CLS.
- Respect `prefers-reduced-motion` (baseline CSS shipped in Phase 00).
