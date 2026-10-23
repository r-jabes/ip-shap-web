import { afterEach, describe, expect, it } from "vitest";
import {
  AGE_GATE_BOOT_SCRIPT,
  AGE_GATE_COOKIE,
  AGE_GATE_OK_ATTRIBUTE,
  confirmAgeInBrowser,
  isCrawlerUserAgent,
} from "./age-gate";

describe("isCrawlerUserAgent", () => {
  it("detects common search crawlers", () => {
    expect(
      isCrawlerUserAgent(
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      ),
    ).toBe(true);
    expect(isCrawlerUserAgent("bingbot/2.0")).toBe(true);
  });

  it("does not treat normal browsers as crawlers", () => {
    expect(
      isCrawlerUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
      ),
    ).toBe(false);
    expect(isCrawlerUserAgent(null)).toBe(false);
  });
});

describe("age gate in the browser", () => {
  afterEach(() => {
    document.documentElement.removeAttribute(AGE_GATE_OK_ATTRIBUTE);
    document.cookie = `${AGE_GATE_COOKIE}=; Path=/; Max-Age=0`;
  });

  it("stays visible for a first-time visitor", () => {
    new Function(AGE_GATE_BOOT_SCRIPT)();
    expect(document.documentElement.hasAttribute(AGE_GATE_OK_ATTRIBUTE)).toBe(
      false,
    );
  });

  it("is hidden once the visitor has confirmed, and the answer is remembered", () => {
    confirmAgeInBrowser();
    expect(document.documentElement.getAttribute(AGE_GATE_OK_ATTRIBUTE)).toBe(
      "1",
    );
    expect(document.cookie).toContain(`${AGE_GATE_COOKIE}=1`);

    // A later page load: the boot script alone restores the state from the cookie.
    document.documentElement.removeAttribute(AGE_GATE_OK_ATTRIBUTE);
    new Function(AGE_GATE_BOOT_SCRIPT)();
    expect(document.documentElement.getAttribute(AGE_GATE_OK_ATTRIBUTE)).toBe(
      "1",
    );
  });
});
