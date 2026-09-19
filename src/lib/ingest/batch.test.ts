import { describe, expect, it } from "vitest";
import { fingerprintOf, mapWithConcurrency } from "./batch";

describe("fingerprintOf", () => {
  it("is deterministic for identical inputs", () => {
    const parts = ["sig_a:120", "sig_b:45", "sources:2", "engagement:165"];
    expect(fingerprintOf(parts)).toBe(fingerprintOf([...parts]));
  });

  it("changes when engagement changes", () => {
    expect(fingerprintOf(["sig_a:120"])).not.toBe(fingerprintOf(["sig_a:121"]));
  });

  it("changes when the signal set changes", () => {
    expect(fingerprintOf(["sig_a:1"])).not.toBe(fingerprintOf(["sig_a:1", "sig_b:2"]));
  });
});

describe("mapWithConcurrency", () => {
  it("preserves order and respects the limit", async () => {
    let active = 0;
    let maxActive = 0;
    const results = await mapWithConcurrency([1, 2, 3, 4, 5, 6], 2, async (n) => {
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise((r) => setTimeout(r, 5));
      active--;
      return n * 10;
    });
    expect(results).toEqual([10, 20, 30, 40, 50, 60]);
    expect(maxActive).toBeLessThanOrEqual(2);
  });

  it("handles an empty list", async () => {
    await expect(mapWithConcurrency([], 4, async (x: number) => x)).resolves.toEqual([]);
  });
});
