/* IP SHAP staff Web Push — keep payloads tiny; always show a visible notification (Safari). */
/* eslint-disable no-undef */

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  /** @type {{ title?: string, body?: string, url?: string, tag?: string }} */
  let payload = {
    title: "IP SHAP",
    body: "You have a new admin alert.",
    url: "/admin/orders",
    tag: "ip-shap-admin",
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      if (parsed && typeof parsed === "object") {
        payload = { ...payload, ...parsed };
      }
    }
  } catch {
    try {
      const text = event.data && event.data.text();
      if (text) payload.body = text;
    } catch {
      // keep defaults
    }
  }

  const title = String(payload.title || "IP SHAP");
  const options = {
    body: String(payload.body || ""),
    tag: String(payload.tag || "ip-shap-admin"),
    data: {
      url: String(payload.url || "/admin/orders"),
    },
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw =
    (event.notification.data && event.notification.data.url) || "/admin/orders";
  const targetUrl = new URL(raw, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of windows) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(targetUrl);
            } catch {
              // Older browsers: focus is enough; user can open orders from nav.
            }
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })(),
  );
});
