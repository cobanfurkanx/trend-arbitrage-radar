import type { TrendSource } from "./types";
import { fetchJson, inferCategory, keywordsFromText } from "./fetch";

interface HNHit {
  objectID: string;
  title: string | null;
  url: string | null;
  points: number | null;
  author: string | null;
  created_at_i: number;
  story_text: string | null;
}

interface HNResponse {
  hits: HNHit[];
}


function hnLive(): Promise<import("./types").RawSignalInput[]> {
  const since = Math.floor(Date.now() / 1000 - 14 * 24 * 60 * 60);
  const queries = [""];
  return Promise.all(
    queries.map((q) =>
      fetchJson<HNResponse>(
        `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(q)}&tags=show_hn&numericFilters=created_at_i>${since}&hitsPerPage=50`
      )
    )
  ).then((resps) => {
    const seen = new Set<string>();
    const items: import("./types").RawSignalInput[] = [];
    for (const r of resps) {
      for (const h of r.hits) {
        if (!h.title || seen.has(h.objectID)) continue;
        seen.add(h.objectID);
        const title = h.title;
        items.push({
          source: "hackernews",
          sourceUrl: `https://news.ycombinator.com/item?id=${h.objectID}`,
          title,
          description: h.story_text ? h.story_text.slice(0, 2000) : "",
          author: h.author ?? undefined,
          publishedAt: new Date(h.created_at_i * 1000),
          category: inferCategory(title),
          engagement: h.points ?? 0,
          keywords: keywordsFromText(title),
          confidenceScore: 0.7,
          rawData: { productUrl: h.url, snippet: h.story_text?.slice(0, 160) ?? "", earlySignal: "Emerging" },
        });
      }
    }
    return items;
  });
}

export const hackerNewsProvider: TrendSource = {
  name: "hackernews",
  fetchItems: hnLive,
  normalizeItem: (i) => i,
};
