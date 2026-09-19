import { describe, expect, it } from "vitest";
import type { Card } from "./schema";
import { builderProfile, compareForBuilder, commercialEvidence, defaultBuilderFilters, matchesBuilder, resourceKind, selectPublicCards } from "./builder";

const card = (): Card => ({
  id: "p1", title: "Invoice app", category: "SaaS", signalIds: [], signals: [],
  firstSeen: "2026-09-18T10:00:00Z", lastSeen: "2026-09-18T10:00:00Z", fingerprint: "1", analysisStatus: "ready",
  momentum: 20, velocity: null, stage: "radar", confidence: "low", opportunityScore: null, review: null,
  analysis: { title: "Fatura uygulaması", summary: "Fatura takip hipotezi", customer: "Küçük ajanslar", problem: "Geciken faturalar", turkishAngle: "Türkçe takip", features: ["Takip"], firstCustomers: ["Beş ajansla görüş"], validation: ["Görüşme yap", "Teklif gönder"], stopCondition: "Talep yoksa dur", unknowns: ["Ödeme isteği"], mvpDays: 7, difficulty: "easy" },
});
describe("builder selection", () => {
  it("reserves public snapshot capacity for tools even when the product feed is full", () => {
    const products = Array.from({ length: 200 }, (_, i) => ({ ...card(), id: `p${i}` }));
    const tool = { ...card(), id: "tool", title: "Agent SDK" };
    const result = selectPublicCards([...products, tool]);
    expect(result).toHaveLength(150);
    expect(result.some((c) => c.id === "tool")).toBe(true);
  });
  it("separates infrastructure even if AI invents a sellable angle", () => {
    const c = card(); c.title = "Memory SDK for AI agents";
    expect(resourceKind(c)).toBe("tool");
    expect(builderProfile(c).solo).toBe(false);
    expect(matchesBuilder(c, defaultBuilderFilters)).toBe(false);
  });
  it("does not mistake a web app built with a framework for a framework", () => {
    const c = card(); c.signals = [{ id: "s1", source: "github", url: "https://example.com", productUrl: null, title: "Invoices", description: "A web app built with a framework for invoicing", category: "SaaS", publishedAt: c.firstSeen, firstSeen: c.firstSeen, lastSeen: c.lastSeen, engagement: 4 }];
    expect(resourceKind(c)).toBe("product");
    expect(builderProfile(c).format).toBe("web");
  });
  it("supports existing cached analyses without fabricating zero costs", () => {
    const c = card(); const p = builderProfile(c);
    expect(p.buyer).toBe("agency"); expect(p.solo).toBe(true);
    expect(p.upfrontUsd).toBeNull(); expect(p.needsApi).toBeNull(); expect(p.lean).toBe(false);
    expect(matchesBuilder(c, { ...defaultBuilderFilters, upfront: "50" })).toBe(false);
    expect(matchesBuilder(c, { ...defaultBuilderFilters, upfront: "unknown" })).toBe(true);
  });
  it("does not interpret an unknown API dependency as no dependency", () => {
    expect(matchesBuilder(card(), { ...defaultBuilderFilters, dependency: "no_api" })).toBe(false);
  });
  it("requires explicit low budgets and dependency assessments for the lean preset", () => {
    const c = card(); c.analysis!.builder = { buyer: "agency", format: "web", upfrontUsd: 0, monthlyUsd: 10, needsApi: false, needsPrivateData: false, needsGpu: false, basis: "Explicit MVP scope assumption" };
    expect(matchesBuilder(c, { ...defaultBuilderFilters, scope: "lean" })).toBe(true);
    c.analysis!.builder.monthlyUsd = 30;
    expect(matchesBuilder(c, { ...defaultBuilderFilters, scope: "lean" })).toBe(false);
    c.analysis!.builder.monthlyUsd = null;
    expect(matchesBuilder(c, { ...defaultBuilderFilters, scope: "lean" })).toBe(false);
  });
  it("keeps long, hard and GPU-heavy builds out of the default solo selection", () => {
    const c = card(); c.analysis!.mvpDays = 30;
    expect(matchesBuilder(c, defaultBuilderFilters)).toBe(false);
    c.analysis!.mvpDays = 7; c.analysis!.difficulty = "hard";
    expect(matchesBuilder(c, defaultBuilderFilters)).toBe(false);
    expect(matchesBuilder(c, { ...defaultBuilderFilters, scope: "all" })).toBe(true);
  });
  it("does not manufacture a customer segment for unknown analyses", () => {
    const c = card(); delete c.analysis;
    expect(builderProfile(c).buyer).toBe("unknown");
    expect(matchesBuilder(c, defaultBuilderFilters)).toBe(false);
    expect(matchesBuilder(c, { ...defaultBuilderFilters, scope: "all", buyer: "unknown" })).toBe(true);
  });
  it("never treats popularity or AI pricing text as customer proof", () => {
    const c = card(); c.momentum = 100; c.analysis!.summary = "Paid product with customers";
    expect(commercialEvidence(c)).toBe("unknown");
    c.review = { productId: c.id, evidence: [{ kind: "pricing", claim: "Pricing page", url: "https://example.com", checkedAt: c.firstSeen, level: "reviewed" }], scores: { commercial: null, turkeyDemand: null, distribution: null, feasibility: null, differentiation: null }, note: "" };
    expect(commercialEvidence(c)).toBe("pricing");
    expect(matchesBuilder(c, { ...defaultBuilderFilters, evidence: "reviewed" })).toBe(false);
  });
  it("ranks a feasible customer-facing candidate above a popular SDK", () => {
    const product = card(); const tool = card(); tool.title = "Agent SDK"; tool.momentum = 100;
    expect(compareForBuilder(product, tool)).toBeLessThan(0);
  });
});
