import { describe, expect, it } from "vitest";
import {
  buildInviteEmail,
  buildPasswordResetEmail,
} from "./auth-email";
import { EMAIL_BRAND } from "./email-shell";

describe("auth email templates", () => {
  it("builds a branded invite", () => {
    const content = buildInviteEmail({
      actionUrl: "https://staging.the-ipshap.com/admin/accept-invite#token",
      logoUrl: "cid:ipshap-logo",
      appUrl: "https://staging.the-ipshap.com",
      recipientName: "Ada",
    });
    expect(content.subject).toContain("invited");
    expect(content.html).toContain(EMAIL_BRAND.burntOrange);
    expect(content.html).toContain("cid:ipshap-logo");
    expect(content.html).toContain("Set your password");
    expect(content.html).toContain("Ada");
    expect(content.text).toContain("Set your password:");
  });

  it("builds a branded password reset", () => {
    const content = buildPasswordResetEmail({
      actionUrl: "https://staging.the-ipshap.com/admin/reset-password#token",
      logoUrl: "cid:ipshap-logo",
      appUrl: "https://staging.the-ipshap.com",
    });
    expect(content.subject).toContain("Reset your password");
    expect(content.html).toContain("Reset password");
    expect(content.html).not.toContain("supabase");
  });
});
