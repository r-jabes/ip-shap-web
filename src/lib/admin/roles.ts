export type AdminRole = "owner" | "staff";

export type AdminPermission =
  | "products:read"
  | "products:write"
  | "inventory:adjust"
  | "import:run"
  | "admins:manage"
  | "audit:read";

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  owner: [
    "products:read",
    "products:write",
    "inventory:adjust",
    "import:run",
    "admins:manage",
    "audit:read",
  ],
  staff: [
    "products:read",
    "products:write",
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
