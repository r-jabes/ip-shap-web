/**
 * Configurable delivery zones. Empty by default until the business confirms coverage.
 * Never invent fees.
 */

export type DeliveryZone = {
  id: string;
  code: string;
  name: string;
  description: string;
  /** Integer RWF, or null when fee not yet confirmed. */
  feeRwf: number | null;
  isActive: boolean;
  estimateNote?: string;
};

/** Populated later from Supabase / admin. Empty = zones not configured. */
const CONFIGURED_ZONES: DeliveryZone[] = [];

export function listActiveDeliveryZones(): DeliveryZone[] {
  return CONFIGURED_ZONES.filter((zone) => zone.isActive);
}

export function getDeliveryZone(
  id: string | undefined,
): DeliveryZone | undefined {
  if (!id) return undefined;
  return listActiveDeliveryZones().find((zone) => zone.id === id);
}

export function deliveryFeesConfigured(): boolean {
  return listActiveDeliveryZones().some((zone) => zone.feeRwf !== null);
}
