import { describe, expect, it } from "vitest";
import { MOTION } from "./motion";

describe("MOTION tokens", () => {
  it("keeps hero choreography inside the 450–850ms budget", () => {
    expect(MOTION.heroMs).toBeGreaterThanOrEqual(450);
    expect(MOTION.heroMs).toBeLessThanOrEqual(850);
  });

  it("keeps UI transitions shorter than editorial reveals", () => {
    expect(MOTION.fastMs).toBeLessThan(MOTION.uiMs);
    expect(MOTION.uiMs).toBeLessThan(MOTION.editorialMs);
    expect(MOTION.editorialMs).toBeLessThanOrEqual(MOTION.heroMs);
  });
});
