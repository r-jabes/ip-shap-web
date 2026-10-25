import { describe, expect, it } from "vitest";
import { parseIdList, pushRecent, toggleId } from "./id-list";

describe("parseIdList", () => {
  it("returns an empty list for missing or broken data", () => {
    expect(parseIdList(null, 5)).toEqual([]);
    expect(parseIdList("not json", 5)).toEqual([]);
    expect(parseIdList('{"a":1}', 5)).toEqual([]);
  });

  it("keeps only plain ids, without duplicates, up to the limit", () => {
    const raw = JSON.stringify(["a", "a", "b c", 7, "<script>", "d", "e", "f"]);
    expect(parseIdList(raw, 3)).toEqual(["a", "d", "e"]);
  });
});

describe("toggleId", () => {
  it("adds new ids at the front and removes existing ones", () => {
    expect(toggleId(["a", "b"], "c", 5)).toEqual(["c", "a", "b"]);
    expect(toggleId(["a", "b"], "a", 5)).toEqual(["b"]);
  });

  it("never grows beyond the limit", () => {
    expect(toggleId(["a", "b"], "c", 2)).toEqual(["c", "a"]);
  });
});

describe("pushRecent", () => {
  it("moves a repeat view to the front without duplicating it", () => {
    expect(pushRecent(["a", "b", "c"], "c", 5)).toEqual(["c", "a", "b"]);
  });

  it("drops the oldest when full", () => {
    expect(pushRecent(["a", "b"], "c", 2)).toEqual(["c", "a"]);
  });
});
