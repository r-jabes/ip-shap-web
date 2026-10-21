import { describe, expect, it } from "vitest";
import {
  DOCUMENT_ID_PATTERN,
  createDocumentId,
  encodeCrockford,
  isDocumentId,
} from "./document-id";

describe("document-id", () => {
  it("encodes crockford without ambiguous letters", () => {
    const encoded = encodeCrockford(Buffer.alloc(10, 0xff));
    expect(encoded).toHaveLength(16);
    expect(encoded).not.toMatch(/[ILOU]/);
  });

  it("creates opaque order ids without date or serial", () => {
    const id = createDocumentId("order");
    expect(id).toMatch(/^IPS-[0-9A-HJKMNP-TV-Z]{16}$/);
    expect(id).not.toMatch(/20\d{2}/);
    expect(id).not.toMatch(/0001|0002|SEQ/i);
  });

  it("uses distinct prefixes per kind", () => {
    expect(createDocumentId("quotation")).toMatch(/^QT-/);
    expect(createDocumentId("invoice")).toMatch(/^INV-/);
  });

  it("produces unique ids across many draws", () => {
    const set = new Set(Array.from({ length: 200 }, () => createDocumentId("order")));
    expect(set.size).toBe(200);
  });

  it("validates pattern", () => {
    const id = createDocumentId("order");
    expect(DOCUMENT_ID_PATTERN.test(id)).toBe(true);
    expect(isDocumentId(id, "order")).toBe(true);
    expect(isDocumentId(id, "invoice")).toBe(false);
    expect(isDocumentId("IPS-20261020-0001")).toBe(false);
  });
});
