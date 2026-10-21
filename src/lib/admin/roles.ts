export type AdminRole = "owner" | "manager" | "staff";

export type AdminPermission =
  | "products:read"
  | "products:write"
  | "orders:manage"
  | "inventory:adjust"
  | "import:run"
  | "admins:manage"
  | "audit:read";

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  owner: [
    "products:read",
    "products:write",
    "orders:manage",
    "inventory:adjust",
    "import:run",
    "admins:manage",
    "audit:read",
  ],
  /** Staff-equivalent catalogue/order rights; cannot manage admin_profiles (P2). */
  manager: [
    "products:read",
    "products:write",
    "orders:manage",
    "inventory:adjust",
    "import:run",
    "audit:read",
  ],
  staff: [
    "products:read",
    "products:write",
    "orders:manage",
    "inventory:adjust",
    "import:run",
    "audit:read",
  ],
};

export function roleHasPermission(
  role: AdminRole,
  permission: AdminPermission,
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
