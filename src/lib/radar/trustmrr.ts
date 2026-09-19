import { z } from "zod";
import { fetchJson, inferCategory } from "../sources/fetch";
import type { RadarInput } from "./sources";
import { webUrl } from "./schema";
import { isProductCandidate } from "./eligibility";

const amount = z.number().finite().nonnegative().nullish();
const startupSchema = z.object({
  name: z.string().min(1), slug: z.string().regex(/^[a-z0-9_-]+$/i),
  description: z.string().nullable(), website: webUrl.nullable(),
  stealthMode: z.boolean().optional(), paymentProvider: z.string().min(1),
  category: z.string().nullish(), foundedDate: z.string().datetime().nullish(),
  revenue: z.object({ last30Days: amount, mrr: amount, total: amount }),
  growth30d: z.number().finite().nullish(), profitMarginLast30Days: z.number().min(-100).max(100).nullish(),
});

export function parseTrustMRR(body: unknown, groups: string[], now: Date): RadarInput[] {
  if (!body || typeof body !== "object" || groups.some((key) => !Array.isArray((body as Record<string, unknown>)[key]))) throw new Error("TRUSTMRR_INVALID_RESPONSE");
  const seen = new Set<string>();
  const results: RadarInput[] = [];
  const rows = groups.flatMap((key) => (body as Record<string, unknown[]>)[key]);
  let validRows = 0;
  for (const value of rows) {
    const parsed = startupSchema.safeParse(value);
    if (!parsed.success) continue;
    validRows++;
    const s = parsed.data;
    // No anonymous, empty, zero-revenue listings or asking-price-as-revenue claims.
    if (seen.has(s.slug) || s.stealthMode || !s.website || !s.description || s.description.length < 30 || !(s.revenue.last30Days && s.revenue.last30Days > 0)) continue;
    if (!isProductCandidate("trustmrr", s.name, s.description)) continue;
    seen.add(s.slug);
    const url = `https://trustmrr.com/startup/${s.slug}`;
    results.push({
      source: "trustmrr", sourceUrl: url, title: s.name, description: s.description,
      // This is observation time, not a launch or first-sale date.
      publishedAt: now, engagement: 0, category: inferCategory(`${s.category ?? ""} ${s.description}`),
      rawData: { productUrl: s.website },
      revenue: {
        last30DaysUsd: s.revenue.last30Days ?? null, mrrUsd: s.revenue.mrr ?? null, totalUsd: s.revenue.total ?? null,
        growth30d: s.growth30d ?? null, profitMarginReported: s.profitMarginLast30Days ?? null,
        foundedAt: s.foundedDate && Date.parse(s.foundedDate) <= now.getTime() ? s.foundedDate : null,
        observedAt: now.toISOString(), syncedAt: null, paymentProvider: s.paymentProvider, sourceUrl: url,
      },
    });
  }
  if (rows.length && !validRows) throw new Error("TRUSTMRR_INVALID_RESPONSE");
  return results;
}

export async function enrichTrustMRR(item: RadarInput): Promise<RadarInput> {
  try {
    // Only official, bounded public Markdown profiles; never arbitrary product URLs.
    const r = await fetch(`${item.sourceUrl}.md`, { signal: AbortSignal.timeout(7000), headers: { Accept: "text/plain" } });
    if (!r.ok) return item;
    const md = await r.text();
    if (md.length > 250000 || !md.includes("## Verification Sources")) return item;
    const founded = /^- Founded date: (\d{4}-\d{2}-\d{2})\s*$/m.exec(md)?.[1];
    const synced = /^- Revenue last synced: (\S+)/m.exec(md)?.[1];
    const description = /^- Description: (.+)$/m.exec(md)?.[1];
    const insights = /## Startup Insights\s+([\s\S]*?)(?=\n## |$)/.exec(md)?.[1];
    return { ...item, description: [description ?? item.description, insights?.slice(0, 700)].filter(Boolean).join("\n").slice(0, 1500), revenue: {
      ...item.revenue!,
      foundedAt: founded && Number.isFinite(Date.parse(founded)) && Date.parse(founded) <= Date.now() ? `${founded}T00:00:00.000Z` : item.revenue!.foundedAt,
      syncedAt: synced && Number.isFinite(Date.parse(synced)) && Date.parse(synced) <= Date.now() ? new Date(synced).toISOString() : null,
    } };
  } catch { return item; } // Summary remains usable if optional context is unavailable.
}

function provider(name: string, endpoint: string, groups: string[]) {
  return { name, fetchItems: async (): Promise<RadarInput[]> => {
    const items = parseTrustMRR(await fetchJson(endpoint, { timeoutMs: 15000 }), groups, new Date());
    // Eight rich profiles per endpoint, four at a time; no crawling or pagination.
    const priorities = items.filter((s) => s.revenue!.last30DaysUsd! >= 100)
      .sort((a, b) => Number((b.revenue!.growth30d ?? 0) > 0) - Number((a.revenue!.growth30d ?? 0) > 0)).slice(0, 8);
    const enriched = new Map<string, RadarInput>();
    for (let i = 0; i < priorities.length; i += 4) {
      for (const item of await Promise.all(priorities.slice(i, i + 4).map(enrichTrustMRR))) enriched.set(item.sourceUrl, item);
    }
    return items.map((s) => enriched.get(s.sourceUrl) ?? s);
  } };
}

export const trustDiscovery = provider("trustmrr-discovery", "https://trustmrr.com/api/ai/discovery", ["recentlyAddedStartups", "fastestGrowingStartups"]);
export const trustMarketplace = provider("trustmrr-marketplace", "https://trustmrr.com/api/ai", ["recentlyListedStartups", "bestDeals"]);
