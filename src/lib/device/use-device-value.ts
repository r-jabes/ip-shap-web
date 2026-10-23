"use client";

import { useSyncExternalStore } from "react";
import { readDevice, subscribeDevice } from "@/lib/device/storage";

/**
 * The raw stored text for a key (or null). Renders as null on the server and during hydration,
 * then updates on its own when the value changes in this tab or another one.
 */
export function useDeviceValue(key: string): string | null {
  return useSyncExternalStore(
    (onChange) => subscribeDevice(key, onChange),
    () => readDevice(key),
    () => null,
  );
}
