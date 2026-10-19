# THE IP SHAP BUSINESS LTD — Frontend

Next.js App Router storefront for **THE IP SHAP BUSINESS LTD** (short brand: **IP SHAP**), a single-retailer drinks business in Rwanda.

## Purpose

- Public storefront and (later) admin UI
- Catalogue browsing, cart, checkout UX
- Talks to Supabase via validated public keys and server-only secrets

This repository does **not** own database migrations, RLS policies, Edge Functions, or webhook handlers. Those live in `../backend/`.

## Stack

- Next.js 15 App Router + React 19 + TypeScript (strict)
- Tailwind CSS v4 with centralized brand tokens
- Zod environment validation
- Vitest unit tests
- Prettier + ESLint
- Demo catalogue fixtures (local/demo mode only)

## Architecture summary

Chosen architecture: **Next.js frontend + managed Supabase backend**.

| Concern                                              | Location                                                                      |
| ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| UI, routing, SEO, client UX                          | This repo                                                                     |
| Server Components / Route Handlers that need secrets | This repo (server-only)                                                       |
| Postgres schema, RLS, Storage policies               | `backend/`                                                                    |
| Edge Functions, payment webhooks                     | `backend/`                                                                    |
| Shared API contracts (Zod/TS types)                  | Authored in `backend/contracts/`, mirrored carefully in frontend domain types |

Do not import files across the two repositories via relative filesystem paths.

## Local setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Companion backend setup (migrations / local Supabase) is documented in `../backend/documentation/README.md`.

## Scripts

| Command                | Purpose                |
| ---------------------- | ---------------------- |
| `npm run dev`          | Development server     |
| `npm run build`        | Production build       |
| `npm run start`        | Serve production build |
| `npm run lint`         | ESLint                 |
| `npm run typecheck`    | `tsc --noEmit`         |
| `npm run test`         | Vitest                 |
| `npm run format`       | Prettier write         |
| `npm run format:check` | Prettier check         |

## Documentation index

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DECISIONS.md](./DECISIONS.md)
- [ENVIRONMENT.md](./ENVIRONMENT.md)
- [DATA_MODEL.md](./DATA_MODEL.md)
- [SECURITY.md](./SECURITY.md)
- [TESTING.md](./TESTING.md)
- [OPERATIONS.md](./OPERATIONS.md)
- [API_USAGE.md](./API_USAGE.md)
- [CONTENT_AND_IMAGES.md](./CONTENT_AND_IMAGES.md)
- [MOTION_AND_DESIGN_SYSTEM.md](./MOTION_AND_DESIGN_SYSTEM.md)
- [CHANGELOG.md](./CHANGELOG.md)

## Phase status

- **Phase 00:** foundations, tokens, docs, CI, money/env helpers
- **Phase 01 (current):** client-facing storefront prototype (~90% visual direction)
  - Routes: `/`, `/shop`, `/product/[slug]`, `/cart`, `/about`, `/contact`, `/delivery`, `/faq`, `/policies/*`
  - Demo fixtures + cart drawer; no payments/backend integration
- **Next:** client review of visual direction, then assets/catalogue integration from `../resources/`
