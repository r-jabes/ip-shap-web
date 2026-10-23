import { NextResponse } from "next/server";
import { hasSupabaseServiceConfig } from "@/lib/supabase/config";

/**
 * Lightweight uptime probe — no secrets, no DB round-trip.
 * Point external monitors (Better Stack, UptimeRobot, Vercel) at `/api/health`.
 *
 * In production it reports 503 when the database is not configured, so a mis-set deployment
 * is caught by monitoring instead of silently taking orders it cannot keep.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const storage = hasSupabaseServiceConfig() ? "database" : "missing";
  const broken = storage === "missing" && process.env.NODE_ENV === "production";

  return NextResponse.json(
    {
      ok: !broken,
      service: "ip-shap-frontend",
      storage,
      ts: new Date().toISOString(),
    },
    {
      status: broken ? 503 : 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
