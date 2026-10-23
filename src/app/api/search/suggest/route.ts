import { NextResponse } from "next/server";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { getCategoriesDurable, listProductsDurable } from "@/lib/catalogue";
import { hasSupabaseAnonConfig } from "@/lib/supabase/config";
import { getSupabaseServerAnonClient } from "@/lib/supabase/server";
import {
  suggestCategories,
  suggestProducts,
  type ProductSuggestion,
} from "@/lib/search-suggest";

export const dynamic = "force-dynamic";

type SuggestRow = {
  id: string;
  slug: string;
  name: string;
  brand_name: string;
  price_rwf: number;
  image_src: string | null;
  image_alt: string;
  score: number;
};

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

async function suggestFromSql(
  q: string,
  limit: number,
): Promise<{ ok: true; products: ProductSuggestion[] } | { ok: false }> {
  const client = getSupabaseServerAnonClient();
  if (!client) return { ok: false };
  const { data, error } = await client.rpc("suggest_catalogue", {
    p_query: q,
    p_limit: limit,
  });
  if (error) return { ok: false };
  const rows = (data ?? []) as SuggestRow[];
  return {
    ok: true,
    products: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      brandName: row.brand_name ?? "",
      priceAmount: row.price_rwf,
      imageSrc: row.image_src,
      imageAlt: row.image_alt,
    })),
  };
}

async function suggestFromMemory(
  q: string,
  limit: number,
): Promise<{
  products: ProductSuggestion[];
  categories: Array<{ slug: string; name: string }>;
}> {
  const [products, categories] = await Promise.all([
    listProductsDurable(),
    getCategoriesDurable(),
  ]);
  return {
    products: suggestProducts(q, categories, limit, products),
    categories: suggestCategories(q, categories).map((c) => ({
      slug: c.slug,
      name: c.name,
    })),
  };
}

/**
 * GET /api/search/suggest?q=…
 * Rate limited; prefers Postgres pg_trgm RPC when Supabase is configured.
 */
export async function GET(request: Request) {
  const ip = clientIp(request);
  const limit = await consumeRateLimit(`search-suggest:${ip}`, 60, 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      },
    );
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) {
    return NextResponse.json(
      { products: [], categories: [] },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  }

  try {
    if (hasSupabaseAnonConfig()) {
      const [sql, categories] = await Promise.all([
        suggestFromSql(q, 6),
        getCategoriesDurable().then((cats) =>
          suggestCategories(q, cats).map((c) => ({
            slug: c.slug,
            name: c.name,
          })),
        ),
      ]);
      if (!sql.ok) {
        const fallback = await suggestFromMemory(q, 6);
        return NextResponse.json(fallback, {
          headers: {
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          },
        });
      }
      return NextResponse.json(
        { products: sql.products, categories },
        {
          headers: {
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          },
        },
      );
    }

    const body = await suggestFromMemory(q, 6);
    return NextResponse.json(body, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Search unavailable" },
      { status: 503 },
    );
  }
}
