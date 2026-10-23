import { NextResponse } from "next/server";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { getLiveStock, MAX_LIVE_STOCK_IDS } from "@/lib/stock/live";

export const dynamic = "force-dynamic";

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

/**
 * GET /api/stock?ids=a,b,c
 * Live availability for cart lines and product pages. Public data only; never cached.
 */
export async function GET(request: Request) {
  const limit = consumeRateLimit(`stock:${clientIp(request)}`, 120, 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const raw = new URL(request.url).searchParams.get("ids") ?? "";
  const ids = raw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => ID_PATTERN.test(id))
    .slice(0, MAX_LIVE_STOCK_IDS);

  try {
    const stock = await getLiveStock(ids);
    return NextResponse.json(
      { stock },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Stock unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
