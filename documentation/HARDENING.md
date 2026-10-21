# Hardening, performance, and observability

Launch checklist for the storefront. Tick in review; do not invent passing scores.

## Security headers / CSP

- [x] Baseline CSP + COOP/CORP/Permissions-Policy/HSTS (production) via `src/lib/security/headers.ts`
- [x] CSP allows Cloudflare Turnstile, Supabase, and Sentry ingest
- [ ] **Waiver:** `'unsafe-inline'` / `'unsafe-eval'` remain for Next.js App Router hydration until nonce support is added

## Bot protection (Turnstile)

- [x] When `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` are set, checkout and contact verify tokens server-side
- [x] When secret is unset, verification is skipped (local/dev)
- [ ] Staging: create a Cloudflare Turnstile widget and set both keys together

## Observability

- [x] Sentry client/server/edge init when DSN is set
- [x] Uptime probe: `GET /api/health`
- [ ] Point an external monitor at `/api/health` on staging and production
- [ ] Set `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_DSN` (optional CI source maps: `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN`)

## Bundle hygiene

- [x] Shared rate limit under `@/lib/security/rate-limit`
- [x] `npm run analyze` for bundle inspection
- [x] Storefront routes avoid admin UI / `sharp` imports
- [ ] After analyze, confirm no accidental admin chunk on `/` or `/shop`

## Load / smoke

```bash
npm run smoke:public
# BASE_URL=https://your-staging.vercel.app SMOKE_CONCURRENCY=12 npm run smoke:public
```

- [ ] Smoke green for `/`, `/shop`, `/contact`, `/api/health`
- [ ] Manual: place a test order; abuse should hit rate limits

## Dependency audit

```bash
npm run audit:prod
```

- [ ] Re-run before each release; do not `audit fix --force` to Next 16 without a planned upgrade

## Core Web Vitals

Targets (field p75): LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 on `/` and `/shop`. Record lab scores in `PERFORMANCE_REPORT.md`.

## Related

- [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)
- Backend [BACKUP_RESTORE.md](../../backend/documentation/BACKUP_RESTORE.md)
