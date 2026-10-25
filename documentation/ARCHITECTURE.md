# Frontend architecture

## System shape

```text
Browser
  └── Next.js App Router (this repo)
        ├── Server Components / Server Actions / Route Handlers
        │     └── Supabase (service role only for privileged paths)
        └── Client Components (cart, gallery, forms, age gate)
              └── Public config + anon key where RLS applies

backend/ (companion repo)
  ├── SQL migrations + RLS + Storage
  └── contracts/ (Zod schemas mirrored in frontend domain types)
```

## Boundaries in `src/`

| Area | Role |
| ---- | ---- |
| `app/` | Routes: storefront group, `admin/`, `api/` |
| `components/` | UI kit, cart, checkout, home, product, admin shells |
| `domain/` | Catalogue and money-facing types |
| `lib/` | Env, catalogue repos, orders, security, notifications, SEO |
| `fixtures/demo/` | Local-only demo catalogue (blocked in production builds) |

Security headers/CSP: `next.config.ts` + `lib/security/headers.ts`.  
Authorisation: Server Actions / admin layouts + Supabase RLS — never “hide the nav” alone.

Server Components are the default. Client Components are for interactivity only.

## Data access

- **Storefront catalogue:** published products via repository + cache; production builds never load demo fixtures.
- **Checkout / orders:** server actions recompute prices, create durable rows, call `reserve_order_stock`, notify staff.
- **Admin:** session cookie (HMAC) and/or Supabase Auth; every sensitive action checks permissions.
- **Money:** integer RWF end-to-end; format only at the UI edge.

## Primary routes

| Route | Purpose |
| ----- | ------- |
| `/` | Home |
| `/shop`, `/product/[slug]` | Catalogue |
| `/cart`, `/checkout`, `/order/[reference]` | Commerce |
| `/contact`, `/about`, `/delivery`, `/faq`, `/policies/*` | Content |
| `/admin/*` | Operators (`noindex`) |
| `/api/health`, `/api/search/suggest`, … | Health and small public APIs |

## Cross-repo contracts

1. Author schemas in `backend/contracts/`.
2. Mirror types into frontend domain modules when contracts change.
3. Never `import` from `../backend` in application code.

## Performance posture

- Prefer Server Components and cached catalogue reads.
- Paginate shop grids; modern image formats via Next Image.
- Respect `prefers-reduced-motion`.
- Optional Turnstile/Sentry only when env keys are set (no weight when unset).
