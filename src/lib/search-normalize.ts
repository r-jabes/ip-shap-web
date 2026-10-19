/**
 * Accent/case-insensitive normalisation aligned with backend
 * `catalogue_search_normalize` (lower + unaccent approximation).
 */
export function normalizeSearchText(input: string): string {
  return input.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

export function matchesSearchQuery(haystack: string, query: string): boolean {
  const q = normalizeSearchText(query);
  if (!q) return true;
  return normalizeSearchText(haystack).includes(q);
}
