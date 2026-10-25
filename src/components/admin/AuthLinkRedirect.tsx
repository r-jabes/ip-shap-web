"use client";

import { useEffect } from "react";

/**
 * Safety net: if Supabase lands an invite or password-reset link on a page that cannot handle
 * it (for example the site root, when the redirect URL is not on the allow-list), forward the
 * tokens to the right admin page instead of dropping people on the shop home page.
 */
export function AuthLinkRedirect() {
  useEffect(() => {
    const { hash, pathname } = window.location;
    if (!hash.includes("access_token=")) return;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const type = params.get("type");
    const target =
      type === "invite"
        ? "/admin/accept-invite"
        : type === "recovery"
          ? "/admin/reset-password"
          : null;
    if (!target || pathname === target) return;
    window.location.replace(`${target}${hash}`);
  }, []);

  return null;
}
