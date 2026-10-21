"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  if (window.turnstile) {
    return Promise.resolve();
  }
  if (scriptPromise) {
    return scriptPromise;
  }
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Turnstile script failed")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile script failed"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Invisible-until-needed Cloudflare Turnstile widget.
 * Renders only when `siteKey` is provided; writes token into a hidden input.
 */
export function TurnstileField({
  siteKey,
  name = "cf-turnstile-response",
}: {
  siteKey: string | null;
  name?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const reactId = useId();

  useEffect(() => {
    if (!siteKey || !hostRef.current) {
      return;
    }

    let cancelled = false;

    void loadTurnstileScript()
      .then(() => {
        if (cancelled || !hostRef.current || !window.turnstile) {
          return;
        }
        widgetIdRef.current = window.turnstile.render(hostRef.current, {
          sitekey: siteKey,
          theme: "light",
          callback: (token) => {
            if (inputRef.current) {
              inputRef.current.value = token;
            }
          },
          "expired-callback": () => {
            if (inputRef.current) {
              inputRef.current.value = "";
            }
          },
          "error-callback": () => {
            if (inputRef.current) {
              inputRef.current.value = "";
            }
          },
        });
      })
      .catch(() => {
        /* Widget missing — server will reject when Turnstile is enforced. */
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
      }
      widgetIdRef.current = null;
    };
  }, [siteKey]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className="space-y-2" data-turnstile={reactId}>
      <input ref={inputRef} type="hidden" name={name} defaultValue="" />
      <div ref={hostRef} className="flex justify-center sm:justify-start" />
      <p className="text-xs text-ink-muted">
        Protected by Cloudflare Turnstile.
      </p>
    </div>
  );
}
