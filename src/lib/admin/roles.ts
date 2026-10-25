export type AdminRole = "owner" | "manager" | "staff";

export type AdminPermission =
  | "products:read"
  | "products:write"
  | "products:price"
  | "orders:manage"
  | "inventory:adjust"
  | "import:run"
  | "admins:manage"
  | "audit:read";

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  owner: [
    "products:read",
    "products:write",
    "products:price",
    "orders:manage",
    "inventory:adjust",
    "import:run",
    "admins:manage",
    "audit:read",
  ],
  /** Catalogue/ops rights; cannot invite admins or manage profiles. */
  manager: [
    "products:read",
    "products:write",
    "products:price",
    "orders:manage",
    "inventory:adjust",
    "import:run",
    "audit:read",
  ],
  /** No price edits, no invite, no bulk import. */
  staff: [
    "products:read",
    "products:write",
    "orders:manage",
    "inventory:adjust",
    "audit:read",
  ],
};

export function roleHasPermission(
  role: AdminRole,
  permission: AdminPermission,
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function isAdminRole(value: string): value is AdminRole {
  return value === "owner" || value === "manager" || value === "staff";
}
