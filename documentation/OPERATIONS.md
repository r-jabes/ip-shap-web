# Frontend operations

## Admin bootstrap (local)

1. Copy `.env.example` → `.env.local`
2. Generate secrets, e.g. `openssl rand -base64 48`
3. Set `ADMIN_SESSION_SECRET` and `ADMIN_BOOTSTRAP_TOKEN`
4. Optionally set `ADMIN_BOOTSTRAP_EMAIL` to your operator email
5. Visit `/admin/login`, sign in, confirm dashboard counts load
6. Log out clears the httpOnly cookie

Production: prefer Supabase Auth users listed in `admin_profiles` (see backend `OPERATIONS.md` / `SECURITY.md`). Disable bootstrap token in production once Auth is live.

## Deploy notes

- Admin UI ships with the Next.js app under `/admin`
- Ensure hosting env includes admin secrets when bootstrap is enabled
- Never commit `.env.local`

## Rollback

Redeploy previous frontend artifact; admin in-memory demo store resets on process restart (Supabase data is durable once connected).
