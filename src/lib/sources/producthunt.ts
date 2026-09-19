import type { TrendSource } from "./types";
import { fetchJson, inferCategory, isDemoEnabled, keywordsFromText } from "./fetch";
import { makeMockProvider } from "./mockBase";

interface PHNode {
  name: string;
  tagline: string | null;
  description?: string | null;
  website?: string | null;
  url: string;
  votesCount: number;
  createdAt: string;
}
interface PHResponse {
  errors?: unknown[];
  data?: { posts?: { edges: { node: PHNode }[] } };
}


function phLive(): Promise<import("./types").RawSignalInput[]> {
  const token = process.env.PRODUCT_HUNT_TOKEN;
  if (!token) throw new Error("PRODUCT_HUNT_TOKEN not set");
  const postedAfter = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const query = `query { posts(order: NEWEST, first: 20, postedAfter: "${postedAfter}") { edges { node { name tagline description website url votesCount createdAt } } } }`;
  return fetchJson<PHResponse>("https://api.producthunt.com/v2/api/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query }),
  }).then((json) => {
    if (json.errors?.length) throw new Error("PH_GRAPHQL_ERROR");
    const edges = json.data?.posts?.edges;
    if (!Array.isArray(edges)) throw new Error("PH_INVALID_RESPONSE");
    return edges.map((e) => {
      const n = e.node;
      const title = n.name;
      return {
        source: "producthunt" as const,
        sourceUrl: n.url,
        title,
        description: [n.tagline, n.description].filter(Boolean).join("\n").slice(0, 2000),
        author: undefined,
        publishedAt: new Date(n.createdAt),
        category: inferCategory(`${title} ${n.tagline ?? ""}`),
        engagement: n.votesCount,
        keywords: keywordsFromText(`${title} ${n.tagline ?? ""}`),
        confidenceScore: 0.78,
        rawData: { productUrl: n.website, snippet: n.tagline ?? "", earlySignal: "Emerging" },
      };
    });
  });
}

export const productHuntProvider: TrendSource = {
  name: "producthunt",
  fetchItems: async () => {
    
    
    if (process.env.PRODUCT_HUNT_TOKEN) return phLive();
    if (isDemoEnabled()) return makeMockProvider("producthunt").fetchItems();
    return [];
  },
  normalizeItem: (i) => i,
};
