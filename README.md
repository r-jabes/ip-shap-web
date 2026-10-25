# IP SHAP — Frontend

Next.js storefront and admin UI for **THE IP SHAP BUSINESS LTD** (brand: **IP SHAP**), a drinks retailer in Rwanda.

Customers browse the catalogue, place guest orders, and contact the business. Operators manage products, stock, and orders under `/admin`.

## Stack

| Layer | Choice |
| ----- | ------ |
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, brand tokens |
| Data | Supabase (Postgres + Auth + Storage) via `@supabase/supabase-js` |
| Validation | Zod |
| Email | Resend (staff new-order alerts) |
| Observability | Optional Sentry (`@sentry/nextjs`), `/api/health` |
| Bot protection | Optional Cloudflare Turnstile |
| Tests | Vitest, Testing Library |
| Hosting | Vercel (typical) |

Database schema, RLS, and storage policies live in the companion **`backend/`** repo. This app never imports from `../backend` at runtime — only shared concepts via docs and mirrored types.

## What this app does

- **Storefront:** home, shop, product pages, cart, checkout, order confirmation/lookup, contact, policies, age gate
- **Catalogue:** published products from Supabase (local demo fixtures only when `NEXT_PUBLIC_DEMO_MODE=true` and not a production build)
- **Orders:** server-side create with price recompute, stock reserve at place, staff email notify
- **Admin:** Supabase Auth + `admin_profiles` (break-glass bootstrap token for emergencies)
- **Search:** rate-limited suggest API backed by Postgres `pg_trgm`

## Prerequisites

- Node.js 22+ and npm
- A Supabase project (staging) with migrations applied from `backend/`
- Optional: Resend account + verified sending domain for order emails

## Local setup

```bash
cd frontend
cp .env.example .env.local
# Fill keys — see documentation/ENVIRONMENT.md
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a real catalogue (not demo fixtures), apply backend migrations first, set Supabase keys, and use `NEXT_PUBLIC_DEMO_MODE=false`.

## Scripts

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run lint` / `typecheck` / `test` | Quality gates |
| `npm run format` / `format:check` | Prettier |
| `npm run audit:prod` | Fail on critical production advisories |
| `npm run analyze` | Bundle analyzer |
| `npm run smoke:public` | Concurrent smoke against a running base URL |

## Staging / Vercel

1. Ensure Supabase staging has migrations + seed (`backend` README).
2. Set env vars from `documentation/ENVIRONMENT.md` (Preview/Staging).
3. Root directory: `frontend`. Deploy.
4. Set `NEXT_PUBLIC_APP_URL` to the deployed URL; redeploy if needed.
5. Smoke `/shop`, `/admin/login`, checkout, `/api/health`.

## Documentation

Start at [documentation/README.md](./documentation/README.md).
