# Accounts and platform ownership

Prefer **client-owned** orgs; invite developers. Do not paste API keys into chat — only into Vercel / `.env.local`.

## Accounts

| Service | Purpose | Staging | Production | Owner |
| ------- | ------- | ------- | ---------- | ----- |
| Git | Source + CI | same repos | same | Dev / client |
| Supabase | Postgres, Auth, Storage | Project A | Project B (separate) | Client |
| Vercel | Next.js host | Preview / staging | Production | Client |
| Resend | Staff order emails | Test domain / key | Live domain / key | Client |
| Cloudflare | DNS (+ Turnstile later) | Optional | Custom domain | Client |
| Domain | Live hostname | — | `.rw` / `.com` | Client |
| Sentry | Errors | Optional | Recommended | Client / dev |

## Vercel ↔ Supabase

| Vercel env | Supabase project | `NEXT_PUBLIC_DEMO_MODE` |
| ---------- | ---------------- | ----------------------- |
| Preview / Staging | Staging | `false` for real catalogue |
| Production | Production | **`false` always** |

## Email

- Verify a sending domain in Resend (`EMAIL_FROM` cannot be raw Gmail as From).
- Example: `EMAIL_FROM=IP SHAP Orders <orders@rurango.com>`
- Recipients: `ORDER_NOTIFY_EMAILS` (staff Gmail addresses)

## Confirmed contact details

| Role | Channel | Value | Env |
| ---- | ------- | ----- | --- |
| Rosine | WhatsApp | `+250790801271` | `NEXT_PUBLIC_WHATSAPP_E164`, `WHATSAPP_BUSINESS_E164` |
| Patrick | Voice | `+250788937270` | `NEXT_PUBLIC_PHONE_E164` |
| Business | Email | `patrickiradukunda505@gmail.com` | `NEXT_PUBLIC_CONTACT_EMAIL` |
| Business | Address | `29 KK 218 St, Kigali, Rwanda` | `NEXT_PUBLIC_ADDRESS` |
| Hours | Opening | `08:00–20:00` | `NEXT_PUBLIC_OPENING_HOURS` |
| Both | Order alerts | both Gmails | `ORDER_NOTIFY_EMAILS` |
| Both | Admin | Supabase Auth + `admin_profiles` | — |

Full variable list: [ENVIRONMENT.md](./ENVIRONMENT.md).
