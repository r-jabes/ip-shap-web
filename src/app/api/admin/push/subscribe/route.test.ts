import { beforeEach, describe, expect, it, vi } from "vitest";

const getAdminSession = vi.fn();
const upsert = vi.fn();
const disableForAdmin = vi.fn();

vi.mock("@/lib/admin/session", () => ({
  getAdminSession: () => getAdminSession(),
}));

vi.mock("@/lib/notifications/push/subscriptions", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/notifications/push/subscriptions")
  >("@/lib/notifications/push/subscriptions");
  return {
    ...actual,
    getPushSubscriptionStore: () => ({
      upsert,
      disableForAdmin,
      listActiveByAdmin: vi.fn(),
      listAllActive: vi.fn(),
      deleteByEndpoint: vi.fn(),
    }),
  };
});

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { DELETE, POST } from "./route";

const adminId = "11111111-1111-4111-8111-111111111111";
const validBody = {
  endpoint: "https://fcm.googleapis.com/fcm/send/abc",
  keys: {
    p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTsHaBg".padEnd(87, "A"),
    auth: "tBHItJI5svbpez7KI4CCXg",
  },
};

describe("POST /api/admin/push/subscribe", () => {
  beforeEach(() => {
    getAdminSession.mockReset();
    upsert.mockReset();
    disableForAdmin.mockReset();
  });

  it("returns 401 when there is no admin session", async () => {
    getAdminSession.mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/admin/push/subscribe", {
        method: "POST",
        body: JSON.stringify(validBody),
      }),
    );
    expect(res.status).toBe(401);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("rejects bootstrap sessions and ignores body userId", async () => {
    getAdminSession.mockResolvedValue({
      sub: "bootstrap:ops",
      email: "ops@example.com",
      role: "owner",
      exp: 9_999_999_999,
    });
    const res = await POST(
      new Request("http://localhost/api/admin/push/subscribe", {
        method: "POST",
        body: JSON.stringify({ ...validBody, userId: adminId }),
      }),
    );
    expect(res.status).toBe(403);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("rejects non-allowlisted endpoints", async () => {
    getAdminSession.mockResolvedValue({
      sub: adminId,
      email: "owner@example.com",
      role: "owner",
      exp: 9_999_999_999,
    });
    const res = await POST(
      new Request("http://localhost/api/admin/push/subscribe", {
        method: "POST",
        body: JSON.stringify({
          endpoint: "https://evil.example/hook",
          keys: validBody.keys,
        }),
      }),
    );
    expect(res.status).toBe(400);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("upserts with session admin id only", async () => {
    getAdminSession.mockResolvedValue({
      sub: adminId,
      email: "owner@example.com",
      role: "owner",
      exp: 9_999_999_999,
    });
    upsert.mockResolvedValue({
      id: "sub-1",
      adminUserId: adminId,
      endpoint: validBody.endpoint,
      p256dh: validBody.keys.p256dh,
      auth: validBody.keys.auth,
      userAgent: null,
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      disabledAt: null,
    });

    const res = await POST(
      new Request("http://localhost/api/admin/push/subscribe", {
        method: "POST",
        headers: { "user-agent": "Vitest" },
        body: JSON.stringify({
          subscription: validBody,
          userId: "22222222-2222-4222-8222-222222222222",
        }),
      }),
    );

    expect(res.status).toBe(200);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: adminId,
        endpoint: validBody.endpoint,
      }),
    );
    const json = await res.json();
    expect(json).toEqual({ ok: true, id: "sub-1", endpoint: validBody.endpoint });
  });
});

describe("DELETE /api/admin/push/subscribe", () => {
  beforeEach(() => {
    getAdminSession.mockReset();
    disableForAdmin.mockReset();
  });

  it("returns 401 without a session", async () => {
    getAdminSession.mockResolvedValue(null);
    const res = await DELETE(
      new Request("http://localhost/api/admin/push/subscribe", {
        method: "DELETE",
        body: JSON.stringify({ endpoint: validBody.endpoint }),
      }),
    );
    expect(res.status).toBe(401);
  });

  it("disables only when the store confirms ownership", async () => {
    getAdminSession.mockResolvedValue({
      sub: adminId,
      email: "owner@example.com",
      role: "owner",
      exp: 9_999_999_999,
    });
    disableForAdmin.mockResolvedValue(true);

    const res = await DELETE(
      new Request("http://localhost/api/admin/push/subscribe", {
        method: "DELETE",
        body: JSON.stringify({ endpoint: validBody.endpoint }),
      }),
    );
    expect(res.status).toBe(200);
    expect(disableForAdmin).toHaveBeenCalledWith(adminId, validBody.endpoint);
  });
});
