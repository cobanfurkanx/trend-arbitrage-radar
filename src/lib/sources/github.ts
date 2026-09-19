import type { TrendSource } from "./types";
import { fetchJson, inferCategory, keywordsFromText } from "./fetch";

interface GHRepo {
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  owner: { login: string };
  created_at: string;
  topics?: string[];
  homepage?: string | null;
}

interface GHResponse {
  items: GHRepo[];
}



function ghLive(): Promise<import("./types").RawSignalInput[]> {
  const since = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const queries = ["ai", "saas", "developer tool", "chrome extension"];
  const guard = "+stars:<10000+-user:facebook+-user:google+-user:microsoft+-user:openai+-user:apple+-user:amazon+-user:anthropic";
  return Promise.all(
    queries.map((q) =>
      fetchJson<GHResponse>(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}+created:>${since}${guard}&sort=stars&order=desc&per_page=10`,
        { headers }
      )
    )
  ).then((resps) => {
    const seen = new Set<string>();
    const items: import("./types").RawSignalInput[] = [];
    for (const r of resps) {
      for (const repo of r.items ?? []) {
        if (seen.has(repo.full_name)) continue;
        seen.add(repo.full_name);
        const title = repo.full_name;
        items.push({
          source: "github",
          sourceUrl: repo.html_url,
          title,
          description: repo.description ?? "",
          author: repo.owner.login,
          publishedAt: new Date(repo.created_at),
          category: inferCategory(`${title} ${repo.description ?? ""}`),
          engagement: repo.stargazers_count,
          keywords: Array.from(new Set([...(repo.topics ?? []), ...keywordsFromText(title)])),
          confidenceScore: 0.75,
          rawData: { productUrl: repo.homepage ?? null, snippet: repo.description ?? "", earlySignal: "VeryEarly" },
        });
      }
    }
    return items;
  });
}

export const githubProvider: TrendSource = {
  name: "github",
  fetchItems: ghLive,
  normalizeItem: (i) => i,
};
