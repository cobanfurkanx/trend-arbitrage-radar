import { config } from "dotenv";
import { mkdir, open, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import { hackerNewsProvider } from "../sources/hackernews";
import { githubProvider } from "../sources/github";
import { redditProvider } from "../sources/reddit";
import { productHuntProvider } from "../sources/producthunt";
import { BIG_ORGS } from "../sources/blocklist";
import { cardsFrom, ingestSignals } from "./engine";
import { atomicJson, readJson } from "./storage";
import { analyze, freeModel, reserveRequest } from "./ai";
import { emptyState, reviewSchema, type Snapshot } from "./schema";
import { isProductCandidate } from "./eligibility";
import { compareForBuilder, resourceKind, selectPublicCards } from "./builder";
import { trustDiscovery, trustMarketplace } from "./trustmrr";
import { sourceFailure } from "./sources";

config({ path: ".env.local", quiet: true });
config({ quiet: true });
// Separate from legacy provider settings: this command cannot use a paid model.
const stateDir = resolve(process.env.RADAR_STATE_DIR ?? ".radar");
const statePath = resolve(stateDir, "state.json");
const snapshotPath = resolve("free/public/data/radar.json");
const int = (value: string | undefined, fallback: number, max: number) => {
  const n = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(n) || n < 0 || n > max) throw new Error(`Invalid quota: expected 0..${max}`);
  return n;
};

async function main() {
  await mkdir(stateDir, { recursive: true });
  const lockPath = resolve(stateDir, "run.lock");
  // No automatic stale-lock deletion: an active run must never lose its lock.
  const lock = await open(lockPath, "wx");
  try {
    await lock.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
    const state = await readJson(statePath, emptyState());
    if (state.version !== 1) throw new Error("Unsupported state version");
    const reviews = z.array(reviewSchema).parse(await readJson("data/reviews.json", []));
    if (new Set(reviews.map((r) => r.productId)).size !== reviews.length) throw new Error("Duplicate product review");
    const model = freeModel(process.env.RADAR_MODEL ?? "openrouter/free");
    const daily = int(process.env.RADAR_DAILY_AI_LIMIT, 40, 40);
    const perRun = int(process.argv.find((s) => s.startsWith("--ai-limit="))?.split("=")[1] ?? process.env.RADAR_AI_PER_RUN, 5, 15);
    const now = new Date();
    const previous = await readJson<Snapshot>(snapshotPath, { version: 1, generatedAt: now.toISOString(), lastSuccessfulCollection: null, sources: [], cards: [] });
    const sources: Snapshot["sources"] = [];
    if (!process.argv.includes("--export-only")) {
      const providers = [
        { provider: hackerNewsProvider, enabled: true },
        { provider: githubProvider, enabled: true },
        { provider: trustDiscovery, enabled: true },
        { provider: trustMarketplace, enabled: true },
        { provider: redditProvider, enabled: process.env.RADAR_REDDIT_APPROVED === "true", reason: "Kullanım izni onayı yapılandırılmadı." },
        { provider: productHuntProvider, enabled: process.env.RADAR_PH_APPROVED === "true" && !!process.env.PRODUCT_HUNT_TOKEN, reason: !process.env.PRODUCT_HUNT_TOKEN ? "Product Hunt tokenı eksik." : "Token mevcut; kullanım izni onayı yapılandırılmadı." },
      ];
      const collected = await Promise.all(providers.map(async ({ provider, enabled, reason }) => {
        if (!enabled) { sources.push({ name: provider.name, status: "disabled", count: 0, reason }); return []; }
        try {
          const items = (await provider.fetchItems()).filter((s) => {
            const owner = (s.author ?? "").toLowerCase().replace(/^u\//, "");
            if (BIG_ORGS.includes(owner)) return false;
            const age = now.getTime() - s.publishedAt.getTime();
            if (age > 60 * 86400000) return false;
            // Tutorials and datasets are build resources, not products to localize.
            return isProductCandidate(s.source, s.title, s.description);
          });
          sources.push({ name: provider.name, status: "ok", count: items.length });
          return items;
        } catch (error) {
          sources.push({ name: provider.name, status: "failed", count: 0, reason: sourceFailure(error) });
          return [];
        }
      }));
      ingestSignals(state, collected.flat(), now);
    } else sources.push(...previous.sources);
    await atomicJson(statePath, state);
    const key = process.env.OPENROUTER_API_KEY;
    let attempts = 0;
    let completed = 0;
    if (key && !process.argv.includes("--export-only") && !process.argv.includes("--no-ai")) {
      const candidates = cardsFrom(state, reviews, now).filter((c) => resourceKind(c) === "product" && (c.analyzedFingerprint !== c.fingerprint || !c.analysis?.builder) && now.getTime() - Date.parse(c.lastSeen) < 86400000 && (c.analysisStatus !== "failed" || !c.lastAttemptAt || now.getTime() - Date.parse(c.lastAttemptAt) >= 6 * 3600000)).sort(compareForBuilder);
      for (const card of candidates) {
        if (attempts >= perRun) break;
        if (!await reserveRequest(state, new Date(), () => atomicJson(statePath, state), daily)) break;
        attempts++;
        const product = state.products[card.id];
        product.lastAttemptAt = new Date().toISOString();
        try {
          product.analysis = await analyze(card, key, model);
          product.analysisStatus = "ready";
          product.analyzedAt = new Date().toISOString();
          product.analyzedFingerprint = product.fingerprint;
          completed++;
        } catch (error) {
          // Preserve an existing analysis; never replace it with fabricated output.
          product.analysisStatus = "failed";
          const message = error instanceof Error ? error.message : "AI_FAILED";
          const reason = /AI_HTTP_\d+|AI_UNSUPPORTED_CLAIMS/.exec(message)?.[0] ?? (error instanceof z.ZodError ? "INVALID_SCHEMA" : error instanceof SyntaxError ? "INVALID_JSON" : "TIMEOUT_OR_NETWORK");
          console.warn(`[radar] ${card.id}: ${reason}; analysis deferred`);
          if (error instanceof z.ZodError) console.warn(error.issues.map((i) => `${i.path.join(".")}: ${i.code}`).join(", "));
          if (/AI_HTTP_(401|402|403|429)/.test(message)) {
            await atomicJson(statePath, state);
            break;
          }
        }
        await atomicJson(statePath, state);
        if (attempts < perRun) await new Promise((r) => setTimeout(r, 3200));
      }
    }
    const snapshot: Snapshot = {
      version: 1, generatedAt: now.toISOString(),
      lastSuccessfulCollection: !process.argv.includes("--export-only") && sources.some((s) => s.status === "ok" && s.count > 0) ? now.toISOString() : previous.lastSuccessfulCollection,
      sources: sources.sort((a, b) => a.name.localeCompare(b.name)),
      cards: selectPublicCards(cardsFrom(state, reviews, now)),
    };
    await atomicJson(snapshotPath, snapshot);
    console.log(JSON.stringify({ cards: snapshot.cards.length, analyzed: completed, aiAttempts: attempts, sources: snapshot.sources, snapshot: snapshotPath }));
    if (!process.argv.includes("--export-only") && !sources.some((s) => s.status === "ok")) process.exitCode = 1;
  } finally { await lock.close(); await unlink(lockPath); }
}
main().catch((err) => {
  console.error((err as NodeJS.ErrnoException).code === "EEXIST" ? "Radar already running. Inspect .radar/run.lock before removing an abandoned lock." : (err as Error).message);
  process.exitCode = 1;
});
