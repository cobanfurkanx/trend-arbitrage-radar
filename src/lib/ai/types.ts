import type { Category, EarlySignal, ScoreKey } from "../types";


export interface ClusterBrief {
  title: string;
  category: Category;
  earlySignal: EarlySignal;
  sourceCount: number;
  sourceNames: string[];
  totalEngagement: number;
  firstSeen: Date;
  lastSeen: Date;
  sourceDiversity: number;
  keywords: string[];
  signals: {
    source: string;
    title: string;
    url: string;
    engagement: number;
    publishedAt: Date;
  }[];
  rawData: Record<string, unknown>;
}

export interface OpportunityDraft {
  title: string;
  summary: string;
  whyNow: string;
  whatIsChanging: string;
  whyPeopleCare: string;
  suggestedTurkishAngle: string;
  localizationNotes: string;
  suggestedBusinessModel: string[];
  estimatedMvpTime: string;
  
  scoreRationales: Partial<Record<ScoreKey, string>>;
}

export interface CopyChecklist {
  
  clone: string[];
  
  localize: string[];
  
  skip: string[];
}

export interface BuildPlan {
  mvpScope: string;
  features: string[];
  landingPageCopy: { headline: string; subheadline: string; cta: string };
  suggestedPricing: string[];
  acquisitionChannels: string[];
  launchStrategy: string[];
  copyChecklist: CopyChecklist;
}



export interface AnalyzeInput extends ClusterBrief {
  subScores: Partial<Record<ScoreKey, number>>;
}

export interface AIProvider {
  name: string;
  analyzeCluster(input: AnalyzeInput): Promise<OpportunityDraft>;
  generateBuildPlan(input: ClusterBrief, draft: OpportunityDraft): Promise<BuildPlan>;
}
