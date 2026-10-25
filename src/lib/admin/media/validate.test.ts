import { describe, expect, it } from "vitest";
import { assertValidImageUpload, detectImageKind } from "./validate";

describe("detectImageKind", () => {
  it("detects jpeg magic bytes", () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(detectImageKind(bytes)).toBe("jpeg");
  });

  it("rejects unknown payloads", () => {
    expect(detectImageKind(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]))).toBeNull();
  });
});

describe("assertValidImageUpload", () => {
  it("rejects empty buffers", () => {
    expect(() => assertValidImageUpload(new Uint8Array())).toThrow(/Empty/);
  });

  it("accepts jpeg", () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(assertValidImageUpload(bytes)).toBe("jpeg");
  });
});
