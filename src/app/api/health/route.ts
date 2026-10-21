import { NextResponse } from "next/server";

/**
 * Lightweight uptime probe — no secrets, no DB round-trip.
 * Point external monitors (Better Stack, UptimeRobot, Vercel) at `/api/health`.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "ip-shap-frontend",
      ts: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
