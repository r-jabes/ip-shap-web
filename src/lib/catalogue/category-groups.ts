/**
 * Menu grouping for database categories (the table has no group column).
 * Unknown slugs fall into "More" so custom categories still appear in the menu.
 */
const GROUPS: Record<string, string> = {
  whisky: "Spirits",
  vodka: "Spirits",
  gin: "Spirits",
  rum: "Spirits",
  "brandy-cognac": "Spirits",
  tequila: "Spirits",
  liqueurs: "Spirits",
  wine: "Wine",
  "red-wine": "Wine",
  "white-wine": "Wine",
  "rose-wine": "Wine",
  sparkling: "Wine",
  "sparkling-wine": "Wine",
  "beer-cider": "Beer & more",
  "soft-drinks": "Beer & more",
};

export function categoryGroupForSlug(slug: string): string | undefined {
  return GROUPS[slug];
}
