# Staff Web Push — runbook

Standards-based Web Push (VAPID + service worker) for **admin staff** when a new order is placed. Email (`ORDER_NOTIFY_EMAILS`) remains the backup channel. Customer marketing push is **out of scope**.

## Enable on a deployment

1. Apply migration `20261107120000_push_subscriptions.sql` (`npm run db:push` from `backend/`).
2. Generate keys once: `npx web-push generate-vapid-keys`.
3. Set in Vercel (Production / Preview as needed):
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT` — e.g. `mailto:hello@the-ipshap.com`
4. Redeploy. Confirm `NEXT_PUBLIC_APP_URL` is the **www** canonical host.
5. Sign in as a normal Supabase admin (not bootstrap) → **Admin → Your account** → **Enable on this device**.

**Do not rotate VAPID keys casually** — every existing device subscription becomes invalid and staff must Enable again.

## How staff use it

| Platform | Notes |
| -------- | ----- |
| Desktop Chrome / Edge / Firefox | Enable on `/admin/account` |
| Android Chrome | Same |
| iPhone / iPad (16.4+) | Safari → Share → **Add to Home Screen** → open the icon → sign in → Enable. A normal Safari tab cannot subscribe. |

Disable on the same page when leaving a shared computer.

## What gets sent

- Trigger: `notifyNewOrder` → outbox channel `web_push` / kind `staff_new_order`
- Payload: title, short body (reference + total), URL to `/admin/orders/{id}`
- Dead endpoints (HTTP 404/410) are deleted on send
- Soft-disabled rows older than 30 days are purged by `/api/cron/maintenance`

## Security notes

- Subscribe/unsubscribe require the admin session cookie; body `userId` is ignored
- Endpoints must be known browser push hosts (SSRF guard)
- `push_subscriptions` is service-role only (RLS on, no anon policies)
- Auth secrets (`p256dh` / `auth`) are device key material — treat DB backups accordingly
- Bootstrap emergency logins cannot register devices (no `auth.users` row)

## Manual QA checklist

- [ ] VAPID trio set; migration applied; redeployed
- [ ] Chrome desktop: Enable → place test order → banner appears → click opens order
- [ ] Disable on device → next order does not banner that browser
- [ ] Block permission in browser → UI shows blocked state
- [ ] Android Chrome (if available): same Enable + order test
- [ ] iOS: confirm tab shows Home Screen instructions; after install + Enable, order banners
- [ ] Revoke site data / clear permissions → Enable again creates a fresh subscription
- [ ] Email still arrives via `ORDER_NOTIFY_EMAILS` (backup)

## Privacy

Staff device push endpoints are operational data for order alerts, not customer marketing. Do not reuse this channel for promotional messages without a separate consent design.
