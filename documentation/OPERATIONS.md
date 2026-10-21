# Frontend operations

## Admin access

**Preferred:** Supabase Auth email/password for users with an active `admin_profiles` row (seeded from the backend — see backend `OPERATIONS.md`).

**Break-glass (local / emergency):**

1. Set `ADMIN_SESSION_SECRET` (≥ 32 chars) and `ADMIN_BOOTSTRAP_TOKEN` (≥ 16 chars) in `.env.local` / Vercel.
2. Visit `/admin/login` → break-glass mode.
3. Disable bootstrap in production once Auth owners work.

## Deploy

- Admin ships with the Next.js app under `/admin` (`noindex`).
- Set all required env vars before promote (`ENVIRONMENT.md`).
- Keep `ONLINE_PAYMENT_ENABLED=false` until a Rwanda payment provider is chosen.
- Review `RELEASE_CHECKLIST.md` and `HARDENING.md` before production.

## Health

`GET /api/health` — use for uptime monitors. No database dependency.

## Bug triage

Use severity guidance in backend `RELEASE_CHECKLIST.md`. No open Critical/High money-flow or authz defects at launch.

## Rollback

Redeploy the previous frontend artifact. Durable data stays in Supabase.
