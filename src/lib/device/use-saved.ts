"use client";

import { useCallback, useMemo } from "react";
import {
  MAX_RECENT,
  MAX_SAVED,
  parseIdList,
  pushRecent,
  RECENT_STORAGE_KEY,
  SAVED_STORAGE_KEY,
  toggleId,
} from "@/lib/device/id-list";
import { readDevice, writeDevice } from "@/lib/device/storage";
import { useDeviceValue } from "@/lib/device/use-device-value";

/** Products the shopper has saved on this device (newest first). */
export function useSavedIds() {
  const raw = useDeviceValue(SAVED_STORAGE_KEY);
  const ids = useMemo(() => parseIdList(raw, MAX_SAVED), [raw]);
  const toggle = useCallback((id: string) => {
    const current = parseIdList(readDevice(SAVED_STORAGE_KEY), MAX_SAVED);
    writeDevice(
      SAVED_STORAGE_KEY,
      JSON.stringify(toggleId(current, id, MAX_SAVED)),
    );
  }, []);
  return { ids, toggle };
}

/** Products the shopper looked at recently on this device (newest first). */
export function useRecentIds() {
  const raw = useDeviceValue(RECENT_STORAGE_KEY);
  return useMemo(() => parseIdList(raw, MAX_RECENT), [raw]);
}

export function recordRecentlyViewed(id: string) {
  const current = parseIdList(readDevice(RECENT_STORAGE_KEY), MAX_RECENT);
  if (current[0] === id) return;
  writeDevice(
    RECENT_STORAGE_KEY,
    JSON.stringify(pushRecent(current, id, MAX_RECENT)),
  );
}
