import { getServerEnv } from "@/lib/env";

export type TurnstileVerifyResult =
  | { ok: true }
  | { ok: false; reason: "missing_token" | "not_configured" | "rejected" | "upstream" };

/**
 * When `TURNSTILE_SECRET_KEY` is unset, verification is skipped (local/dev).
 * When set, a non-empty response token is required and checked with Cloudflare.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileVerifyResult> {
  const secret = getServerEnv().TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { ok: true };
  }

  const trimmed = token?.trim() ?? "";
  if (!trimmed) {
    return { ok: false, reason: "missing_token" };
  }

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", trimmed);
    if (remoteIp) {
      body.set("remoteip", remoteIp);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
        signal: AbortSignal.timeout(8_000),
      },
    );

    if (!response.ok) {
      return { ok: false, reason: "upstream" };
    }

    const payload = (await response.json()) as { success?: boolean };
    if (!payload.success) {
      return { ok: false, reason: "rejected" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "upstream" };
  }
}

export function turnstileSiteKey(): string | null {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return key || null;
}

export function isTurnstileEnforced(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}
