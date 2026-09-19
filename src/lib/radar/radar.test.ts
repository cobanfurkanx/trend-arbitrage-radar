import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cardsFrom, identity, ingestSignals, velocity } from "./engine";
import { emptyState, reviewSchema, type Review } from "./schema";
import { analyze, freeModel, reserveRequest } from "./ai";
import { atomicJson, readJson } from "./storage";
import { buildPrompt, economics, notebookSchema } from "./client";
import { isProductCandidate } from "./eligibility";
import type { RawSignalInput } from "../sources/types";

const now = new Date("2026-09-11T09:00:00Z");
const raw = (over: Partial<RawSignalInput> = {}): RawSignalInput => ({ source: "hackernews", sourceUrl: "https://news.ycombinator.com/item?id=1", title: "Show HN: tiny invoice tool", description: "Invoice reminders", publishedAt: now, engagement: 10, ...over });
afterEach(() => vi.unstubAllGlobals());

describe("free radar state pipeline", () => {
  it("keeps news and project collections out of product recommendations", () => {
    expect(isProductCandidate("hackernews", "AI news about a war")).toBe(false);
    expect(isProductCandidate("hackernews", "Show HN: Invoice tracker")).toBe(true);
    expect(isProductCandidate("github", "someone/astra-projects")).toBe(false);
    expect(isProductCandidate("github", "someone/invoices", "Invoice app using Claude")).toBe(true);
  });
  it("keeps two posts from the same source in one product without overwriting either", () => {
    const state = emptyState();
    ingestSignals(state, [raw({ rawData: { productUrl: "https://tiny.example/?utm_source=hn" } }), raw({ sourceUrl: "https://news.ycombinator.com/item?id=2", rawData: { productUrl: "https://tiny.example/pricing" } })], now);
    expect(Object.values(state.products)).toHaveLength(1);
    expect(Object.values(state.signals)).toHaveLength(2);
    expect(cardsFrom(state, [], now)[0].signals).toHaveLength(2);
  });
  it("does not cluster unrelated posts from the same host", () => {
    const state = emptyState();
    ingestSignals(state, [raw(), raw({ sourceUrl: "https://news.ycombinator.com/item?id=2", title: "Other AI tool" })], now);
    expect(Object.values(state.products)).toHaveLength(2);
  });
  it("moves a source to its discovered product without duplicate membership", () => {
    const state = emptyState(); ingestSignals(state, [raw()], now);
    ingestSignals(state, [raw({ rawData: { productUrl: "https://tiny.example" } })], new Date(now.getTime() + 3600000));
    expect(Object.values(state.products)).toHaveLength(1);
    expect(Object.values(state.products)[0].firstSeen).toBe(now.toISOString());
  });
  it("has stable identities across tracking parameters and collection order", () => {
    expect(identity(raw({ sourceUrl: "https://news.ycombinator.com/item?utm_source=x&id=1" })).signalId).toBe(identity(raw()).signalId);
    const a = raw({ rawData: { productUrl: "https://tiny.example" } });
    const b = raw({ source: "github", sourceUrl: "https://github.com/test/tiny", rawData: { productUrl: "https://tiny.example" } });
    const first = emptyState(); const second = emptyState();
    ingestSignals(first, [a, b], now); ingestSignals(second, [b, a], now);
    expect(Object.keys(first.products)).toEqual(Object.keys(second.products));
    expect(Object.values(first.products)[0].fingerprint).toBe(Object.values(second.products)[0].fingerprint);
  });
  it("engagement updates do not invalidate AI but actual text changes do", () => {
    const state = emptyState(); ingestSignals(state, [raw()], now);
    const before = Object.values(state.products)[0].fingerprint;
    ingestSignals(state, [raw({ engagement: 30 })], new Date(now.getTime() + 3600000));
    expect(Object.values(state.products)[0].fingerprint).toBe(before);
    expect(velocity(Object.values(state.signals)[0])).toBe(20);
    ingestSignals(state, [raw({ description: "Now includes a customer claim" })], new Date(now.getTime() + 7200000));
    expect(Object.values(state.products)[0].fingerprint).not.toBe(before);
  });
  it("reports unknown velocity without a timed observation; preserves negative changes", () => {
    const state = emptyState(); ingestSignals(state, [raw()], now);
    expect(velocity(Object.values(state.signals)[0])).toBeNull();
    ingestSignals(state, [raw({ engagement: 5 })], new Date(now.getTime() + 3600000));
    expect(velocity(Object.values(state.signals)[0])).toBe(-5);
  });
  it("never invents Turkey fit or commercial confidence from engagement", () => {
    const state = emptyState(); ingestSignals(state, [raw({ engagement: 99999 })], now);
    const card = cardsFrom(state, [], now)[0];
    expect(card.stage).toBe("radar"); expect(card.opportunityScore).toBeNull(); expect(card.confidence).toBe("low");
  });
  it("requires fresh reviewed commercial and Turkey evidence, not pricing or self reports", () => {
    const state = emptyState(); ingestSignals(state, [raw()], now);
    const productId = Object.keys(state.products)[0];
    const review: Review = { productId, evidence: [], scores: { commercial: 80, turkeyDemand: 70, distribution: 60, feasibility: 80, differentiation: 50 }, note: "Reviewed sources" };
    review.evidence = ["paying_customers", "turkey_demand"].map((kind) => ({ kind: kind as "paying_customers" | "turkey_demand", claim: "Specific reviewed evidence", url: "https://example.com/evidence", checkedAt: now.toISOString(), level: "self_reported" }));
    expect(cardsFrom(state, [review], now)[0].stage).toBe("radar");
    review.evidence.forEach((e) => e.level = "reviewed");
    expect(cardsFrom(state, [review], now)[0].stage).toBe("validated");
    expect(cardsFrom(state, [review], now)[0].opportunityScore).toBeNull();
    review.evidence[0].checkedAt = "2026-01-01T00:00:00Z";
    expect(cardsFrom(state, [review], now)[0].stage).toBe("radar");
    review.evidence[0].checkedAt = "2027-01-01T00:00:00Z";
    expect(cardsFrom(state, [review], now)[0].stage).toBe("radar");
  });
  it("rejects unsafe evidence URLs and invalid review structures", () => {
    expect(reviewSchema.safeParse({ productId: "p_test", evidence: [{ url: "javascript:alert(1)" }] }).success).toBe(false);
    expect(() => identity(raw({ sourceUrl: "javascript:alert(1)" }))).toThrow();
  });
});

describe("zero spend enforcement", () => {
  it("blocks paid models", () => {
    expect(freeModel("openrouter/free")).toBe("openrouter/free");
    expect(freeModel("vendor/model:free")).toBe("vendor/model:free");
    expect(() => freeModel("vendor/paid")).toThrow();
  });
  it("persists reservation across restarts, caps even an excessive configured limit, resets at UTC midnight", async () => {
    const dir = await mkdtemp(join(tmpdir(), "radar-test-"));
    try {
      const path = join(dir, "state.json");
      const first = emptyState(); first.usage["2026-09-11"] = 39;
      expect(await reserveRequest(first, now, () => atomicJson(path, first), 999)).toBe(true);
      const restarted = await readJson(path, emptyState());
      expect(await reserveRequest(restarted, now, () => atomicJson(path, restarted), 999)).toBe(false);
      expect(await reserveRequest(restarted, new Date("2026-09-12T00:00:00Z"), () => atomicJson(path, restarted))).toBe(true);
    } finally { await rm(dir, { recursive: true, force: true }); }
  });
  it("does not silently reset a corrupt quota file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "radar-test-"));
    try {
      const { writeFile } = await import("node:fs/promises");
      const path = join(dir, "state.json"); await writeFile(path, "broken");
      await expect(readJson(path, emptyState())).rejects.toThrow();
    } finally { await rm(dir, { recursive: true, force: true }); }
  });
  it("respects a zero quota without saving or calling providers", async () => {
    const save = vi.fn(); expect(await reserveRequest(emptyState(), now, save, 0)).toBe(false); expect(save).not.toHaveBeenCalled();
  });
  it("never converts a rate-limit error into mock analysis", async () => {
    const state = emptyState(); ingestSignals(state, [raw()], now);
    const fetchMock = vi.fn().mockResolvedValue(new Response("limited", { status: 429 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(analyze(cardsFrom(state, [], now)[0], "test-key", "openrouter/free")).rejects.toThrow("AI_HTTP_429");
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.provider.max_price).toEqual({ prompt: 0, completion: 0 });
  });
});

describe("personal validation tools", () => {
  it("restores safe notes but rejects unknown statuses and oversized notes", () => {
    expect(notebookSchema.parse({ p1: { status: "paid", note: "First customer" } }).p1.status).toBe("paid");
    expect(notebookSchema.safeParse({ p1: { status: "invented", note: "" } }).success).toBe(false);
    expect(notebookSchema.safeParse({ p1: { status: "watching", note: "x".repeat(4001) } }).success).toBe(false);
  });
  it("does not offer a made-up build prompt for an unanalyzed signal", () => {
    const state = emptyState(); ingestSignals(state, [raw()], now);
    expect(buildPrompt(cardsFrom(state, [], now)[0])).toBe("");
  });
  it("handles negative margins and rounds break-even up", () => {
    expect(economics(20, 30, 100).customers).toBeNull();
    expect(economics(100, 20, 100).customers).toBe(2);
    expect(economics(100, 20, 0).customers).toBe(0);
  });
});
