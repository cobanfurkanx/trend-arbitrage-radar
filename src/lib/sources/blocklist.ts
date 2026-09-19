import type { RawSignalInput } from "./types";

export const BIG_ORGS = [
  "meta",
  "facebook",
  "openai",
  "anthropic",
  "google",
  "deepmind",
  "microsoft",
  "apple",
  "amazon",
  "netflix",
  "tesla",
  "xai",
  "nvidia",
  "adobe",
  "salesforce",
  "oracle",
  "ibm",
  "bytedance",
  "tencent",
  "samsung",
  "intel",
];

export const FLAGSHIP_TOKENS = [
  "openai",
  "anthropic",
  "chatgpt",
  "gpt-4",
  "gpt-5",
  "gpt-6",
  "claude",
  "gemini",
  "copilot",
  "deepmind",
  "facebook",
  "meta",
  "microsoft",
  "apple",
  "amazon",
  "netflix",
  "tesla",
  "salesforce",
  "oracle",
  "ibm",
  "nvidia",
  "adobe",
  "bytedance",
];

export const MAX_STARS = 10000;
export const MAX_AGE_DAYS = 60;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const TOKEN_RES = FLAGSHIP_TOKENS.map((t) => ({
  token: t,
  re: new RegExp(`\\b${escapeRegExp(t)}\\b`, "i"),
}));
const ORG_SET = new Set(BIG_ORGS);

function githubOwner(url: string): string | null {
  const m = url.match(/github\.com\/([^/]+)/i);
  return m ? m[1].toLowerCase() : null;
}

export interface BlockVerdict {
  blocked: boolean;
  reason?: string;
}

export function isBlockedSignal(s: RawSignalInput): BlockVerdict {
  const author = (s.author ?? "").toLowerCase();
  if (author && ORG_SET.has(author.replace(/^u\//, ""))) {
    return { blocked: true, reason: `big-co author: ${s.author}` };
  }

  if (s.source === "github") {
    const owner = githubOwner(s.sourceUrl);
    if (owner && ORG_SET.has(owner)) {
      return { blocked: true, reason: `big-co org repo: ${owner}` };
    }
    if ((s.engagement ?? 0) > MAX_STARS) {
      return { blocked: true, reason: `established repo (${s.engagement} stars)` };
    }
  }

  const haystack = `${s.title} ${s.description ?? ""}`;
  const hit = TOKEN_RES.find((t) => t.re.test(haystack));
  if (hit) {
    return { blocked: true, reason: `big-co flagship mention: ${hit.token}` };
  }

  const ageMs = Date.now() - new Date(s.publishedAt).getTime();
  if (ageMs > MAX_AGE_DAYS * 24 * 3600 * 1000) {
    return { blocked: true, reason: `stale signal (>${MAX_AGE_DAYS}d)` };
  }

  return { blocked: false };
}
