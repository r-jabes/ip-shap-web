"use client";

import { useEffect } from "react";
import { recordRecentlyViewed } from "@/lib/device/use-saved";

/** Adds this product to the device's "recently viewed" list. Renders nothing. */
export function RecordView({ productId }: { productId: string }) {
  useEffect(() => {
    recordRecentlyViewed(productId);
  }, [productId]);
  return null;
}
