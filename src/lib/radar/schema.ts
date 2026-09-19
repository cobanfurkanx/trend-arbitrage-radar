import { z } from "zod";

export const webUrl = z.string().url().refine((s) => /^https?:\/\//i.test(s), "HTTP(S) required");
const text = z.string().trim().min(3).max(800);
export const builderSchema = z.object({
  buyer: z.enum(["agency", "merchant", "local", "creator", "individual", "developer", "business", "unknown"]),
  format: z.enum(["web", "extension", "automation", "mobile", "desktop", "unknown"]),
  upfrontUsd: z.number().min(0).max(1000000).nullable(),
  monthlyUsd: z.number().min(0).max(1000000).nullable(),
  needsApi: z.boolean().nullable(), needsPrivateData: z.boolean().nullable(), needsGpu: z.boolean().nullable(),
  basis: text,
});
export const analysisSchema = z.object({
  title: text.max(160),
  summary: text.max(600),
  customer: text,
  problem: text,
  turkishAngle: text,
  features: z.array(text.max(180)).min(1).max(3),
  firstCustomers: z.array(text).min(1).max(3),
  validation: z.array(text).min(2).max(4),
  stopCondition: text,
  unknowns: z.array(text).min(1).max(5),
  mvpDays: z.number().int().min(1).max(90),
  difficulty: z.enum(["easy", "medium", "hard"]),
  builder: builderSchema.optional(),
});
export type Analysis = z.infer<typeof analysisSchema>;

export const analysisJsonSchema = {
  type: "object", additionalProperties: false,
  properties: {
    builder: { type: "object", additionalProperties: false, properties: {
      buyer: { type: "string", enum: ["agency", "merchant", "local", "creator", "individual", "developer", "business", "unknown"] },
      format: { type: "string", enum: ["web", "extension", "automation", "mobile", "desktop", "unknown"] },
      upfrontUsd: { type: ["number", "null"], minimum: 0, maximum: 1000000 },
      monthlyUsd: { type: ["number", "null"], minimum: 0, maximum: 1000000 },
      needsApi: { type: ["boolean", "null"] }, needsPrivateData: { type: ["boolean", "null"] }, needsGpu: { type: ["boolean", "null"] },
      basis: { type: "string", minLength: 3, maxLength: 800 },
    }, required: ["buyer", "format", "upfrontUsd", "monthlyUsd", "needsApi", "needsPrivateData", "needsGpu", "basis"] },
    ...Object.fromEntries(["title", "summary", "customer", "problem", "turkishAngle", "stopCondition"].map((key) => [key, { type: "string", minLength: 3, maxLength: key === "title" ? 160 : key === "summary" ? 600 : 800 }])),
    features: { type: "array", minItems: 1, maxItems: 3, items: { type: "string", minLength: 3, maxLength: 180 } },
    firstCustomers: { type: "array", minItems: 1, maxItems: 3, items: { type: "string", minLength: 3, maxLength: 800 } },
    validation: { type: "array", minItems: 2, maxItems: 4, items: { type: "string", minLength: 3, maxLength: 800 } },
    unknowns: { type: "array", minItems: 1, maxItems: 5, items: { type: "string", minLength: 3, maxLength: 800 } },
    mvpDays: { type: "integer", minimum: 1, maximum: 90 },
    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
  },
  required: ["title", "summary", "customer", "problem", "turkishAngle", "features", "firstCustomers", "validation", "stopCondition", "unknowns", "mvpDays", "difficulty", "builder"],
};

export const evidenceSchema = z.object({
  kind: z.enum(["pricing", "paying_customers", "turkey_demand", "competitor", "distribution"]),
  claim: text,
  url: webUrl,
  checkedAt: z.string().datetime(),
  level: z.enum(["self_reported", "reviewed"]),
});
export type Evidence = z.infer<typeof evidenceSchema>;
export const reviewSchema = z.object({
  productId: z.string().min(1),
  evidence: z.array(evidenceSchema).max(30),
  scores: z.object({
    commercial: z.number().int().min(0).max(100).nullable(),
    turkeyDemand: z.number().int().min(0).max(100).nullable(),
    distribution: z.number().int().min(0).max(100).nullable(),
    feasibility: z.number().int().min(0).max(100).nullable(),
    differentiation: z.number().int().min(0).max(100).nullable(),
  }),
  note: z.string().max(2000),
});
export type Review = z.infer<typeof reviewSchema>;
export const revenueSchema = z.object({
  last30DaysUsd: z.number().finite().nonnegative().nullable(),
  mrrUsd: z.number().finite().nonnegative().nullable(),
  totalUsd: z.number().finite().nonnegative().nullable(),
  growth30d: z.number().finite().nullable(),
  profitMarginReported: z.number().finite().min(-100).max(100).nullable(),
  foundedAt: z.string().datetime().nullable(),
  observedAt: z.string().datetime(),
  syncedAt: z.string().datetime().nullable(),
  paymentProvider: z.string().min(1).max(80),
  sourceUrl: webUrl,
});
export type Revenue = z.infer<typeof revenueSchema>;
export type Signal = {
  id: string; source: string; url: string; productUrl: string | null;
  title: string; description: string; category: string; publishedAt: string;
  firstSeen: string; lastSeen: string; engagement: number;
  samples: { at: string; engagement: number }[];
  revenue?: Revenue;
};
export type Product = {
  id: string; title: string; category: string; signalIds: string[];
  firstSeen: string; lastSeen: string; fingerprint: string;
  analysis?: Analysis; analyzedAt?: string; analyzedFingerprint?: string;
  lastAttemptAt?: string;
  analysisStatus: "pending" | "ready" | "failed";
};
export type State = {
  version: 1; signals: Record<string, Signal>; products: Record<string, Product>;
  usage: Record<string, number>;
};
export type Card = Product & {
  signals: Omit<Signal, "samples">[];
  momentum: number; velocity: number | null;
  stage: "radar" | "validated"; confidence: "low" | "medium" | "high";
  opportunityScore: number | null; review: Review | null;
};
export type Snapshot = {
  version: 1; generatedAt: string; lastSuccessfulCollection: string | null;
  sources: { name: string; status: "ok" | "failed" | "disabled"; count: number; reason?: string }[];
  cards: Card[];
};
export const emptyState = (): State => ({ version: 1, signals: {}, products: {}, usage: {} });
