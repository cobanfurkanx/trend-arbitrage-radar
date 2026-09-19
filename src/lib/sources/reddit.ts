import type { TrendSource } from "./types";
import { fetchJson, inferCategory, keywordsFromText } from "./fetch";

interface RedditChild {
  data: {
    title: string;
    permalink: string;
    url: string;
    score: number;
    author: string;
    created_utc: number;
    selftext: string;
    subreddit: string;
  };
}
interface RedditResponse {
  data: { children: RedditChild[] };
}



async function redditLive(): Promise<import("./types").RawSignalInput[]> {
  const subs = ["SideProject", "SaaS", "startups", "artificial", "webdev"];
  const terms = ["ai", "saas", "tool", "launch"];
  const calls = subs.flatMap((sub) =>
    terms.map((t) =>
      fetchJson<RedditResponse>(
        `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(t)}&restrict_sr=1&sort=new&limit=8&t=month`
      )
    )
  );
  const results = await Promise.allSettled(calls);
  if (results.every((result) => result.status === "rejected")) {
    const firstFailure = results.find((result) => result.status === "rejected");
    throw firstFailure?.reason instanceof Error
      ? firstFailure.reason
      : new Error("All Reddit searches failed");
  }

  const seen = new Set<string>();
  const items: import("./types").RawSignalInput[] = [];
  for (const res of results) {
    if (res.status !== "fulfilled") continue;
    for (const c of res.value.data?.children ?? []) {
      const d = c.data;
      const key = d.permalink;
      if (seen.has(key)) continue;
      seen.add(key);
      const title = d.title;
      items.push({
        source: "reddit",
        sourceUrl: `https://www.reddit.com${d.permalink}`,
        title,
        description: d.selftext?.slice(0, 2000) ?? "",
        author: `u/${d.author}`,
        publishedAt: new Date(d.created_utc * 1000),
        category: inferCategory(`${title} ${d.selftext ?? ""}`),
        engagement: d.score,
        keywords: keywordsFromText(title),
        confidenceScore: 0.6,
        rawData: { productUrl: d.url, snippet: d.selftext?.slice(0, 160) ?? "", earlySignal: "Emerging" },
      });
    }
  }
  return items;
}

export const redditProvider: TrendSource = {
  name: "reddit",
  fetchItems: redditLive,
  normalizeItem: (i) => i,
};
