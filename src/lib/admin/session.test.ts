import { describe, expect, it } from "vitest";
import { decodeSession, encodeSession, safeEqualString } from "./session";

describe("admin session tokens", () => {
  const secret = "test-secret-at-least-32-characters-long!!";

  it("round-trips a valid session", () => {
    const token = encodeSession(
      {
        sub: "user-1",
        email: "owner@example.com",
        role: "owner",
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      secret,
    );
    const session = decodeSession(token, secret);
    expect(session?.email).toBe("owner@example.com");
    expect(session?.role).toBe("owner");
  });

  it("rejects tampered signatures", () => {
    const token = encodeSession(
      {
        sub: "user-1",
        email: "owner@example.com",
        role: "owner",
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      secret,
    );
    expect(decodeSession(`${token}x`, secret)).toBeNull();
  });

  it("rejects expired sessions", () => {
    const token = encodeSession(
      {
        sub: "user-1",
        email: "owner@example.com",
        role: "staff",
        exp: Math.floor(Date.now() / 1000) - 10,
      },
      secret,
    );
    expect(decodeSession(token, secret)).toBeNull();
  });

  it("accepts manager role sessions", () => {
    const token = encodeSession(
      {
        sub: "user-2",
        email: "manager@example.com",
        role: "manager",
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      secret,
    );
    expect(decodeSession(token, secret)?.role).toBe("manager");
  });
});

describe("safeEqualString", () => {
  it("compares equal strings", () => {
    expect(safeEqualString("abc", "abc")).toBe(true);
    expect(safeEqualString("abc", "abd")).toBe(false);
  });
});
