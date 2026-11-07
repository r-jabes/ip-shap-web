import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { validatePushSubscriptionInput } from "@/lib/notifications/push/endpoint";
import {
  getPushSubscriptionStore,
  isPersistableAdminUserId,
} from "@/lib/notifications/push/subscriptions";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

function forbidden(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 403 });
}

/**
 * Register this browser/device for staff Web Push.
 * Admin id always comes from the signed session — never from the request body.
 */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  if (!isPersistableAdminUserId(session.sub)) {
    return forbidden("push_requires_supabase_admin");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const record =
    body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : null;
  // Ignore any client-supplied userId / adminUserId — session is the only source of truth.
  const subscriptionInput = record?.subscription ?? body;
  const validated = validatePushSubscriptionInput(subscriptionInput);
  if (!validated.ok) {
    return NextResponse.json(
      { ok: false, error: validated.error },
      { status: 400 },
    );
  }

  try {
    const stored = await getPushSubscriptionStore().upsert({
      ...validated.value,
      adminUserId: session.sub,
      userAgent: request.headers.get("user-agent"),
    });
    return NextResponse.json({
      ok: true,
      id: stored.id,
      endpoint: stored.endpoint,
    });
  } catch (error) {
    logger.error("push.subscribe_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { ok: false, error: "subscribe_failed" },
      { status: 500 },
    );
  }
}

/**
 * Soft-disable push for this device (owned by the current admin only).
 * Body: `{ "endpoint": "https://…" }`
 */
export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  if (!isPersistableAdminUserId(session.sub)) {
    return forbidden("push_requires_supabase_admin");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const endpoint =
    body && typeof body === "object"
      ? String((body as Record<string, unknown>).endpoint ?? "").trim()
      : "";

  if (!endpoint.startsWith("https://")) {
    return NextResponse.json(
      { ok: false, error: "missing_endpoint" },
      { status: 400 },
    );
  }

  try {
    const disabled = await getPushSubscriptionStore().disableForAdmin(
      session.sub,
      endpoint,
    );
    if (!disabled) {
      return NextResponse.json(
        { ok: false, error: "not_found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("push.unsubscribe_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { ok: false, error: "unsubscribe_failed" },
      { status: 500 },
    );
  }
}
