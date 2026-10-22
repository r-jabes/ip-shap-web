const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}

/** "Johnnie Walker Black Label!" -> "johnnie-walker-black-label". Accents are folded. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

/**
 * Base slug from a name, made unique against `taken`.
 * Falls back to a short random id when the name has no usable characters.
 */
export function uniqueSlug(
  name: string,
  taken: ReadonlySet<string>,
  fallbackPrefix = "item",
): string {
  const base = slugify(name) || `${fallbackPrefix}-${randomSuffix()}`;
  if (!taken.has(base)) return base;
  for (let n = 2; n <= 50; n += 1) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${randomSuffix()}`;
}
