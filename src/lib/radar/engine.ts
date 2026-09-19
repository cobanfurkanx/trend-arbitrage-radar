import { createHash } from "node:crypto";
import type { RadarInput } from "./sources";
import type { Card, Review, Signal, State } from "./schema";
import { isProductCandidate } from "./eligibility";

const digest = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 24);
const hosts = new Set(["news.ycombinator.com", "reddit.com", "old.reddit.com", "github.com", "producthunt.com", "trustmrr.com", "apps.apple.com", "play.google.com", "youtu.be", "youtube.com"]);
export function canonicalUrl(value: string): string | null {
  try {
    const u = new URL(value);
    if (!/^https?:$/.test(u.protocol)) return null;
    u.hash = "";
    u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
    for (const key of [...u.searchParams.keys()]) {
      if (/^(utm_|ref$|fbclid$|gclid$)/i.test(key)) u.searchParams.delete(key);
    }
    u.searchParams.sort();
    u.pathname = u.pathname.replace(/\/$/, "") || "/";
    return u.toString();
  } catch { return null; }
}
export function identity(raw: RadarInput) {
  const url = canonicalUrl(raw.sourceUrl);
  if (!url) throw new Error("Invalid source URL");
  const productUrl = typeof raw.rawData?.productUrl === "string" ? canonicalUrl(raw.rawData.productUrl) : null;
  const candidate = productUrl ?? url;
  const u = new URL(candidate);
  // Never merge unrelated posts just because they share a publishing platform.
  const key = hosts.has(u.hostname) ? candidate : u.hostname;
  return { signalId: `s_${digest(`${raw.source}:${url}`)}`, productId: `p_${digest(key)}`, url, productUrl };
}
export function ingestSignals(state: State, raw: RadarInput[], now: Date): void {
  const stamp = now.toISOString();
  for (const r of raw) {
    if (!Number.isFinite(r.publishedAt.getTime()) || r.publishedAt.getTime() > now.getTime() + 3600000) continue;
    const { signalId, productId, url, productUrl } = identity(r);
    const old = state.signals[signalId];
    // A newly discovered homepage can move an existing post to its product.
    // Remove the previous membership so a source cannot appear in two products.
    for (const existing of Object.values(state.products)) {
      if (existing.id !== productId && existing.signalIds.includes(signalId)) {
        existing.signalIds = existing.signalIds.filter((id) => id !== signalId);
        if (!existing.signalIds.length) delete state.products[existing.id];
      }
    }
    const engagement = Math.max(0, r.engagement ?? 0);
    const samples = [...(old?.samples ?? [])];
    if (!samples.length || now.getTime() - Date.parse(samples[samples.length - 1].at) >= 15 * 60000) samples.push({ at: stamp, engagement });
    const signal: Signal = {
      id: signalId, source: r.source, url, productUrl, title: r.title,
      description: (r.description ?? "").slice(0, 2000), category: r.category ?? "Other",
      publishedAt: r.publishedAt.toISOString(), firstSeen: old?.firstSeen ?? stamp,
      lastSeen: stamp, engagement, samples: samples.slice(-96),
      ...(r.revenue ? { revenue: r.revenue } : {}),
    };
    state.signals[signalId] = signal;
    const product = state.products[productId] ?? {
      id: productId, title: signal.title, category: signal.category, signalIds: [],
      firstSeen: old?.firstSeen ?? stamp, lastSeen: stamp, fingerprint: "", analysisStatus: "pending" as const,
    };
    if (!product.signalIds.includes(signalId)) product.signalIds.push(signalId);
    product.lastSeen = stamp;
    state.products[productId] = product;
  }
  for (const p of Object.values(state.products)) {
    p.fingerprint = digest(p.signalIds.slice().sort().map((id) => {
      const s = state.signals[id];
      return `${s.id}:${s.title}:${s.description}:${s.productUrl}`;
    }).join("|"));
  }
}
export function velocity(signal: Signal): number | null {
  const last = signal.samples.at(-1);
  if (!last) return null;
  const first = signal.samples.find((s) => Date.parse(last.at) - Date.parse(s.at) >= 3600000);
  if (!first) return null;
  return (last.engagement - first.engagement) / ((Date.parse(last.at) - Date.parse(first.at)) / 3600000);
}
function freshReview(review: Review | undefined, now: Date): Review | null {
  if (!review) return null;
  return { ...review, evidence: review.evidence.filter((e) => {
    const age = now.getTime() - Date.parse(e.checkedAt);
    return age >= 0 && age <= 30 * 86400000;
  }) };
}
export function cardsFrom(state: State, reviews: Review[], now: Date): Card[] {
  const all = Object.values(state.signals).filter((s) => isProductCandidate(s.source, s.title, s.description));
  return Object.values(state.products).map((p): Card => {
    const signals = p.signalIds.map((id) => state.signals[id]);
    // Compare signals within a source and age band; stars are not HN votes.
    const ranks = signals.map((s) => {
      const age = Math.max(1, (now.getTime() - Date.parse(s.publishedAt)) / 86400000);
      const peers = all.filter((x) => x.source === s.source && Math.abs((Date.parse(x.publishedAt) - Date.parse(s.publishedAt)) / 86400000) <= 7);
      const v = velocity(s);
      const strength = v === null ? Math.log1p(s.engagement) / Math.sqrt(age) : v;
      const comparable = peers.filter((x) => (velocity(x) === null) === (v === null));
      if (comparable.length < 3) return 0;
      return 100 * comparable.filter((x) => {
        const xv = velocity(x);
        const xa = Math.max(1, (now.getTime() - Date.parse(x.publishedAt)) / 86400000);
        return (xv === null ? Math.log1p(x.engagement) / Math.sqrt(xa) : xv) < strength;
      }).length / Math.max(1, comparable.length - 1);
    });
    const momentum = Math.round(Math.max(0, ...ranks));
    const rates = signals.map(velocity).filter((x): x is number => x !== null);
    const review = freshReview(reviews.find((r) => r.productId === p.id), now);
    const has = (kind: string) => review?.evidence.some((e) => e.kind === kind && e.level === "reviewed");
    const validated = !!(has("paying_customers") && has("turkey_demand"));
    const scores = review?.scores;
    const grounded = scores && has("paying_customers") && has("turkey_demand") && has("distribution") && has("competitor");
    const complete = scores && Object.values(scores).every((s) => s !== null);
    const score = grounded && complete ? Math.round(scores.commercial! * .25 + scores.turkeyDemand! * .25 + scores.distribution! * .2 + scores.feasibility! * .15 + scores.differentiation! * .1 + momentum * .05) : null;
    return {
      ...p, signals: signals.map(({ samples: _samples, ...s }) => s), momentum,
      // Per-source units are distinct; only expose a rate for a single signal.
      velocity: signals.length === 1 && rates.length === 1 ? rates[0] : null,
      stage: validated ? "validated" : "radar", opportunityScore: score, review,
      confidence: validated ? "high" : review?.evidence.length ? "medium" : "low",
    };
  }).filter((p) => now.getTime() - Date.parse(p.lastSeen) < 30 * 86400000 && p.signals.some((s) => isProductCandidate(s.source, s.title, s.description)))
    .sort((a, b) => (b.opportunityScore ?? -1) - (a.opportunityScore ?? -1) || b.momentum - a.momentum || b.firstSeen.localeCompare(a.firstSeen));
}
