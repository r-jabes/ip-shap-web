import type { AvailabilityFilter, CatalogueFilters } from "@/domain/catalogue";

export type ShopSort = "price_asc" | "price_desc" | "name_asc";

export type ShopQuery = {
  categories: string[];
  brands: string[];
  availability: AvailabilityFilter;
  sort: ShopSort;
  q: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
};

const DEFAULT_QUERY: ShopQuery = {
  categories: [],
  brands: [],
  availability: "all",
  sort: "name_asc",
  q: "",
  page: 1,
};

function asList(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  const raw = Array.isArray(value) ? value : [value];
  return raw
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function parseShopSearchParams(
  params: Record<string, string | string[] | undefined>,
): ShopQuery {
  const sortRaw = first(params.sort) ?? DEFAULT_QUERY.sort;
  const sort: ShopSort =
    sortRaw === "price_asc" ||
    sortRaw === "price_desc" ||
    sortRaw === "name_asc"
      ? sortRaw
      : "name_asc";

  const availabilityRaw = first(params.availability) ?? "all";
  const availability: AvailabilityFilter =
    availabilityRaw === "in_stock" || availabilityRaw === "unknown"
      ? availabilityRaw
      : "all";

  const pageRaw = Number.parseInt(first(params.page) ?? "1", 10);

  return {
    categories: asList(params.category),
    brands: asList(params.brand),
    availability,
    sort,
    q: (first(params.q) ?? "").trim(),
    minPrice: parsePositiveInt(first(params.minPrice)),
    maxPrice: parsePositiveInt(first(params.maxPrice)),
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  };
}

/** Build a `/shop` href. Omits defaults so URLs stay short and Back stays meaningful. */
export function buildShopHref(
  query: Partial<ShopQuery>,
  base: ShopQuery = DEFAULT_QUERY,
): string {
  const next: ShopQuery = {
    ...base,
    ...query,
    categories: query.categories ?? base.categories,
    brands: query.brands ?? base.brands,
  };
  const params = new URLSearchParams();

  for (const slug of next.categories) params.append("category", slug);
  for (const slug of next.brands) params.append("brand", slug);

  if (next.availability !== "all") {
    params.set("availability", next.availability);
  }
  if (next.sort !== "name_asc") params.set("sort", next.sort);
  if (next.q) params.set("q", next.q);
  if (typeof next.minPrice === "number") {
    params.set("minPrice", String(next.minPrice));
  }
  if (typeof next.maxPrice === "number") {
    params.set("maxPrice", String(next.maxPrice));
  }
  if (next.page > 1) params.set("page", String(next.page));

  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export function shopQueryToFilters(query: ShopQuery): CatalogueFilters {
  return {
    categorySlugs: query.categories.length ? query.categories : undefined,
    brandSlugs: query.brands.length ? query.brands : undefined,
    availability: query.availability,
    sort: query.sort,
    q: query.q || undefined,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
  };
}

export function toggleInList(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((entry) => entry !== value)
    : [...list, value];
}

export function availabilityLabel(value: AvailabilityFilter | string): string {
  switch (value) {
    case "in_stock":
      return "In stock";
    case "low_stock":
      return "Low stock";
    case "out_of_stock":
      return "Out of stock";
    case "unknown":
      return "Ask us";
    case "all":
    default:
      return "All";
  }
}
