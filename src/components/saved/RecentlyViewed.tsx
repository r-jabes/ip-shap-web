"use client";

import { ProductShelf } from "@/components/saved/ProductShelf";
import { useRecentIds } from "@/lib/device/use-saved";

/** "You looked at" strip for the product page. Hidden until there is something to show. */
export function RecentlyViewed({ currentProductId }: { currentProductId: string }) {
  const ids = useRecentIds();
  const others = ids.filter((id) => id !== currentProductId);
  if (others.length === 0) return null;
  return (
    <section aria-labelledby="recently-viewed-heading" className="mt-14">
      <h2 id="recently-viewed-heading" className="font-display text-2xl">
        Recently viewed
      </h2>
      <div className="mt-6">
        <ProductShelf ids={ids} exclude={currentProductId} limit={4} />
      </div>
    </section>
  );
}
