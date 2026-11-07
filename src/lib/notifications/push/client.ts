/**
 * Browser-side Web Push helpers for the admin opt-in UI.
 * Safe to import from Client Components only.
 */

const SW_PATH = "/sw.js";

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export type PushSupport =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "unsupported"
        | "ios_requires_installed_app"
        | "insecure_context"
        | "no_service_worker";
    };

/** Feature-detect without browser sniffing where possible. */
export function getPushSupport(): PushSupport {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unsupported" };
  }
  if (!window.isSecureContext) {
    return { ok: false, reason: "insecure_context" };
  }
  if (!("serviceWorker" in navigator)) {
    return { ok: false, reason: "no_service_worker" };
  }
  // iOS Safari tab: Notification is missing until Add to Home Screen.
  if (!("Notification" in window) || !("PushManager" in window)) {
    const ua = navigator.userAgent || "";
    const ios =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (ios) {
      return { ok: false, reason: "ios_requires_installed_app" };
    }
    return { ok: false, reason: "unsupported" };
  }
  return { ok: true };
}

export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register(SW_PATH, { scope: "/" });
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function subscribeToPush(
  vapidPublicKey: string,
): Promise<PushSubscription> {
  const registration = await registerPushServiceWorker();
  await navigator.serviceWorker.ready;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("permission_denied");
  }

  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      vapidPublicKey,
    ) as BufferSource,
  });
}

export async function unsubscribeFromPush(): Promise<string | null> {
  const subscription = await getCurrentPushSubscription();
  if (!subscription) return null;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  return endpoint;
}

export async function postSubscribe(subscription: PushSubscription): Promise<void> {
  const res = await fetch("/api/admin/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "subscribe_failed");
  }
}

export async function postUnsubscribe(endpoint: string): Promise<void> {
  const res = await fetch("/api/admin/push/subscribe", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ endpoint }),
  });
  if (!res.ok && res.status !== 404) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "unsubscribe_failed");
  }
}

/** Ping only this browser so staff can confirm banners before waiting for a real order. */
export async function postTestPush(): Promise<{ delivered: number; skipped?: string }> {
  const subscription = await getCurrentPushSubscription();
  const res = await fetch("/api/admin/push/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ endpoint: subscription?.endpoint }),
  });
  const body = (await res.json().catch(() => null)) as {
    ok?: boolean;
    error?: string;
    delivered?: number;
    skipped?: string;
  } | null;
  if (!res.ok) {
    throw new Error(body?.error ?? "test_failed");
  }
  return {
    delivered: body?.delivered ?? 0,
    skipped: body?.skipped,
  };
}
