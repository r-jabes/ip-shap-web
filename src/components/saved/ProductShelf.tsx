"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { ProductGridSkeleton } from "@/components/catalogue/ProductGrid";
import type { DemoProduct } from "@/domain/catalogue";

/**
 * Shows the products for a list of ids kept on the device (saved or recently viewed), fetched
 * fresh so prices and stock are current. Products no longer for sale simply drop out.
 */
export function ProductShelf({
  ids,
  exclude,
  limit,
  empty,
}: {
  ids: string[];
  /** A product to leave out (for example the one being viewed). */
  exclude?: string;
  limit?: number;
  empty?: ReactNode;
}) {
  const { rememberProducts } = useCart();
  const wanted = useMemo(
    () => ids.filter((id) => id !== exclude).slice(0, limit ?? ids.length),
    [ids, exclude, limit],
  );
  const key = wanted.join(",");
  const [loaded, setLoaded] = useState<{ key: string; products: DemoProduct[] } | null>(
    null,
  );

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(
          `/api/cart/products?ids=${key.split(",").map(encodeURIComponent).join(",")}`,
          { cache: "no-store" },
        );
        const body = (await response.json()) as { products?: DemoProduct[] };
        if (cancelled || !Array.isArray(body.products)) return;
        const byId = new Map(body.products.map((product) => [product.id, product]));
        const ordered = key
          .split(",")
          .map((id) => byId.get(id))
          .filter((product): product is DemoProduct => !!product);
        rememberProducts(ordered);
        setLoaded({ key, products: ordered });
      } catch {
        if (!cancelled) setLoaded({ key, products: [] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key, rememberProducts]);

  if (!key) return <>{empty ?? null}</>;
  if (!loaded || loaded.key !== key) {
    return <ProductGridSkeleton count={Math.min(wanted.length, 4)} />;
  }
  if (loaded.products.length === 0) return <>{empty ?? null}</>;

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4 lg:gap-x-6">
      {loaded.products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
