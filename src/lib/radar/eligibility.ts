// Conservative product discovery. A news article containing "AI" is not a product.
export function isProductCandidate(source: string, title: string, description = ""): boolean {
  if (source === "trustmrr" && /\b(agency|consultancy|consulting|content production service|online course|newsletter sponsorship)\b/i.test(description) && !/\b(software|saas|app|tool|platform for)\b/i.test(description)) return false;
  if (source === "hackernews" && !/^show hn\s*:/i.test(title)) return false;
  if (/\b(awesome[- ]list|tutorial|course|interview questions|dataset|model weights|benchmark suite)\b/i.test(`${title} ${description}`)) return false;
  if (source === "github" && /(?:^|\/)(?:awesome[-_].*|.*[-_]projects|.*[-_]skills)$/i.test(title)) return false;
  return true;
}
