import { z } from "zod";

/**
 * Public (browser-safe) environment variables.
 * Only NEXT_PUBLIC_* keys belong here.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_DEMO_MODE: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
});

/**
 * Server-only environment variables. Never expose these to the client.
 */
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  /**
   * HMAC secret for admin session cookies. Required for admin login.
   * Generate a long random string; never commit the real value.
   */
  ADMIN_SESSION_SECRET: z.string().min(32).optional(),
  /**
   * Local/bootstrap login token compared with timing-safe equality.
   * Not a default password — must be set explicitly in the environment.
   * Production should use Supabase Auth + admin_profiles instead.
   */
  ADMIN_BOOTSTRAP_TOKEN: z.string().min(16).optional(),
  /** Optional allow-list; if set, only these emails may bootstrap. */
  ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional(),
  /**
   * E.164 WhatsApp Business number for deep links (digits with country code).
   * Leave unset until the business confirms the number.
   */
  WHATSAPP_BUSINESS_E164: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/)
    .optional(),
  /** Must stay false until a Rwanda-capable provider is verified. */
  ONLINE_PAYMENT_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  /**
   * `unselected` | `sandbox` — never set a live provider id without a documented decision.
   * Sandbox must not be labelled as live in UI.
   */
  PAYMENT_PROVIDER: z.enum(["unselected", "sandbox"]).default("unselected"),
  /** HMAC secret for sandbox webhook verification (server only). */
  PAYMENT_WEBHOOK_SECRET: z.string().min(16).optional(),
  /** Comma-separated staff emails for new-order alerts (P5). */
  ORDER_NOTIFY_EMAILS: z.string().optional(),
  /** From address for Resend transactional mail (P5). Plain email or `Name <email>`. */
  EMAIL_FROM: z.string().min(3).optional(),
  /** Resend API key — server only (P5). */
  RESEND_API_KEY: z.string().min(1).optional(),
  /** Cloudflare Turnstile secret — when set, public forms must pass a token (P8). */
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  /** Server Sentry DSN (P8). Prefer this over the public DSN on the server. */
  SENTRY_DSN: z.string().url().optional(),
  /**
   * Shared secret for the scheduled maintenance job (`/api/cron/maintenance`). Vercel Cron sends
   * it automatically as `Authorization: Bearer <value>`. At least 16 characters.
   */
  CRON_SECRET: z.string().min(16).optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function readPublicEnv(): PublicEnv {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE ?? "true",
  });
}

function readServerEnv(): ServerEnv {
  return serverEnvSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
    ADMIN_BOOTSTRAP_TOKEN: process.env.ADMIN_BOOTSTRAP_TOKEN,
    ADMIN_BOOTSTRAP_EMAIL: process.env.ADMIN_BOOTSTRAP_EMAIL,
    WHATSAPP_BUSINESS_E164: process.env.WHATSAPP_BUSINESS_E164,
    ONLINE_PAYMENT_ENABLED: process.env.ONLINE_PAYMENT_ENABLED ?? "false",
    PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER ?? "unselected",
    PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET,
    ORDER_NOTIFY_EMAILS: process.env.ORDER_NOTIFY_EMAILS,
    EMAIL_FROM: process.env.EMAIL_FROM,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    SENTRY_DSN: process.env.SENTRY_DSN,
    CRON_SECRET: process.env.CRON_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  });
}

let cachedPublicEnv: PublicEnv | undefined;
let cachedServerEnv: ServerEnv | undefined;

export function getPublicEnv(): PublicEnv {
  if (!cachedPublicEnv) {
    cachedPublicEnv = readPublicEnv();
  }
  return cachedPublicEnv;
}

export function getServerEnv(): ServerEnv {
  // Vitest/jsdom defines `window`; allow server env reads in unit tests.
  const isTest =
    process.env.NODE_ENV === "test" || process.env.VITEST === "true";
  if (typeof window !== "undefined" && !isTest) {
    throw new Error("getServerEnv() must only be called on the server.");
  }
  if (!cachedServerEnv) {
    cachedServerEnv = readServerEnv();
  }
  return cachedServerEnv;
}

/** Clears cached env — used by unit tests after stubbing process.env. */
export function resetEnvCacheForTests() {
  cachedPublicEnv = undefined;
  cachedServerEnv = undefined;
}

/**
 * Demo fixtures are for local/UI work only.
 * Production builds never load fixtures — even if DEMO_MODE was mis-set to true.
 */
export function isDemoMode(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return getPublicEnv().NEXT_PUBLIC_DEMO_MODE;
}
