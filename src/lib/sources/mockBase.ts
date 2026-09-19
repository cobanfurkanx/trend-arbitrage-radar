import type { Category, SourceName } from "../types";
import type { DemoSignal, DemoTrend } from "./demoCatalog";
import { DEMO_TRENDS } from "./demoCatalog";
import type { RawSignalInput, TrendSource } from "./types";




function toRawSignal(trend: DemoTrend, s: DemoSignal): RawSignalInput {
  const publishedAt = new Date(Date.now() - s.daysAgo * 24 * 60 * 60 * 1000);
  return {
    source: s.source,
    sourceUrl: s.url,
    title: s.title,
    description: s.snippet,
    author: s.author,
    publishedAt,
    category: trend.category,
    engagement: s.engagement,
    keywords: s.keywords,
    confidenceScore: 0.6 + Math.min(0.35, s.engagement / 1000),
    rawData: { trendKey: trend.key, snippet: s.snippet, earlySignal: trend.earlySignal },
  };
}

export function makeMockProvider(source: SourceName): TrendSource {
  return {
    name: source,
    async fetchItems(): Promise<RawSignalInput[]> {
      const items: RawSignalInput[] = [];
      for (const trend of DEMO_TRENDS) {
        for (const s of trend.signals) {
          if (s.source === source) items.push(toRawSignal(trend, s));
        }
      }
      return items;
    },
    normalizeItem(item: RawSignalInput): RawSignalInput {
      
      
      
      return {
        ...item,
        category: (item.category ?? "Other") as Category,
        engagement: item.engagement ?? 0,
        keywords: item.keywords ?? [],
        confidenceScore: item.confidenceScore ?? 0.5,
      };
    },
  };
}
