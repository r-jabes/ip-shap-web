import { NextResponse } from "next/server";
import { snapshotProduct } from "@/lib/cart";
import { getCatalogueRepository } from "@/lib/catalogue/get-repository";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { MAX_LIVE_STOCK_IDS } from "@/lib/stock/live";

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
 * GET /api/cart/products?ids=a,b,c
 * Current name, price, photo and stock for the products in a shopper's saved cart. Products that
 * are no longer for sale are simply absent, which is how the cart knows to remove them.
 * Public data only; never cached.
 */
export async function GET(request: Request) {
  const limit = await consumeRateLimit(`cart:${clientIp(request)}`, 60, 60 * 1000);
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
    const products = await getCatalogueRepository().getProductsByIds(ids);
    return NextResponse.json(
      { products: products.map(snapshotProduct) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Products unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
