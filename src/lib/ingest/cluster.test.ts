import { describe, expect, it } from "vitest";
import { clusterSignals, slugify } from "./cluster";
import type { RawSignalInput } from "../sources/types";

function signal(over: Partial<RawSignalInput> & { sourceUrl: string; title: string }): RawSignalInput {
  const { sourceUrl, title, ...rest } = over;
  return {
    source: "reddit",
    sourceUrl,
    title,
    publishedAt: new Date(),
    ...rest,
  };
}

describe("slugify", () => {
  it("strips URL-breaking characters", () => {
    expect(slugify("TAO: open-math problems, don't \"paste\" this?")).toBe(
      "tao-open-math-problems-don-t-pas"
    );
  });

  it("falls back for empty input", () => {
    expect(slugify("!!!")).toBe("signal");
  });
});

describe("clusterSignals", () => {
  it("groups demo signals by explicit trendKey", () => {
    const groups = clusterSignals([
      signal({
        source: "reddit",
        sourceUrl: "https://www.reddit.com/r/a",
        title: "AI directories wave",
        rawData: { trendKey: "ai-directory" },
      }),
      signal({
        source: "producthunt",
        sourceUrl: "https://www.producthunt.com/posts/x",
        title: "Niche AI index",
        rawData: { trendKey: "ai-directory" },
      }),
      signal({
        source: "github",
        sourceUrl: "https://github.com/demo/other",
        title: "Unrelated repo",
        rawData: { trendKey: "other-thing" },
      }),
    ]);
    expect(groups).toHaveLength(2);
    const dir = groups.find((g) => g.key === "ai-directory");
    expect(dir?.signals).toHaveLength(2);
  });

  it("merges key-less signals that share keywords/domain", () => {
    const groups = clusterSignals([
      signal({
        source: "hackernews",
        sourceUrl: "https://example.com/a",
        title: "Vertical search starter kit",
        keywords: ["search", "vertical", "embeddings", "saas"],
      }),
      signal({
        source: "github",
        sourceUrl: "https://example.com/b",
        title: "Niche search engine",
        keywords: ["search", "vertical", "tracker"],
      }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].signals).toHaveLength(2);
  });

  it("generates URL-safe cluster keys (no slashes, colons, quotes)", () => {
    const groups = clusterSignals([
      signal({
        source: "github",
        sourceUrl: "https://github.com/albert-weasker/niubigeo",
        title: "TAO: open-math problems, don't \"paste\" this?",
        keywords: ["math", "open"],
      }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toMatch(/^[A-Za-z0-9_.-]+$/);
    expect(groups[0].key).not.toContain("/");
  });

  it("keeps unrelated key-less signals apart", () => {
    const groups = clusterSignals([
      signal({
        sourceUrl: "https://other.io/x",
        title: "Fridge recipe leftovers",
        keywords: ["recipe", "food"],
      }),
      signal({
        source: "github",
        sourceUrl: "https://example.com/b",
        title: "Niche search engine",
        keywords: ["search", "vertical", "tracker"],
      }),
    ]);
    expect(groups).toHaveLength(2);
  });
});
