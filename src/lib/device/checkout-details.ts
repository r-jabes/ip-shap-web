/**
 * Contact and delivery details remembered on the shopper's device so the next checkout is
 * prefilled. Order notes and delivery instructions are never kept: they belong to one order.
 */

export const CHECKOUT_DETAILS_STORAGE_KEY = "ip-shap-checkout-details-v1";

export type CheckoutDetails = {
  customerName: string;
  customerPhone: string;
  deliveryDistrict: string;
  deliverySector: string;
  deliveryCell: string;
  deliveryVillage: string;
  deliveryDirections: string;
};

export const EMPTY_CHECKOUT_DETAILS: CheckoutDetails = {
  customerName: "",
  customerPhone: "",
  deliveryDistrict: "",
  deliverySector: "",
  deliveryCell: "",
  deliveryVillage: "",
  deliveryDirections: "",
};

/** Same limits as the checkout form fields. */
const MAX_LENGTH: Record<keyof CheckoutDetails, number> = {
  customerName: 200,
  customerPhone: 20,
  deliveryDistrict: 120,
  deliverySector: 120,
  deliveryCell: 120,
  deliveryVillage: 120,
  deliveryDirections: 500,
};

export function parseCheckoutDetails(raw: string | null): CheckoutDetails | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const source = parsed as Record<string, unknown>;
    const details = { ...EMPTY_CHECKOUT_DETAILS };
    for (const key of Object.keys(details) as Array<keyof CheckoutDetails>) {
      const value = source[key];
      if (typeof value === "string") {
        details[key] = value.slice(0, MAX_LENGTH[key]);
      }
    }
    return Object.values(details).some((value) => value.trim()) ? details : null;
  } catch {
    return null;
  }
}

export function serializeCheckoutDetails(details: CheckoutDetails): string {
  const clean = { ...EMPTY_CHECKOUT_DETAILS };
  for (const key of Object.keys(clean) as Array<keyof CheckoutDetails>) {
    clean[key] = details[key].trim().slice(0, MAX_LENGTH[key]);
  }
  return JSON.stringify(clean);
}
