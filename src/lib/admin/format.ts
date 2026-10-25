const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Kigali",
});

const dateOnly = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Kigali",
});

export function formatAdminDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateTime.format(date);
}

export function formatAdminDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateOnly.format(date);
}

const AUDIT_LABELS: Record<string, string> = {
  "product.create": "Added a product",
  "product.update": "Edited a product",
  "product.archive": "Archived a product",
  "product.discount": "Changed a discount",
  "product.featured": "Changed featured products",
  "product.bulk_status": "Changed several products at once",
  "category.upsert": "Saved a category",
  "brand.upsert": "Saved a brand",
  "inventory.adjust": "Adjusted stock",
  "catalogue.bulk_import": "Imported products",
  "privacy.erase": "Removed a customer's personal details",
  "admin.invite": "Invited a teammate",
  "admin.invite_resend": "Resent an invite",
  "admin.update": "Updated a teammate",
  "admin.deactivate": "Deactivated a teammate",
  "admin.reactivate": "Reactivated a teammate",
};

export function describeAuditAction(action: string): string {
  return AUDIT_LABELS[action] ?? action.replace(/[._]/g, " ");
}
