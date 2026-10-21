import { describe, expect, it } from "vitest";
import { roleHasPermission } from "./roles";

describe("roleHasPermission", () => {
  it("allows owners to invite and set prices", () => {
    expect(roleHasPermission("owner", "admins:manage")).toBe(true);
    expect(roleHasPermission("owner", "products:price")).toBe(true);
  });

  it("allows managers to set prices but not invite", () => {
    expect(roleHasPermission("manager", "products:price")).toBe(true);
    expect(roleHasPermission("manager", "admins:manage")).toBe(false);
  });

  it("blocks staff from prices, invites, and import", () => {
    expect(roleHasPermission("staff", "products:price")).toBe(false);
    expect(roleHasPermission("staff", "admins:manage")).toBe(false);
    expect(roleHasPermission("staff", "import:run")).toBe(false);
    expect(roleHasPermission("staff", "products:write")).toBe(true);
  });
});
