# P8 — Hardening, performance, observability

Engineer checklist for launch readiness. Tick in review; do not invent passing scores.

## Security headers / CSP

- [x] Baseline CSP + COOP/CORP/Permissions-Policy/HSTS (prod) via `src/lib/security/headers.ts`
- [x] CSP allows Cloudflare Turnstile, Supabase, Sentry ingest
- [ ] **Waiver:** `'unsafe-inline'` / `'unsafe-eval'` remain for Next.js App Router hydration until nonce wiring (tracked)

## Bot protection (Turnstile)

- [x] Optional: when `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` are set, checkout + contact verify tokens server-side
- [x] Local/dev: unset secret → verification skipped (forms still work)
- [ ] Staging: create Cloudflare Turnstile widget; paste keys into host secrets

## Observability

- [x] `@sentry/nextjs` init (client/server/edge) when DSN set — `instrumentation.ts`, `sentry.*.config.ts`, `global-error.tsx`
- [x] Uptime probe: `GET /api/health` (no DB)
- [ ] Point Better Stack / UptimeRobot / Vercel monitor at `/api/health` on staging + prod
- [ ] Set `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_DSN`; optional `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` for source maps in CI

## Bundle / public-route hygiene

- [x] Rate limit lives in `@/lib/security/rate-limit` (not under admin UI tree)
- [x] `npm run analyze` → `@next/bundle-analyzer` (set `ANALYZE` via script)
- [x] Storefront routes do not import admin UI / `sharp` (upload path stays admin-only)
- [ ] Operator: after analyze, confirm no accidental admin chunk on `/` or `/shop`

## Load / smoke

```bash
# With `npm run start` (or staging URL):
npm run smoke:public
# BASE_URL=https://staging.example.com SMOKE_CONCURRENCY=12 npm run smoke:public
```

- [ ] Smoke green against staging for `/`, `/shop`, `/contact`, `/api/health`
- [ ] Manual: place one test order under modest parallel refresh (rate limit expected to throttle abuse)

## Dependency audit

```bash
npm run audit:prod   # fails CI on critical production advisories
npm audit --omit=dev # review highs; no audit fix --force to Next 16 without a planned upgrade
```

- [ ] Re-run before each release; document waivers in `SECURITY.md`

## Core Web Vitals

Targets (field p75): LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 on `/` and `/shop`.

- [ ] Lab Lighthouse mobile pasted into `PERFORMANCE_REPORT.md`
- [ ] Field RUM / CrUX after production domain is live

## Penetration-oriented checklist

See [`SECURITY_CHECKLIST.md`](./SECURITY_CHECKLIST.md). Engineer sign-off required before P9 production cutover.

## Backup restore

Backend drill: [`../../backend/documentation/BACKUP_RESTORE.md`](../../backend/documentation/BACKUP_RESTORE.md).

## Suggested commit messages (paste; do not auto-commit)

```
chore: harden CSP, rate limits, and bot protection for public forms

chore: add Sentry, uptime, and performance budgets for launch
```

Prefer **one** frontend commit covering P8 when ready.
