import type { Category, EarlySignal, ScoreKey, SourceName } from "../types";





export interface ScoreWeight {
  key: ScoreKey;
  label: string;
  weight: number;
}




export const SCORING_WEIGHTS: ScoreWeight[] = [
  { key: "trendVelocity", label: "Trend Hızı", weight: 0.2 },
  { key: "turkeyFit", label: "Türkiye Uyumu", weight: 0.2 },
  { key: "competitionGap", label: "Rekabet Boşluğu", weight: 0.15 },
  { key: "monetizationPotential", label: "Kazanç Potansiyeli", weight: 0.2 },
  { key: "buildability", label: "Yapılabilirlik", weight: 0.15 },
  { key: "viralPotential", label: "Viral Potansiyel", weight: 0.05 },
  { key: "novelty", label: "Yenilik / Erken Sinyal", weight: 0.05 },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  AI: "Yapay Zeka",
  SaaS: "SaaS",
  Consumer: "Tüketici",
  Developer: "Geliştirici",
  "E-commerce": "E-Ticaret",
  Domains: "Domain",
  Social: "Sosyal",
  Content: "İçerik",
  Other: "Diğer",
};

export const SCORE_KEY_LABELS: Record<ScoreKey, string> = SCORING_WEIGHTS.reduce(
  (acc, w) => ({ ...acc, [w.key]: w.label }),
  {} as Record<ScoreKey, string>
);

export const WEIGHT_TOTAL = SCORING_WEIGHTS.reduce((s, w) => s + w.weight, 0);

export const CATEGORIES: Category[] = [
  "AI",
  "SaaS",
  "Consumer",
  "Developer",
  "E-commerce",
  "Domains",
  "Social",
  "Content",
  "Other",
];

export const EARLY_SIGNALS: EarlySignal[] = ["VeryEarly", "Emerging", "Established"];

export const EARLY_SIGNAL_LABELS: Record<EarlySignal, string> = {
  VeryEarly: "Çok Erken",
  Emerging: "Yükselen",
  Established: "Yerleşik",
};

export const SOURCE_NAMES: SourceName[] = [
  "reddit",
  "hackernews",
  "producthunt",
  "github",
  "googletrends",
  "x",
];

export const SOURCE_LABELS: Record<SourceName, string> = {
  reddit: "Reddit",
  hackernews: "Hacker News",
  producthunt: "Product Hunt",
  github: "GitHub",
  googletrends: "Google Trends",
  x: "X (Twitter)",
};


export const INTEREST_OPTIONS: { value: Category; label: string; hint: string }[] = [
  { value: "AI", label: "Yapay Zeka", hint: "YZ ajanları, araçlar, modeller" },
  { value: "SaaS", label: "SaaS", hint: "B2B ve dikey yazılımlar" },
  { value: "Domains", label: "Domain", hint: "Domain ve marka trendleri" },
  { value: "Consumer", label: "Tüketici", hint: "Tüketici uygulamaları ve web" },
  { value: "Developer", label: "Geliştirici Araçları", hint: "Geliştirici araçları ve altyapı" },
  { value: "Social", label: "Sosyal", hint: "Sosyal ve topluluk ürünleri" },
  { value: "E-commerce", label: "E-Ticaret", hint: "Online perakende ve pazaryerleri" },
  { value: "Content", label: "İçerik", hint: "Medya, bültenler, video" },
];

export const MVP_TIME_OPTIONS = ["<1 gün", "<3 gün", "<1 hafta", ">1 hafta"];

export const SAVED_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "WATCHING", label: "İzleniyor" },
  { value: "BUILDING", label: "Geliştiriliyor" },
  { value: "BUILT", label: "Tamamlandı" },
  { value: "IGNORED", label: "Yoksayıldı" },
];
