# Frontend operations

## Admin access

Operators sign in at **`/admin/login`** with Supabase Auth email/password (must have an active `admin_profiles` row). Seed owners from the backend (`npm run db:seed:admins`).

**How operators find admin (normal practice):**
- Bookmark `https://your-domain/admin` (or `…/admin/login`)
- Optional later: `admin.your-domain.com` → same app `/admin` (DNS + Vercel domain)
- Do **not** put a public “Admin” link in the storefront footer

**Required for sessions:** `ADMIN_SESSION_SECRET` (≥ 32 chars) in Vercel. After adding env vars, **Redeploy** — “Needs Attention” means the live deployment has not picked them up yet.

**Password reset:** `/admin/forgot-password` uses Supabase Auth email. In Supabase → Authentication → URL configuration, allow redirect `https://your-domain/admin/reset-password` (and staging URL).

**Team invites & password reset:** branded emails are sent via **Resend** (same `EMAIL_FROM` + `RESEND_API_KEY` as order alerts). Supabase only creates the secure action link; it does not send its default Auth templates. Invites go to `${NEXT_PUBLIC_APP_URL}/admin/accept-invite`. In Supabase → Authentication → URL configuration:

- set **Site URL** to the deployed site (for example `https://staging.the-ipshap.com`), never `http://localhost:3000`;
- add `https://your-domain/admin/accept-invite` and `https://your-domain/admin/reset-password` to **Redirect URLs**;
- make sure `NEXT_PUBLIC_APP_URL` is set in Vercel (it defaults to localhost when missing).

If Supabase ever falls back to the Site URL, the app forwards `#access_token=…&type=invite` links to `/admin/accept-invite` automatically.

**Discounts:** `products.price_rwf` is what customers pay; `compare_at_price_rwf` is the regular price shown crossed out. Apply migration `20261022190000_product_discounts.sql` (`npm run db:push` in `backend`) **before** deploying the frontend, then run `npm run db:seed:categories` for the common drinks categories.

**Break-glass (ops only, no UI):** `ADMIN_BOOTSTRAP_TOKEN` still works via server action if needed; prefer Auth + reset password for day-to-day.

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
