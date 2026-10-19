import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "./logger";

describe("logger redaction", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redacts sensitive keys", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    logger.info("test", {
      password: "secret",
      token: "abc",
      orderReference: "IPS-1",
    });
    const line = spy.mock.calls[0]?.[0] as string;
    expect(line).toContain("[redacted]");
    expect(line).not.toContain("secret");
    expect(line).toContain("IPS-1");
  });
});
