import type { Card, Revenue } from "./schema";

export function revenueOf(card: Pick<Card, "signals">): Revenue | null {
  return card.signals.flatMap((s) => s.revenue ? [s.revenue] : []).sort((a, b) => b.observedAt.localeCompare(a.observedAt))[0] ?? null;
}
export function revenueFresh(r: Revenue, now = Date.now()): boolean {
  const observed = now - Date.parse(r.observedAt);
  const synced = r.syncedAt ? now - Date.parse(r.syncedAt) : observed;
  return observed >= -3600000 && observed <= 7 * 86400000 && synced >= -3600000 && synced <= 7 * 86400000;
}
export function businessAge(r: Revenue, now = Date.now()): number | null {
  if (!r.foundedAt) return null;
  const days = Math.floor((now - Date.parse(r.foundedAt)) / 86400000);
  return days >= 0 ? days : null;
}
export function matchesRevenue(card: Card, preset: string, now = Date.now()): boolean {
  const r = revenueOf(card);
  if (!r || !revenueFresh(r, now) || (r.last30DaysUsd ?? 0) <= 0) return false;
  if (preset === "meaningful") return r.last30DaysUsd! >= 100;
  if (preset === "growing") return r.last30DaysUsd! >= 100 && (r.growth30d ?? 0) > 0;
  if (preset === "young") { const age = businessAge(r, now); return age !== null && age <= 180 && r.last30DaysUsd! >= 100; }
  if (preset === "margin") return r.last30DaysUsd! >= 100 && (r.profitMarginReported ?? 0) > 0;
  return true;
}
export function compareRevenue(a: Card, b: Card): number {
  const ra = revenueOf(a); const rb = revenueOf(b);
  const grade = (r: Revenue | null) => !r || !revenueFresh(r) ? 0 : (r.last30DaysUsd ?? 0) < 100 ? 1 : (r.growth30d ?? 0) > 0 ? 3 : 2;
  const age = (r: Revenue | null) => r ? businessAge(r) ?? Infinity : Infinity;
  // A tiny previous base can inflate growth to 100,000%. Never rank by that %.
  return grade(rb) - grade(ra) || age(ra) - age(rb) || (rb?.last30DaysUsd ?? 0) - (ra?.last30DaysUsd ?? 0);
}
