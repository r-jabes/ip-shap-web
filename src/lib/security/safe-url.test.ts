import { describe, expect, it } from "vitest";
import { safeInternalPath } from "./safe-url";

describe("safeInternalPath", () => {
  it("allows relative same-site paths", () => {
    expect(safeInternalPath("/admin/orders")).toBe("/admin/orders");
    expect(safeInternalPath("/order/IPS?token=abc")).toBe(
      "/order/IPS?token=abc",
    );
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(safeInternalPath("//evil.example")).toBe("/");
    expect(safeInternalPath("https://evil.example")).toBe("/");
    expect(safeInternalPath("\\\\evil")).toBe("/");
  });
});
