import { afterEach, describe, expect, it, vi } from "vitest";
import { moneyRwf } from "@/lib/money";
import type { StoredOrder } from "@/lib/orders/store";

function sampleOrder(): StoredOrder {
  return {
    id: "ord-1",
    reference: "IPS-TESTORDER00001",
    lookupToken: "tok",
    channel: "whatsapp_assisted",
    fulfilmentStatus: "awaiting_confirmation",
    paymentStatus: "not_applicable",
    subtotal: moneyRwf(1000),
    deliveryFee: null,
    total: moneyRwf(1000),
    items: [
      {
        productId: "p1",
        productName: "Test Bottle",
        productSlug: "test-bottle",
        quantity: 1,
        unitPrice: moneyRwf(1000),
        lineTotal: moneyRwf(1000),
      },
    ],
    customerName: "Ada",
    customerPhone: "+250788123456",
    idempotencyKey: "11111111-1111-4111-8111-111111111301",
    stockReserved: true,
    stockCommitted: true,
    reservationExpiresAt: null,
    statusHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("sendNewOrderStaffEmail", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("skips when Resend is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    const { resetEnvCacheForTests } = await import("@/lib/env");
    resetEnvCacheForTests();
    const { sendNewOrderStaffEmail } = await import("./email");
    const result = await sendNewOrderStaffEmail(sampleOrder());
    expect(result).toEqual({ ok: true, skipped: "not_configured" });
  });

  it("posts to Resend when configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("EMAIL_FROM", "orders@example.com");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("ORDER_NOTIFY_EMAILS", "owner@example.com");
    const { resetEnvCacheForTests } = await import("@/lib/env");
    resetEnvCacheForTests();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "",
    });
    vi.stubGlobal("fetch", fetchMock);

    const { sendNewOrderStaffEmail } = await import("./email");
    const result = await sendNewOrderStaffEmail(sampleOrder());
    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test_key");
    const body = JSON.parse(init.body as string) as {
      from: string;
      subject: string;
      html: string;
      text: string;
      attachments?: Array<{ content_id?: string }>;
    };
    expect(body.from).toBe("IP SHAP <orders@example.com>");
    expect(body.subject).toContain("IP SHAP · New order");
    expect(body.html).toContain("THE IP SHAP BUSINESS LTD");
    expect(body.html).toContain("cid:ipshap-logo");
    expect(body.text).toContain("Open in admin");
    expect(body.attachments?.[0]?.content_id).toBe("ipshap-logo");
  });
});

