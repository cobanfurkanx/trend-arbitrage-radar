import { describe, expect, it } from "vitest";
import { firstMoverWindow } from "./utils";

describe("firstMoverWindow", () => {
  it("marks very-early, low-competition slots as OPEN", () => {
    expect(firstMoverWindow("VeryEarly", 80)).toBe("OPEN");
    expect(firstMoverWindow("Emerging", 90)).toBe("OPEN");
  });

  it("marks narrowing slots as NARROW", () => {
    expect(firstMoverWindow("Emerging", 70)).toBe("NARROW");
    expect(firstMoverWindow("VeryEarly", 60)).toBe("NARROW");
  });

  it("marks established or crowded slots as CROWDED", () => {
    expect(firstMoverWindow("Established", 95)).toBe("CROWDED");
    expect(firstMoverWindow("Emerging", 40)).toBe("CROWDED");
  });
});
