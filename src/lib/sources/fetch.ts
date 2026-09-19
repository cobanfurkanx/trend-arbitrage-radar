import type { Category } from "../types";
import type { RawSignalInput } from "./types";



export function isDemoEnabled(): boolean {
  return (process.env.DEMO_MODE ?? "true").toLowerCase() !== "false";
}


export async function fetchJson<T = unknown>(
  url: string,
  opts: { headers?: Record<string, string>; timeoutMs?: number; method?: string; body?: string } = {}
): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 8000);
  try {
    const res = await fetch(url, {
      method: opts.method ?? "GET",
      headers: { "User-Agent": "trend-radar/0.1 (+https://localhost)", ...(opts.headers ?? {}) },
      body: opts.body,
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      let detail = "";
      try {
        detail = (await res.text()).slice(0, 200);
      } catch {
        detail = "";
      }
      throw new Error(`HTTP ${res.status} for ${url}${detail ? ` — ${detail}` : ""}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}


const RULES: { cat: Category; words: string[] }[] = [
  { cat: "AI", words: ["ai", "llm", "gpt", "agent", "model", "ml", "chatbot"] },
  { cat: "Developer", words: ["dev", "repo", "api", "sdk", "code", "cli", "self-host", "open source", "github"] },
  { cat: "SaaS", words: ["saas", "b2b", "crm", "subscription", "workspace", "tool"] },
  { cat: "Consumer", words: ["app", "mobile", "consumer", "ios", "android"] },
  { cat: "E-commerce", words: ["ecommerce", "e-commerce", "shop", "store", "marketplace"] },
  { cat: "Social", words: ["social", "community", "discord", "telegram"] },
  { cat: "Content", words: ["newsletter", "content", "video", "blog", "media"] },
  { cat: "Domains", words: ["domain", "naming", "brandable"] },
];

export function inferCategory(text: string): Category {
  const lower = text.toLowerCase();
  for (const r of RULES) {
    if (r.words.some((w) => lower.includes(w))) return r.cat;
  }
  return "Other";
}

export function keywordsFromText(text: string, limit = 6): string[] {
  const stop = new Set([
    "the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "with", "is", "are",
    "i", "we", "my", "your", "this", "that", "it", "new", "how", "why", "build", "built",
  ]);
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));
  return Array.from(new Set(tokens)).slice(0, limit);
}
