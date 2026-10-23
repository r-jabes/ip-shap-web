import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { runMaintenance } from "@/lib/maintenance";
import { secureTokenEquals } from "@/lib/orders/token";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Scheduled housekeeping (see `vercel.json`). Vercel Cron calls this with
 * `Authorization: Bearer $CRON_SECRET`; anything else is rejected.
 */
export async function GET(request: Request) {
  const secret = getServerEnv().CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!secureTokenEquals(secret, provided)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const report = await runMaintenance();
  return NextResponse.json(report, {
    status: report.errors.length > 0 ? 500 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
