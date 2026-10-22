import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { fetchActiveAdminProfile } from "@/lib/admin/profiles";
import type { AdminRole } from "@/lib/admin/roles";
import { getServerEnv } from "@/lib/env";
import { hasSupabaseServiceConfig } from "@/lib/supabase/config";

export const ADMIN_SESSION_COOKIE = "ip_shap_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export type AdminSession = {
  sub: string;
  email: string;
  role: AdminRole;
  exp: number;
};

function sessionSecret(): string | undefined {
  return getServerEnv().ADMIN_SESSION_SECRET;
}

function sign(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

export function encodeSession(session: AdminSession, secret: string): string {
  const payloadB64 = Buffer.from(JSON.stringify(session), "utf8").toString(
    "base64url",
  );
  return `${payloadB64}.${sign(payloadB64, secret)}`;
}

export function decodeSession(
  token: string,
  secret: string,
): AdminSession | null {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;
  const expected = sign(payloadB64, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as AdminSession;
    if (!session.exp || session.exp * 1000 < Date.now()) return null;
    if (
      session.role !== "owner" &&
      session.role !== "manager" &&
      session.role !== "staff"
    ) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/** One live profile lookup per request, even when layout + page both ask. */
const loadLiveProfile = cache(async (userId: string) =>
  fetchActiveAdminProfile(userId),
);

/**
 * Signed cookie proves who the person is; the database decides whether they still have
 * access and which role they hold, so deactivating or demoting someone takes effect immediately.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const secret = sessionSecret();
  if (!secret) return null;
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = decodeSession(token, secret);
  if (!session) return null;
  if (session.sub.startsWith("bootstrap:") || !hasSupabaseServiceConfig()) {
    return session;
  }
  const profile = await loadLiveProfile(session.sub);
  if (!profile) return null;
  return { ...session, role: profile.role };
}

export async function setAdminSessionCookie(
  session: Omit<AdminSession, "exp">,
) {
  const secret = sessionSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }
  const full: AdminSession = {
    ...session,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, encodeSession(full, secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  const jar = await cookies();
  jar.delete(ADMIN_SESSION_COOKIE);
}

export function safeEqualString(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
