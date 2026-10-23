/** Pure helpers for the "saved" and "recently viewed" product lists kept on the shopper's device. */

export const SAVED_STORAGE_KEY = "ip-shap-saved-v1";
export const RECENT_STORAGE_KEY = "ip-shap-recent-v1";
export const MAX_SAVED = 60;
export const MAX_RECENT = 12;

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

/** Reads a stored list, ignoring anything that is not a plain product id. Newest first. */
export function parseIdList(raw: string | null, max: number): string[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const value of parsed) {
    if (typeof value !== "string" || !ID_PATTERN.test(value)) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    ids.push(value);
    if (ids.length >= max) break;
  }
  return ids;
}

/** Adds the id at the front, or removes it if it is already there. */
export function toggleId(list: string[], id: string, max: number): string[] {
  if (list.includes(id)) return list.filter((entry) => entry !== id);
  return [id, ...list].slice(0, max);
}

/** Moves the id to the front (adding it if needed) and drops the oldest beyond `max`. */
export function pushRecent(list: string[], id: string, max: number): string[] {
  return [id, ...list.filter((entry) => entry !== id)].slice(0, max);
}
