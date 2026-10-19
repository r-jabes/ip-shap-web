# Frontend environment variables

Never commit real secrets. Values below are names and purposes only.

## Public (`NEXT_PUBLIC_*`)

| Variable                        | Purpose                                                 |
| ------------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`           | Canonical site URL (metadata, absolute links)           |
| `NEXT_PUBLIC_DEMO_MODE`         | `true`/`false` — enables clearly labelled demo fixtures |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL (browser-safe)                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key (RLS-enforced)            |

## Server-only

| Variable                    | Purpose                                                             |
| --------------------------- | ------------------------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged Supabase key — server only, never shipped to the browser |
| `ADMIN_SESSION_SECRET`      | HMAC secret for admin session cookies (≥ 32 chars)                  |
| `ADMIN_BOOTSTRAP_TOKEN`     | Operator-generated bootstrap token (≥ 16 chars); not a default pwd  |
| `ADMIN_BOOTSTRAP_EMAIL`     | Optional allow-list email for bootstrap login                       |
| `NODE_ENV`                  | Node runtime mode                                                   |

## Validation

`src/lib/env.ts` validates public and server env with Zod. Call `getServerEnv()` only on the server.

## Local template

Copy `.env.example` to `.env.local` and fill values when Supabase is provisioned.
