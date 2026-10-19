# Frontend security

## Rules

1. Never put service-role keys, webhook secrets, bootstrap tokens or payment credentials in `NEXT_PUBLIC_*` variables.
2. Validate all external input at Route Handler / Server Action boundaries.
3. Do not trust client-supplied prices; server must recompute totals from authoritative catalogue data (later phases).
4. Logger redacts sensitive keys (`src/lib/logger.ts`).
5. Prefer RLS-backed Supabase access from the browser; use service role only in tightly scoped server code.
6. Admin routes (`/admin/*`) are `noindex`. Every admin Server Action calls `requireSession(permission)` — hiding nav links is not enough.
7. Admin session cookies are httpOnly + HMAC-signed (`ADMIN_SESSION_SECRET`). Bootstrap login uses timing-safe token compare and generic errors.

## Admin local bootstrap

Until Supabase Auth sessions are wired end-to-end, local/staging can use:

- `ADMIN_SESSION_SECRET` (≥ 32 chars)
- `ADMIN_BOOTSTRAP_TOKEN` (≥ 16 chars, operator-generated)
- optional `ADMIN_BOOTSTRAP_EMAIL`

Documented in `ENVIRONMENT.md` / `OPERATIONS.md`. Production should migrate to Supabase Auth + `admin_profiles` RLS.

## Baseline checklist

- [x] No secrets in Git (examples only)
- [ ] CSP / security headers planned before production launch
- [x] Auth session handling for admin (cookie HMAC + server checks)
- [ ] Upload endpoints validate type, size and re-encode images (backend contracts ready)
- [ ] Age / alcohol sale restrictions reviewed by qualified local counsel before launch

## Alcohol / legal note

Alcohol may appear in the catalogue. This project does **not** claim legal compliance. A requirements checklist for qualified local review is maintained in backend security docs.
