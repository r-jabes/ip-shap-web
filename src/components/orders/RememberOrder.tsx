"use client";

import { useEffect } from "react";
import {
  ORDERS_STORAGE_KEY,
  parseRememberedOrders,
  rememberOrder,
  type RememberedOrder,
} from "@/lib/device/recent-orders";
import { readDevice, writeDevice } from "@/lib/device/storage";

/** Keeps this order in the browser so the shopper can find it again without the private link. */
export function RememberOrder({ order }: { order: RememberedOrder }) {
  const { reference, token, placedAt, totalRwf } = order;
  useEffect(() => {
    const current = parseRememberedOrders(readDevice(ORDERS_STORAGE_KEY));
    const next = rememberOrder(current, { reference, token, placedAt, totalRwf });
    writeDevice(ORDERS_STORAGE_KEY, JSON.stringify(next));
  }, [reference, token, placedAt, totalRwf]);
  return null;
}
