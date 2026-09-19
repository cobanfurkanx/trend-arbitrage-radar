import { afterEach, describe, expect, it, vi } from "vitest";
import { parseTrustMRR, enrichTrustMRR } from "./trustmrr";
import { cardsFrom, identity, ingestSignals } from "./engine";
import { emptyState } from "./schema";
import { businessAge, compareRevenue, matchesRevenue, revenueFresh, revenueOf } from "./revenue";
import { commercialEvidence } from "./builder";
import { sourceFailure } from "./sources";

const now = new Date("2026-09-18T10:00:00Z");
const row = { name: "Invoices", slug: "invoices", description: "Invoice reminders and reports for small agencies", website: "https://invoices.example", paymentProvider: "stripe", revenue: { last30Days: 500, mrr: 120, total: 1900 }, growth30d: 15, foundedDate: "2026-08-01T00:00:00Z", profitMarginLast30Days: 70 };
function signals(rows = [row]) { return parseTrustMRR({ recent: rows, growth: [] }, ["recent", "growth"], now); }
function card() { const state = emptyState(); ingestSignals(state, signals(), now); return cardsFrom(state, [], now)[0]; }
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("revenue sources", () => {
  it("preserves dollars, MRR, source dates and reported margins as distinct metrics", () => {
    const s = signals()[0];
    expect(s.revenue).toMatchObject({ last30DaysUsd: 500, mrrUsd: 120, profitMarginReported: 70, observedAt: now.toISOString(), syncedAt: null });
    expect(s.publishedAt).toEqual(now);
    expect(businessAge(s.revenue!, now.getTime())).toBe(48);
  });
  it("drops anonymous, empty, zero-revenue and malformed listings, and deduplicates", () => {
    const result = parseTrustMRR({ recent: [row, row, { ...row, slug: "hidden", stealthMode: true }, { ...row, slug: "empty", description: "" }, { ...row, slug: "no-money", revenue: { total: 100000, last30Days: 0 } }, { ...row, slug: "bad", website: "javascript:alert(1)" }], growth: [row] }, ["recent", "growth"], now);
    expect(result).toHaveLength(1);
    expect(() => parseTrustMRR({}, ["recent"], now)).toThrow("INVALID_RESPONSE");
  });
  it("never merges unrelated app store or TrustMRR entries", () => {
    const s = signals()[0];
    expect(identity({ ...s, rawData: { productUrl: "https://apps.apple.com/app/id1" } }).productId).not.toBe(identity({ ...s, rawData: { productUrl: "https://apps.apple.com/app/id2" } }).productId);
    expect(identity({ ...s, rawData: {} }).productId).not.toBe(identity({ ...s, sourceUrl: "https://trustmrr.com/startup/other", rawData: {} }).productId);
  });
  it("keeps evidence through ingestion without manufacturing Turkey validation", () => {
    vi.useFakeTimers(); vi.setSystemTime(now);
    const c = card();
    expect(revenueOf(c)?.mrrUsd).toBe(120);
    expect(commercialEvidence(c)).toBe("provider");
    expect(c.stage).toBe("radar"); expect(c.opportunityScore).toBeNull();
  });
  it("filters unknown ages and margins conservatively and expires old observations", () => {
    const c = card();
    expect(matchesRevenue(c, "young", now.getTime())).toBe(true);
    c.signals[0].revenue!.foundedAt = null;
    expect(matchesRevenue(c, "young", now.getTime())).toBe(false);
    c.signals[0].revenue!.profitMarginReported = null;
    expect(matchesRevenue(c, "margin", now.getTime())).toBe(false);
    expect(matchesRevenue(c, "all", now.getTime() + 8 * 86400000)).toBe(false);
    c.signals[0].revenue!.syncedAt = "2026-01-01T00:00:00Z";
    expect(revenueFresh(c.signals[0].revenue!, now.getTime())).toBe(false);
  });
  it("does not favor a tiny base with enormous growth over meaningful revenue", () => {
    vi.useFakeTimers(); vi.setSystemTime(now);
    const tiny = card(); tiny.signals[0].revenue!.last30DaysUsd = 1; tiny.signals[0].revenue!.growth30d = 100000;
    expect(compareRevenue(card(), tiny)).toBeLessThan(0);
  });
  it("keeps usable summaries when optional rich context fails", async () => {
    const s = signals()[0];
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    expect(await enrichTrustMRR(s)).toEqual(s);
  });
  it("enriches only the official profile and retains provider sync provenance", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response("# Invoices\n## Verification Sources\n- Revenue last synced: 2026-09-17T10:00:00Z\n- Founded date: 2026-08-01\n- Description: Invoice collection and reminders for small agency owners\n## Startup Insights\n- Problem: late invoices\n## Revenue\n"));
    vi.stubGlobal("fetch", fetch);
    const enriched = await enrichTrustMRR(signals()[0]);
    expect(fetch.mock.calls[0][0]).toBe("https://trustmrr.com/startup/invoices.md");
    expect(enriched.description).toContain("late invoices");
    expect(enriched.revenue!.syncedAt).toBe("2026-09-17T10:00:00.000Z");
  });
  it("publishes only fixed safe diagnostics, never remote error text or credentials", () => {
    expect(sourceFailure(new Error("HTTP 401 secret-token"))).not.toContain("secret-token");
    expect(sourceFailure(new Error("PH_GRAPHQL_ERROR"))).toContain("GraphQL");
  });
});
