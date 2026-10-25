/**
 * Tiny wrapper around the browser's local storage for things kept on the shopper's own device
 * (saved products, recently viewed, remembered checkout details, recent orders).
 *
 * Nothing here is sent to the server. Every function is safe to call when storage is blocked
 * (private mode, quota) — it simply does nothing — and writes notify other listeners on the
 * same page as well as other tabs.
 */

const CHANGE_EVENT = "ip-shap:device-storage";

export function readDevice(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Pass `null` to delete the key. */
export function writeDevice(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: the feature just does not remember anything.
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: key }));
}

export function subscribeDevice(key: string, onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    // `key === null` means the whole storage was cleared.
    if (event.key === key || event.key === null) onChange();
  };
  const onLocal = (event: Event) => {
    if ((event as CustomEvent<string>).detail === key) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onLocal);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onLocal);
  };
}
