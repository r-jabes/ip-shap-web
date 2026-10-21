# Frontend environment variables

Paste secrets only into Vercel or `.env.local` (gitignored). Never commit real keys.

## Staging setup (you already have Vercel + Supabase)

1. **Supabase (staging project)** → Settings → API: copy URL, anon key, service_role key.  
2. From `backend/`: `npx supabase link --project-ref <ref>` then `npm run db:push`, then `npm run db:seed:p1`.  
3. Create Auth users + `admin_profiles` rows (see `../backend/documentation/OPERATIONS.md`).  
4. **Vercel** → frontend project → Environment Variables → set the table below for **Preview** (and Production only when ready, with a **different** Supabase project).  
5. Root directory = `frontend`. Redeploy. Set `NEXT_PUBLIC_APP_URL` to the deployed URL.  
6. Smoke: `/shop`, `/admin/login`, checkout, `/api/health`.

Local UI-only: `NEXT_PUBLIC_DEMO_MODE=true` is fine. Hosted staging: use **`false`**.

## Variables you need now

| Variable | Where | Value / notes |
| -------- | ----- | ------------- |
| `NEXT_PUBLIC_APP_URL` | Public | Staging URL, e.g. `https://….vercel.app` |
| `NEXT_PUBLIC_DEMO_MODE` | Public | Staging/prod: **`false`**. Local only: `true` OK |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Staging project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Staging anon key |
| `NEXT_PUBLIC_WHATSAPP_E164` | Public | `+250790801271` |
| `NEXT_PUBLIC_PHONE_E164` | Public | `+250788937270` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public | `patrickiradukunda505@gmail.com` |
| `NEXT_PUBLIC_ADDRESS` | Public | `29 KK 218 St, Kigali, Rwanda` |
| `NEXT_PUBLIC_OPENING_HOURS` | Public | `08:00–20:00` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Staging service_role — never `NEXT_PUBLIC_*` |
| `ADMIN_SESSION_SECRET` | Server | Random ≥ 32 chars |
| `ADMIN_BOOTSTRAP_TOKEN` | Server | Random ≥ 16 chars (break-glass login) |
| `WHATSAPP_BUSINESS_E164` | Server | `+250790801271` |
| `ORDER_NOTIFY_EMAILS` | Server | `yadufashijerosine@gmail.com,patrickiradukunda505@gmail.com` |
| `EMAIL_FROM` | Server | `IP SHAP Orders <orders@verified-domain>` after Resend domain verify |
| `RESEND_API_KEY` | Server | Resend API key (orders still place without email if unset) |
| `ONLINE_PAYMENT_ENABLED` | Server | `false` |
| `PAYMENT_PROVIDER` | Server | `unselected` |

Template: `.env.example` → `cp .env.example .env.local`.

## Not needed yet (omit until you enable them)

Turnstile, Sentry, payment webhook secret, bootstrap email allow-list. Code stays optional when these are unset.

## `NEXT_PUBLIC_DEMO_MODE`

| Mode | Behaviour |
| ---- | --------- |
| `true` | Local fixtures OK. **Ignored in production builds** (always durable path) |
| `false` | Published Supabase catalogue — empty shop if DB/keys missing |

## Validation

`src/lib/env.ts` (Zod). Call `getServerEnv()` only on the server.
