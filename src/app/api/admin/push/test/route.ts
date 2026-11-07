import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { getPublicEnv } from "@/lib/env";
import { sendWebPushToStaff } from "@/lib/notifications/push/send";
import { isPersistableAdminUserId } from "@/lib/notifications/push/subscriptions";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * Send a test banner to the current admin's device (or all of their devices).
 * Body optional: `{ "endpoint": "https://…" }` to ping only this browser.
 */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isPersistableAdminUserId(session.sub)) {
    return NextResponse.json(
      { ok: false, error: "push_requires_supabase_admin" },
      { status: 403 },
    );
  }

  let endpoint: string | undefined;
  try {
    const body = await request.json();
    if (body && typeof body === "object") {
      const value = String((body as Record<string, unknown>).endpoint ?? "").trim();
      if (value.startsWith("https://")) endpoint = value;
    }
  } catch {
    // empty body is fine — ping all of this admin's devices
  }

  const base = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  try {
    const result = await sendWebPushToStaff(
      {
        title: "Test alert",
        body: "If you see this, order banners work on this device.",
        url: `${base}/admin/account`,
        tag: "ip-shap-push-test",
      },
      {
        adminUserId: session.sub,
        endpoints: endpoint ? [endpoint] : undefined,
      },
    );
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 502 },
      );
    }
    if (result.skipped) {
      return NextResponse.json({
        ok: true,
        skipped: result.skipped,
        delivered: 0,
      });
    }
    return NextResponse.json({
      ok: true,
      delivered: result.summary.delivered,
    });
  } catch (error) {
    logger.error("push.test_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ ok: false, error: "test_failed" }, { status: 500 });
  }
}
