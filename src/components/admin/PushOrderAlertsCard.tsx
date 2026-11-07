"use client";

import { useEffect, useState, useTransition } from "react";
import { AdminPanel } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/Button";
import {
  getCurrentPushSubscription,
  getPushSupport,
  postSubscribe,
  postTestPush,
  postUnsubscribe,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/notifications/push/client";

type Status =
  | "loading"
  | "unavailable"
  | "ios_install"
  | "off"
  | "on"
  | "denied"
  | "missing_config";

export function PushOrderAlertsCard({
  vapidPublicKey,
}: {
  vapidPublicKey: string | null;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      if (!vapidPublicKey) {
        if (!cancelled) setStatus("missing_config");
        return;
      }
      const support = getPushSupport();
      if (!support.ok) {
        if (!cancelled) {
          setStatus(
            support.reason === "ios_requires_installed_app"
              ? "ios_install"
              : "unavailable",
          );
        }
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("denied");
        return;
      }
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        const sub = await getCurrentPushSubscription();
        if (!cancelled) setStatus(sub ? "on" : "off");
      } catch {
        if (!cancelled) setStatus("unavailable");
      }
    }

    void refresh();
    return () => {
      cancelled = true;
    };
  }, [vapidPublicKey]);

  function enable() {
    if (!vapidPublicKey) return;
    setMessage(null);
    startTransition(async () => {
      try {
        const subscription = await subscribeToPush(vapidPublicKey);
        await postSubscribe(subscription);
        setStatus("on");
        setMessage(
          "This device is registered. Tap “Send a test alert” to confirm a banner + sound.",
        );
      } catch (error) {
        const code = error instanceof Error ? error.message : "failed";
        if (code === "permission_denied") {
          setStatus("denied");
          setMessage("Notifications are blocked for this site in your browser settings.");
        } else {
          setMessage("Could not enable alerts. Try again, or check that you are signed in.");
        }
      }
    });
  }

  function disable() {
    setMessage(null);
    startTransition(async () => {
      try {
        const endpoint = await unsubscribeFromPush();
        if (endpoint) await postUnsubscribe(endpoint);
        setStatus("off");
        setMessage("Order banners are off on this device.");
      } catch {
        setMessage("Could not turn alerts off. Try again.");
      }
    });
  }

  function sendTest() {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await postTestPush();
        if (result.skipped === "web_push_not_configured") {
          setMessage("Push is not configured on this deployment yet.");
          return;
        }
        if (!result.delivered) {
          setMessage(
            "Server did not deliver to this browser. Disable, Enable again, then retry.",
          );
          return;
        }
        setMessage(
          "Test sent. You should get a banner on THIS device — check the lock screen / notification shade, not only the laptop.",
        );
      } catch {
        setMessage("Could not send a test. Stay signed in and try again.");
      }
    });
  }

  return (
    <AdminPanel className="max-w-xl space-y-4">
      <h2 className="font-display text-xl">Order alerts on this device</h2>
      <p className="text-sm text-ink-muted">
        Each phone and computer must Enable separately. Open Admin on the
        phone (Chrome on Android, or the Home Screen icon on iPhone), then
        Enable here. Email alerts still work as a backup.
      </p>

      {status === "loading" ? (
        <p className="text-sm text-ink-muted">Checking this browser…</p>
      ) : null}

      {status === "missing_config" ? (
        <p className="text-sm text-ink-muted">
          Push alerts are not configured on this deployment yet (VAPID keys).
          Email order alerts are unchanged.
        </p>
      ) : null}

      {status === "ios_install" ? (
        <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-muted">
          <li>In Safari, open the Share menu.</li>
          <li>Choose <span className="font-semibold text-brand-charcoal">Add to Home Screen</span>.</li>
          <li>Open IP SHAP from the new Home Screen icon.</li>
          <li>Sign in to Admin, return here, then tap Enable.</li>
        </ol>
      ) : null}

      {status === "unavailable" ? (
        <p className="text-sm text-ink-muted">
          This browser cannot receive Web Push. Try Chrome or Edge on desktop,
          or Chrome on Android.
        </p>
      ) : null}

      {status === "denied" ? (
        <p className="text-sm text-ink-muted">
          Notifications are blocked. Allow them for this site in your browser
          or system settings, then refresh.
        </p>
      ) : null}

      {status === "off" || status === "on" ? (
        <div className="flex flex-wrap items-center gap-3">
          {status === "off" ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={pending}
              onClick={enable}
            >
              {pending ? "Enabling…" : "Enable on this device"}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={pending}
                onClick={sendTest}
              >
                {pending ? "Sending…" : "Send a test alert"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={disable}
              >
                Disable on this device
              </Button>
            </>
          )}
          <p className="text-sm text-ink-muted">
            {status === "on" ? "Alerts are on for this browser." : "Alerts are off here."}
          </p>
        </div>
      ) : null}

      {message ? <p className="text-sm text-brand-charcoal">{message}</p> : null}
    </AdminPanel>
  );
}
