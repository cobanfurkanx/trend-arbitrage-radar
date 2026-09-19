import { z } from "zod";

export const scoreKeySchema = z.enum([
  "trendVelocity",
  "turkeyFit",
  "competitionGap",
  "monetizationPotential",
  "buildability",
  "viralPotential",
  "novelty",
]);

export const opportunityDraftSchema = z.object({
  title: z.string().min(3).max(160),
  summary: z.string().min(10).max(600),
  whyNow: z.string().min(10).max(600),
  whatIsChanging: z.string().min(10).max(400),
  whyPeopleCare: z.string().min(10).max(400),
  suggestedTurkishAngle: z.string().min(10).max(500),
  localizationNotes: z.string().min(10).max(400),
  suggestedBusinessModel: z.array(z.string()).min(1).max(6),
  estimatedMvpTime: z.string().min(2).max(40),
  scoreRationales: z.record(scoreKeySchema, z.string().min(5).max(400)),
});

export const buildPlanSchema = z.object({
  mvpScope: z.string().min(10).max(500),
  features: z.array(z.string().min(3).max(120)).min(3).max(10),
  landingPageCopy: z.object({
    headline: z.string().min(3).max(160),
    subheadline: z.string().min(5).max(300),
    cta: z.string().min(2).max(40),
  }),
  suggestedPricing: z.array(z.string().min(3).max(120)).min(1).max(6),
  acquisitionChannels: z.array(z.string().min(3).max(120)).min(1).max(8),
  launchStrategy: z.array(z.string().min(3).max(160)).min(1).max(8),
  copyChecklist: z.object({
    clone: z.array(z.string().min(3).max(160)).min(2).max(6),
    localize: z.array(z.string().min(3).max(160)).min(2).max(6),
    skip: z.array(z.string().min(3).max(160)).min(2).max(6),
  }),
});

export type OpportunityDraftParsed = z.infer<typeof opportunityDraftSchema>;
export type BuildPlanParsed = z.infer<typeof buildPlanSchema>;
