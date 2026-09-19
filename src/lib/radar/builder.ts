import type { Card } from "./schema";
import { compareRevenue, revenueFresh, revenueOf } from "./revenue";

export const buyerLabels = { agency: "Ajans", merchant: "E-ticaretçi", local: "Esnaf / yerel işletme", creator: "İçerik üreticisi", individual: "Bireysel kullanıcı", developer: "Geliştirici", business: "Diğer işletmeler", unknown: "Bilinmiyor" };
export const formatLabels = { web: "Web uygulaması", extension: "Tarayıcı eklentisi", automation: "Otomasyon", mobile: "Mobil uygulama", desktop: "Masaüstü uygulaması", unknown: "Bilinmiyor" };
export const difficultyLabels = { easy: "Kolay", medium: "Orta", hard: "Zor", unknown: "Bilinmiyor" };

/** Only classify the original source. A generated business angle cannot turn an SDK into a product. */
export function resourceKind(card: Pick<Card, "signals" | "title">): "product" | "tool" {
  const title = `${card.title} ${card.signals.map((s) => s.title).join(" ")}`.toLowerCase();
  const description = card.signals.map((s) => s.description).join(" ").toLowerCase();
  if (/\b(sdk|framework|library|libraries|dataset|benchmark|model weights|inference engine|agent memory|agent-memory|boilerplate|starter kit)\b/.test(title)) return "tool";
  // "Built with a framework" describes implementation, not the product itself.
  if (/(?:^|[.!?]\s+)(a|an|the|open.source|lightweight|typescript|python|rust)\s+(?:\w+\s+){0,2}(framework|library|sdk)\s+(for|to|that)\b/.test(description)) return "tool";
  return "product";
}
export function builderProfile(card: Card) {
  const b = card.analysis?.builder;
  const customer = (card.analysis?.customer ?? "").toLowerCase();
  const buyer = b?.buyer ?? (/ajans|agenc/.test(customer) ? "agency" : /e.ticaret|satıcı|merchant|shop owner/.test(customer) ? "merchant" : /esnaf|restoran|kuaför|yerel işletme/.test(customer) ? "local" : /içerik üret|creator/.test(customer) ? "creator" : /geliştirici|developer/.test(customer) ? "developer" : /bireysel|consumer/.test(customer) ? "individual" : "unknown");
  const source = card.signals.map((s) => `${s.title} ${s.description}`).join(" ").toLowerCase();
  const format = b?.format ?? (/chrome extension|browser extension|tarayıcı eklenti/.test(source) ? "extension" : /web app|web application/.test(source) ? "web" : /desktop app/.test(source) ? "desktop" : /mobile app|ios app|android app/.test(source) ? "mobile" : "unknown");
  const difficulty: keyof typeof difficultyLabels = card.analysis?.difficulty ?? "unknown";
  const upfrontUsd = b?.upfrontUsd ?? null;
  const monthlyUsd = b?.monthlyUsd ?? null;
  const needsApi = b?.needsApi ?? null;
  const needsPrivateData = b?.needsPrivateData ?? null;
  const needsGpu = b?.needsGpu ?? null;
  const kind = resourceKind(card);
  const solo = kind === "product" && !!card.analysis && card.analysis.mvpDays <= 14 && difficulty !== "hard" && buyer !== "unknown" && needsGpu !== true && needsPrivateData !== true;
  const lean = solo && upfrontUsd !== null && upfrontUsd <= 50 && monthlyUsd !== null && monthlyUsd <= 20 && needsGpu === false && needsPrivateData === false;
  return { buyer, format, difficulty, upfrontUsd, monthlyUsd, needsApi, needsPrivateData, needsGpu, kind, solo, lean };
}
export function commercialEvidence(card: Card): "provider" | "reviewed" | "reported" | "pricing" | "unknown" {
  const evidence = card.review?.evidence ?? [];
  const revenue = revenueOf(card);
  if (revenue && revenueFresh(revenue) && (revenue.last30DaysUsd ?? 0) > 0) return "provider";
  if (evidence.some((e) => e.kind === "paying_customers" && e.level === "reviewed")) return "reviewed";
  if (evidence.some((e) => e.kind === "paying_customers")) return "reported";
  if (evidence.some((e) => e.kind === "pricing")) return "pricing";
  return "unknown";
}
export const commercialLabels = { provider: "Ödeme sağlayıcısına bağlı gelir", reviewed: "Müşteri kanıtı incelendi", reported: "Yalnız gelir / müşteri beyanı", pricing: "Yalnız fiyatlandırma kanıtı", unknown: "Ticari kanıt bilinmiyor" };
export function distributionEvidence(card: Card): "reviewed" | "hypothesis" | "unknown" {
  if (card.review?.evidence.some((e) => e.kind === "distribution" && e.level === "reviewed")) return "reviewed";
  return card.analysis?.firstCustomers.length ? "hypothesis" : "unknown";
}
export type BuilderFilters = { buyer: string; format: string; difficulty: string; upfront: string; monthly: string; dependency: string; evidence: string; distribution: string; scope: string };
export const defaultBuilderFilters: BuilderFilters = { buyer: "all", format: "all", difficulty: "all", upfront: "all", monthly: "all", dependency: "all", evidence: "all", distribution: "all", scope: "solo" };
export function matchesBuilder(card: Card, f: BuilderFilters, applyScope = true): boolean {
  const p = builderProfile(card);
  if (applyScope && (f.scope === "solo" && !p.solo || f.scope === "lean" && !p.lean)) return false;
  if (f.buyer !== "all" && p.buyer !== f.buyer || f.format !== "all" && p.format !== f.format || f.difficulty !== "all" && p.difficulty !== f.difficulty) return false;
  for (const [filter, value] of [[f.upfront, p.upfrontUsd], [f.monthly, p.monthlyUsd]] as const) {
    if (filter === "unknown" ? value !== null : filter !== "all" && (value === null || value > Number(filter))) return false;
  }
  if (f.dependency === "no_api" && p.needsApi !== false) return false;
  if (f.dependency === "no_gpu" && p.needsGpu !== false) return false;
  if (f.dependency === "no_private_data" && p.needsPrivateData !== false) return false;
  if (f.dependency === "unknown" && p.needsApi !== null && p.needsGpu !== null && p.needsPrivateData !== null) return false;
  if (f.distribution !== "all" && distributionEvidence(card) !== f.distribution) return false;
  return f.evidence === "all" || commercialEvidence(card) === f.evidence;
}
export function compareForBuilder(a: Card, b: Card): number {
  const pa = builderProfile(a); const pb = builderProfile(b);
  const evidence = { provider: 4, reviewed: 3, reported: 2, pricing: 1, unknown: 0 };
  const reach = (c: Card) => distributionEvidence(c) === "reviewed" ? c.review?.scores.distribution ?? 0 : -1;
  return Number(pa.kind === "tool") - Number(pb.kind === "tool") || evidence[commercialEvidence(b)] - evidence[commercialEvidence(a)] || Number(pb.lean) - Number(pa.lean) || Number(pb.solo) - Number(pa.solo) || (revenueOf(a) && revenueOf(b) ? compareRevenue(a, b) : 0) || reach(b) - reach(a) || Number(!!b.analysis) - Number(!!a.analysis) || b.firstSeen.localeCompare(a.firstSeen) || b.momentum - a.momentum;
}

export function selectPublicCards(cards: Card[], limit = 150): Card[] {
  const ordered = [...cards].sort(compareForBuilder);
  const tools = ordered.filter((c) => resourceKind(c) === "tool");
  const products = ordered.filter((c) => resourceKind(c) === "product");
  // Reserve space for resources so a busy product feed cannot erase the tools tab.
  const reserved = Math.min(30, tools.length, limit);
  const chosen = products.slice(0, limit - reserved);
  return [...chosen, ...tools.slice(0, limit - chosen.length)];
}
