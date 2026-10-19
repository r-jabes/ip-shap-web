import { Chip } from "@/components/ui/Chip";
import {
  availabilityLabel,
  buildShopHref,
  type ShopQuery,
} from "@/lib/shop-query";
import { formatDemoPrice } from "@/domain/catalogue";
import { moneyRwf } from "@/lib/money";

export function AppliedFilterChips({
  query,
  categoryNames,
  brandNames,
}: {
  query: ShopQuery;
  categoryNames: Record<string, string>;
  brandNames: Record<string, string>;
}) {
  const chips: { key: string; label: string; href: string }[] = [];

  for (const slug of query.categories) {
    chips.push({
      key: `category-${slug}`,
      label: categoryNames[slug] ?? slug,
      href: buildShopHref(
        {
          categories: query.categories.filter((entry) => entry !== slug),
          page: 1,
        },
        query,
      ),
    });
  }

  for (const slug of query.brands) {
    chips.push({
      key: `brand-${slug}`,
      label: brandNames[slug] ?? slug,
      href: buildShopHref(
        {
          brands: query.brands.filter((entry) => entry !== slug),
          page: 1,
        },
        query,
      ),
    });
  }

  if (query.availability !== "all") {
    chips.push({
      key: "availability",
      label: availabilityLabel(query.availability),
      href: buildShopHref({ availability: "all", page: 1 }, query),
    });
  }

  if (typeof query.minPrice === "number") {
    chips.push({
      key: "minPrice",
      label: `From ${formatDemoPrice(moneyRwf(query.minPrice))}`,
      href: buildShopHref({ minPrice: undefined, page: 1 }, query),
    });
  }

  if (typeof query.maxPrice === "number") {
    chips.push({
      key: "maxPrice",
      label: `Up to ${formatDemoPrice(moneyRwf(query.maxPrice))}`,
      href: buildShopHref({ maxPrice: undefined, page: 1 }, query),
    });
  }

  if (query.q) {
    chips.push({
      key: "q",
      label: `“${query.q}”`,
      href: buildShopHref({ q: "", page: 1 }, query),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Chip
          key={chip.key}
          href={chip.href}
          selected
          removable
          aria-label={`Remove filter ${chip.label}`}
        >
          {chip.label}
        </Chip>
      ))}
      <Chip href="/shop" className="border-dashed">
        Clear all
      </Chip>
    </div>
  );
}
