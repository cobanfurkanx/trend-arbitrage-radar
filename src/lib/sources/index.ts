import type { SourceName } from "../types";
import type { RawSignalInput, TrendSource } from "./types";
import { isBlockedSignal } from "./blocklist";
import { redditProvider } from "./reddit";
import { hackerNewsProvider } from "./hackernews";
import { productHuntProvider } from "./producthunt";
import { githubProvider } from "./github";
import { googleTrendsProvider } from "./googletrends";
import { xProvider } from "./x";



export const SOURCES: Record<SourceName, TrendSource> = {
  reddit: redditProvider,
  hackernews: hackerNewsProvider,
  producthunt: productHuntProvider,
  github: githubProvider,
  googletrends: googleTrendsProvider,
  x: xProvider,
};

export const SOURCE_LIST: TrendSource[] = Object.values(SOURCES);

export interface SourceStatus {
  source: SourceName;
  name: string;
  ok: boolean;
  count: number;
  filtered?: number;
  error?: string;
  lastFetchedAt: string;
}






export async function collectSignals(): Promise<{
  signals: RawSignalInput[];
  statuses: SourceStatus[];
}> {
  const signals: RawSignalInput[] = [];
  const statuses: SourceStatus[] = [];
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function attempt(provider: TrendSource): Promise<{ items: RawSignalInput[]; error?: string }> {
    for (let trial = 0; trial < 2; trial++) {
      try {
        const raw = await provider.fetchItems();
        return { items: raw.map((r) => provider.normalizeItem(r)) };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown error";
        if (trial === 0) {
          console.warn(`[source:${provider.name}] attempt 1 failed (${msg}), retrying…`);
          await sleep(1500);
          continue;
        }
        return { items: [], error: msg };
      }
    }
    return { items: [], error: "unknown error" };
  }

  await Promise.all(
    SOURCE_LIST.map(async (provider, i) => {
      const base: SourceStatus = {
        source: provider.name,
        name: provider.name,
        ok: false,
        count: 0,
        lastFetchedAt: new Date().toISOString(),
      };
      await sleep(i * 400);
      const { items, error } = await attempt(provider);
      if (error) {
        statuses.push({ ...base, error });
      } else {
        const kept: RawSignalInput[] = [];
        let filtered = 0;
        for (const item of items) {
          if (isBlockedSignal(item).blocked) filtered++;
          else kept.push(item);
        }
        signals.push(...kept);
        statuses.push({ ...base, ok: true, count: kept.length, filtered });
      }
    })
  );

  return { signals, statuses };
}
