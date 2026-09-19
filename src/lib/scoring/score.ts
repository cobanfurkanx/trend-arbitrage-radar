import type { Category, EarlySignal, ScoreKey } from "../types";
import { SCORING_WEIGHTS, WEIGHT_TOTAL } from "../config/scoring";
import type { ClusterBrief } from "../ai/types";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));



export function heuristicScores(b: {
  category: Category;
  earlySignal: EarlySignal;
  sourceCount: number;
  sourceDiversity: number;
  totalEngagement: number;
  firstSeen: Date;
  keywords?: string[];
}): Record<ScoreKey, number> {
  const daysSinceFirst =
    (Date.now() - b.firstSeen.getTime()) / (24 * 60 * 60 * 1000);
  const recency = clamp(100 - daysSinceFirst * 8); 
  const diversityBoost = b.sourceDiversity * 20;

  const trendVelocity = clamp(
    b.sourceCount * 14 + b.sourceDiversity * 25 + Math.min(30, b.totalEngagement / 25) + recency * 0.2
  );

  const turkeyFitByCat: Record<string, number> = {
    AI: 84,
    SaaS: 82,
    Consumer: 82,
    Developer: 78,
    "E-commerce": 86,
    Domains: 82,
    Social: 84,
    Content: 80,
    Other: 70,
  };
  const turkeyFit = clamp((turkeyFitByCat[b.category] ?? 72) + diversityBoost * 0.3);

  const competitionGap = clamp(70 + (b.earlySignal === "VeryEarly" ? 14 : b.earlySignal === "Emerging" ? 6 : -6) + diversityBoost * 0.2);

  const monetizationByCat: Record<string, number> = {
    AI: 80,
    SaaS: 84,
    Consumer: 74,
    Developer: 78,
    "E-commerce": 82,
    Domains: 70,
    Social: 78,
    Content: 72,
    Other: 68,
  };
  const monetizationPotential = clamp((monetizationByCat[b.category] ?? 72) + diversityBoost * 0.2);

  const buildByCat: Record<string, number> = {
    AI: 84,
    SaaS: 76,
    Consumer: 82,
    Developer: 70,
    "E-commerce": 70,
    Domains: 88,
    Social: 74,
    Content: 82,
    Other: 72,
  };
  const buildability = clamp((buildByCat[b.category] ?? 74) + diversityBoost * 0.2);

  const viralPotential = clamp(64 + b.sourceDiversity * 18 + (b.category === "Consumer" ? 8 : 0));

  const novelty = clamp(b.earlySignal === "VeryEarly" ? 84 : b.earlySignal === "Emerging" ? 68 : 50);

  return {
    trendVelocity,
    turkeyFit,
    competitionGap,
    monetizationPotential,
    buildability,
    viralPotential,
    novelty,
  };
}



export function overallScore(sub: Record<ScoreKey, number>): number {
  let total = 0;
  let used = 0;
  for (const w of SCORING_WEIGHTS) {
    const v = sub[w.key];
    if (typeof v === "number") {
      total += v * w.weight;
      used += w.weight;
    }
  }
  const denom = used || WEIGHT_TOTAL;
  return clamp(total / denom);
}

export interface ScoredSub {
  key: ScoreKey;
  label: string;
  value: number;
}

export function scoreBreakdown(sub: Record<ScoreKey, number>): ScoredSub[] {
  return SCORING_WEIGHTS.map((w) => ({
    key: w.key,
    label: w.label,
    value: clamp(sub[w.key] ?? 0),
  }));
}
