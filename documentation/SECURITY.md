# Frontend security

## Rules

1. Never put service-role keys, webhook secrets, bootstrap tokens or payment credentials in `NEXT_PUBLIC_*` variables.
2. Validate all external input at Route Handler / Server Action boundaries.
3. Do not trust client-supplied prices; server must recompute totals from authoritative catalogue data (later phases).
4. Logger redacts sensitive keys (`src/lib/logger.ts`).
5. Prefer RLS-backed Supabase access from the browser; use service role only in tightly scoped server code.
6. Admin routes (`/admin/*`) are `noindex`. Every admin Server Action calls `requireSession(permission)` — hiding nav links is not enough.
7. Admin session cookies are httpOnly + HMAC-signed (`ADMIN_SESSION_SECRET`). Bootstrap login uses timing-safe token compare and generic errors.
8. Checkout never trusts client prices; orders require idempotency keys; customer order lookup needs reference + high-entropy token (rate limited). Cart localStorage stores product IDs/qty only.

## Admin local bootstrap

Until Supabase Auth sessions are wired end-to-end, local/staging can use:

- `ADMIN_SESSION_SECRET` (≥ 32 chars)
- `ADMIN_BOOTSTRAP_TOKEN` (≥ 16 chars, operator-generated)
- optional `ADMIN_BOOTSTRAP_EMAIL`

Documented in `ENVIRONMENT.md` / `OPERATIONS.md`. Production should migrate to Supabase Auth + `admin_profiles` RLS.

## Baseline checklist

- [x] No secrets in Git (examples only)
- [x] CSP + baseline security headers via `next.config.ts` (`src/lib/security/headers.ts`)
- [x] Auth session handling for admin (cookie HMAC + server checks)
- [x] Open-redirect helper for internal paths (`safeInternalPath`)
- [x] Rate limits on admin login, checkout, order lookup (in-memory / single instance)
- [x] Payment webhook signature + payload size cap
- [x] Upload endpoints validate type, size and re-encode images (P3 admin path)
- [ ] Age / alcohol sale restrictions reviewed by qualified local counsel before launch
- [ ] CSP nonces (remove `'unsafe-inline'` / `'unsafe-eval'`) — **waiver:** Next App Router still needs inline hydration; see `HARDENING.md`
- [x] Turnstile on checkout + contact when `TURNSTILE_SECRET_KEY` is set
- [x] Sentry client/server/edge when DSN set; `/api/health` uptime probe
- [ ] Re-run `npm audit` before each release; avoid `audit fix --force` that jumps Next majors without a planned upgrade
- [ ] Sign [`SECURITY_CHECKLIST.md`](./SECURITY_CHECKLIST.md) before production cutover

## Dependency notes (2026-10-21)

`npm audit --omit=dev` may still report Next-bundled PostCSS advisories and related highs. Prefer a planned Next.js **patch** upgrade over `--force` to Next 16. Track until cleared; CI `audit:prod` still fails only on **critical**.

## Threat model

Full P0 one-pager: [`THREAT_MODEL.md`](./THREAT_MODEL.md). Platform accounts: [`PLATFORM_BOOTSTRAP.md`](./PLATFORM_BOOTSTRAP.md).

| Surface      | Risk            | Control                                     |
| ------------ | --------------- | ------------------------------------------- |
| Checkout     | Price tampering | Server recomputes RWF                       |
| Order lookup | Enumeration     | Reference + high-entropy token + rate limit |
| Admin        | Authz bypass    | Session + permission on every Server Action |
| Webhooks     | Forged paid     | HMAC verify; idempotent event ids           |
| Redirects    | Open redirect   | `safeInternalPath`                          |
| Logs         | Secret leak     | Redacting logger                            |

## CI dependency audit (P0)

- `npm run audit:prod` — fails on **critical** production advisories (required in CI).
- High/moderate from Next-bundled PostCSS: tracked below; do **not** `audit fix --force` to Next 16 without a planned upgrade phase.

## Alcohol / legal note

Alcohol may appear in the catalogue. This project does **not** claim legal compliance. See backend `RWANDA_LAUNCH_CHECKLIST.md` and `SECURITY.md`.
