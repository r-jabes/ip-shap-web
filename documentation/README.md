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
| `npm run audit:prod`   | `npm audit` criticals (omit dev) |

## Documentation index

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DECISIONS.md](./DECISIONS.md)
- [ENVIRONMENT.md](./ENVIRONMENT.md)
- [PLATFORM_BOOTSTRAP.md](./PLATFORM_BOOTSTRAP.md)
- [THREAT_MODEL.md](./THREAT_MODEL.md)
- [DATA_MODEL.md](./DATA_MODEL.md)
- [SECURITY.md](./SECURITY.md)
- [TESTING.md](./TESTING.md)
- [OPERATIONS.md](./OPERATIONS.md)
- [API_USAGE.md](./API_USAGE.md)
- [CONTENT_AND_IMAGES.md](./CONTENT_AND_IMAGES.md)
- [MOTION_AND_DESIGN_SYSTEM.md](./MOTION_AND_DESIGN_SYSTEM.md)
- [QUALITY_GATES.md](./QUALITY_GATES.md)
- [PERFORMANCE_REPORT.md](./PERFORMANCE_REPORT.md)
- [CHECKOUT.md](./CHECKOUT.md)
- [CHANGELOG.md](./CHANGELOG.md)

## Phase status

- **Phase 00–08:** foundations through hardening (see CHANGELOG)
- **UI redesign R0–R8:** foundations → shell → home → shop → product → cart/checkout → content → motion/quality gates → admin restyle
- **Handover P0:** platform bootstrap (env matrix, threat model, CI audit) — see `PLATFORM_BOOTSTRAP.md`
- **Next:** `prompts/IMPLEMENTATION_PHASES.md` **P1** (durable Supabase data layer)
