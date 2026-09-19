import { describe, expect, it } from "vitest";
import { SCORING_WEIGHTS } from "../config/scoring";
import { heuristicScores, overallScore, scoreBreakdown } from "./score";
import type { ScoreKey } from "../types";

describe("scoring weights config", () => {
  it("sums to 1", () => {
    const total = SCORING_WEIGHTS.reduce((s, w) => s + w.weight, 0);
    expect(Math.abs(total - 1)).toBeLessThan(1e-9);
  });

  it("covers every ScoreKey exactly once", () => {
    const keys = SCORING_WEIGHTS.map((w) => w.key).sort();
    expect(keys).toEqual(
      [
        "trendVelocity",
        "turkeyFit",
        "competitionGap",
        "monetizationPotential",
        "buildability",
        "viralPotential",
        "novelty",
      ].sort()
    );
  });
});

describe("overallScore", () => {
  const full = (v: number): Record<ScoreKey, number> => ({
    trendVelocity: v,
    turkeyFit: v,
    competitionGap: v,
    monetizationPotential: v,
    buildability: v,
    viralPotential: v,
    novelty: v,
  });

  it("returns the value itself when all sub-scores are equal", () => {
    expect(overallScore(full(100))).toBe(100);
    expect(overallScore(full(0))).toBe(0);
    expect(overallScore(full(73))).toBe(73);
  });

  it("applies the configured weights", () => {
    
    const sub = {
      trendVelocity: 80,
      turkeyFit: 60,
      competitionGap: 70,
      monetizationPotential: 90,
      buildability: 50,
      viralPotential: 40,
      novelty: 100,
    };
    
    expect(overallScore(sub)).toBe(71);
  });

  it("clamps to 0..100", () => {
    expect(overallScore(full(1000))).toBe(100);
    expect(overallScore(full(-50))).toBe(0);
  });
});

describe("heuristicScores", () => {
  it("returns bounded integer scores for every key", () => {
    const sub = heuristicScores({
      category: "AI",
      earlySignal: "VeryEarly",
      sourceCount: 3,
      sourceDiversity: 0.75,
      totalEngagement: 900,
      firstSeen: new Date(),
    });
    for (const v of Object.values(sub)) {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it("rewards multi-source diversity in trendVelocity", () => {
    const base = {
      category: "SaaS" as const,
      earlySignal: "Emerging" as const,
      totalEngagement: 300,
      firstSeen: new Date(),
    };
    const solo = heuristicScores({ ...base, sourceCount: 1, sourceDiversity: 0.25 });
    const diverse = heuristicScores({ ...base, sourceCount: 4, sourceDiversity: 1 });
    expect(diverse.trendVelocity).toBeGreaterThan(solo.trendVelocity);
  });
});

describe("scoreBreakdown", () => {
  it("emits one labeled entry per weight", () => {
    const sub: Record<ScoreKey, number> = {
      trendVelocity: 80,
      turkeyFit: 60,
      competitionGap: 70,
      monetizationPotential: 90,
      buildability: 50,
      viralPotential: 40,
      novelty: 100,
    };
    const rows = scoreBreakdown(sub);
    expect(rows).toHaveLength(SCORING_WEIGHTS.length);
    for (const r of rows) {
      expect(r.label.length).toBeGreaterThan(0);
      expect(r.value).toBe(sub[r.key]);
    }
  });
});
