# Frontend decisions (ADRs)

## ADR-001 — Next.js + managed Supabase (2026-10-19)

### Context

THE IP SHAP BUSINESS LTD needs a production-grade single-retailer storefront with catalogue (300+ products), cart, online payment (later), WhatsApp-assisted ordering, Rwanda delivery configuration, admin inventory, and secure auth. The owner requires separate `frontend/` and `backend/` repositories.

### Options considered

1. **Next.js + managed Supabase** (Postgres, Auth, Storage, RLS, Edge Functions)
2. **Next.js + custom API service + Postgres**

### Decision

Choose option 1. Keep `backend/` as the home for SQL migrations, RLS, Storage policies, Edge Functions, webhook handlers, infrastructure notes and versioned contracts — not an always-on custom API merely for appearance.

### Why

- Fastest path to secure data access via RLS
- Fewer moving parts for a small retail team
- Edge Functions cover payment webhooks and privileged jobs
- Still preserves repository separation

### Consequences

- Frontend must treat Supabase as an external platform, not a local package import from `backend/`
- Contract drift must be managed deliberately
- Some “backend” logic may live in Next.js Route Handlers when that is the simplest secure place; document each case

## ADR-002 — Integer RWF money (2026-10-19)

### Decision

Store and calculate money as integer Rwandan Francs. Reject non-integers in helpers.

### Rejected alternatives

- Floating-point currency amounts
- Minor-unit conversion before a payment provider is verified

## ADR-003 — Demo mode gate (2026-10-19)

### Decision

Use `NEXT_PUBLIC_DEMO_MODE` (default `true` locally) to gate illustrative fixtures. Never auto-seed demo products into production databases.

## ADR-004 — Brand tokens centralized early (2026-10-19)

### Decision

Ship approved brand CSS tokens in Phase 00 (`#20201E`, `#F5F1E8`, `#F07836`, `#343430`) so Phase 01 UI work cannot invent a competing palette. Typography pairing may be refined in Phase 01.
