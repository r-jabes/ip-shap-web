import { describe, expect, it } from "vitest";
import { isCrawlerUserAgent } from "./age-gate";

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
