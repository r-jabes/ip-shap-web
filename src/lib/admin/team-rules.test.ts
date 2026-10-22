import { describe, expect, it } from "vitest";
import { checkMemberChange, memberStatus } from "./team-rules";

const owner = { userId: "u1", role: "owner" as const, isActive: true };
const manager = { userId: "u2", role: "manager" as const, isActive: true };

describe("checkMemberChange", () => {
  it("blocks removing your own access", () => {
    expect(
      checkMemberChange({
        actorUserId: "u1",
        target: owner,
        next: { isActive: false },
        activeOwnerCount: 2,
      }),
    ).toMatch(/own access/);
    expect(
      checkMemberChange({
        actorUserId: "u1",
        target: owner,
        next: { role: "manager" },
        activeOwnerCount: 2,
      }),
    ).toMatch(/own access/);
  });

  it("blocks removing the last active owner", () => {
    expect(
      checkMemberChange({
        actorUserId: null,
        target: owner,
        next: { isActive: false },
        activeOwnerCount: 1,
      }),
    ).toMatch(/at least one active owner/);
  });

  it("allows normal edits", () => {
    expect(
      checkMemberChange({
        actorUserId: "u1",
        target: manager,
        next: { isActive: false },
        activeOwnerCount: 1,
      }),
    ).toBeNull();
    expect(
      checkMemberChange({
        actorUserId: "u1",
        target: owner,
        next: { role: "owner" },
        activeOwnerCount: 1,
      }),
    ).toBeNull();
  });
});

describe("memberStatus", () => {
  it("derives status", () => {
    expect(
      memberStatus({ isActive: false, invitedAt: "x", emailConfirmedAt: null }),
    ).toBe("deactivated");
    expect(
      memberStatus({ isActive: true, invitedAt: "x", emailConfirmedAt: null }),
    ).toBe("invited");
    expect(
      memberStatus({ isActive: true, invitedAt: "x", emailConfirmedAt: "y" }),
    ).toBe("active");
    expect(
      memberStatus({ isActive: true, invitedAt: null, emailConfirmedAt: "y" }),
    ).toBe("active");
  });
});
