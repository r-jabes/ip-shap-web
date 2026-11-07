/**
 * Only accept endpoints that real browser push services mint.
 * Rejecting arbitrary hosts stops SSRF when the server later POSTs to `endpoint`.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc8030
 */

const ALLOWED_HOST_SUFFIXES = [
  "fcm.googleapis.com",
  "android.googleapis.com",
  "jmt.google.com",
  "updates.push.services.mozilla.com",
  "notify.windows.com",
  "push.apple.com",
] as const;

/** Uncompressed P-256 public point in base64url is 87 chars; auth secret is 22. */
const P256DH_MIN = 80;
const P256DH_MAX = 120;
const AUTH_MIN = 20;
const AUTH_MAX = 40;
const ENDPOINT_MAX = 1000;

function hostAllowed(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return ALLOWED_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  );
}

export type PushSubscriptionValidationError =
  | "invalid_json"
  | "missing_endpoint"
  | "missing_keys"
  | "endpoint_not_https"
  | "endpoint_host_not_allowed"
  | "endpoint_too_long"
  | "invalid_key_length";

export type ValidatedPushSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

/**
 * Validates a client-posted PushSubscription JSON for storage.
 * Does not trust any userId field — callers bind admin id from the session.
 */
export function validatePushSubscriptionInput(
  input: unknown,
):
  | { ok: true; value: ValidatedPushSubscription }
  | { ok: false; error: PushSubscriptionValidationError } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "invalid_json" };
  }

  const record = input as Record<string, unknown>;
  const endpoint = record.endpoint;
  const keys = record.keys;

  if (typeof endpoint !== "string" || !endpoint.trim()) {
    return { ok: false, error: "missing_endpoint" };
  }
  if (!keys || typeof keys !== "object") {
    return { ok: false, error: "missing_keys" };
  }

  const keyRecord = keys as Record<string, unknown>;
  const p256dh = keyRecord.p256dh;
  const auth = keyRecord.auth;

  if (typeof p256dh !== "string" || typeof auth !== "string") {
    return { ok: false, error: "missing_keys" };
  }

  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return { ok: false, error: "endpoint_not_https" };
  }

  if (url.protocol !== "https:") {
    return { ok: false, error: "endpoint_not_https" };
  }
  if (url.username || url.password || url.port) {
    return { ok: false, error: "endpoint_host_not_allowed" };
  }
  if (endpoint.length > ENDPOINT_MAX) {
    return { ok: false, error: "endpoint_too_long" };
  }
  if (!hostAllowed(url.hostname)) {
    return { ok: false, error: "endpoint_host_not_allowed" };
  }

  if (
    p256dh.length < P256DH_MIN ||
    p256dh.length > P256DH_MAX ||
    auth.length < AUTH_MIN ||
    auth.length > AUTH_MAX
  ) {
    return { ok: false, error: "invalid_key_length" };
  }

  return {
    ok: true,
    value: {
      endpoint,
      p256dh,
      auth,
    },
  };
}
