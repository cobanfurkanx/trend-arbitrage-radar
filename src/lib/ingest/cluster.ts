import type { Category, EarlySignal, SourceName } from "../types";
import type { RawSignalInput } from "../sources/types";

export interface SignalGroup {
  key: string;
  category: Category;
  earlySignal: EarlySignal;
  signals: RawSignalInput[];
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}




export function slugify(text: string): string {
  const s = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  return s || "signal";
}

function tokensOf(s: RawSignalInput): Set<string> {
  const t = new Set<string>();
  (s.keywords ?? []).forEach((k) => k.toLowerCase().split(/\s+/).forEach((w) => w.length > 2 && t.add(w)));
  const d = domainOf(s.sourceUrl);
  if (d) t.add(d);
  return t;
}




export function clusterSignals(raw: RawSignalInput[]): SignalGroup[] {
  const groups: SignalGroup[] = [];

  for (const s of raw) {
    const explicit = s.rawData?.trendKey;
    if (typeof explicit === "string") {
      let g = groups.find((x) => x.key === explicit);
      if (!g) {
        g = {
          key: explicit,
          category: (s.category ?? "Other") as Category,
          earlySignal: (s.rawData?.earlySignal as EarlySignal) ?? "Emerging",
          signals: [],
        };
        groups.push(g);
      }
      g.signals.push(s);
      continue;
    }

    const toks = tokensOf(s);
    let merged: SignalGroup | undefined;
    let bestOverlap = 0;
    for (const g of groups) {
      const gtoks = tokensOf(g.signals[0]);
      let overlap = 0;
      toks.forEach((t) => gtoks.has(t) && overlap++);
      const score = overlap / Math.max(1, Math.min(toks.size, gtoks.size));
      if (score > bestOverlap) {
        bestOverlap = score;
        merged = g;
      }
    }
    if (merged && bestOverlap >= 0.34) {
      merged.signals.push(s);
      if ((s.category ?? "Other") !== "Other") merged.category = s.category as Category;
    } else {
      const slug = slugify(s.title);
      const domain = domainOf(s.sourceUrl).replace(/[^a-z0-9.-]+/g, "");
      groups.push({
        key: `sig-${domain || "unknown"}-${slug}`,
        category: (s.category ?? "Other") as Category,
        earlySignal: "Emerging",
        signals: [s],
      });
    }
  }

  return groups;
}

export interface ClusterBriefLite {
  key: string;
  category: Category;
  earlySignal: EarlySignal;
  sourceCount: number;
  sourceNames: string[];
  totalEngagement: number;
  firstSeen: Date;
  lastSeen: Date;
  sourceDiversity: number;
  keywords: string[];
  rawData: Record<string, unknown>;
}

export function groupToBrief(g: SignalGroup): ClusterBriefLite {
  const sources = g.signals.map((s) => s.source as SourceName);
  const distinct = Array.from(new Set(sources));
  const totalEngagement = g.signals.reduce((a, s) => a + (s.engagement ?? 0), 0);
  const published = g.signals.map((s) => s.publishedAt.getTime());
  const keywords = Array.from(new Set(g.signals.flatMap((s) => s.keywords ?? [])));
  return {
    key: g.key,
    category: g.category,
    earlySignal: g.earlySignal,
    sourceCount: distinct.length,
    sourceNames: distinct,
    totalEngagement,
    firstSeen: new Date(Math.min(...published)),
    lastSeen: new Date(Math.max(...published)),
    sourceDiversity: g.signals.length ? distinct.length / g.signals.length : 0,
    keywords,
    rawData: g.signals[0]?.rawData ?? {},
  };
}
