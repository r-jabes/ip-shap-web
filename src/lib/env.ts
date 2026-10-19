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
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() must only be called on the server.");
  }
  if (!cachedServerEnv) {
    cachedServerEnv = readServerEnv();
  }
  return cachedServerEnv;
}

export function isDemoMode(): boolean {
  return getPublicEnv().NEXT_PUBLIC_DEMO_MODE;
}
