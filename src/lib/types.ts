



export type Category =
  | "AI"
  | "SaaS"
  | "Consumer"
  | "Developer"
  | "E-commerce"
  | "Domains"
  | "Social"
  | "Content"
  | "Other";

export type EarlySignal = "VeryEarly" | "Emerging" | "Established";

export type SavedStatus = "WATCHING" | "BUILDING" | "BUILT" | "IGNORED";

export type SourceName =
  | "reddit"
  | "hackernews"
  | "producthunt"
  | "github"
  | "googletrends"
  | "x";

export interface TrendSignal {
  id: string;
  source: SourceName;
  sourceUrl: string;
  title: string;
  description: string;
  author?: string | null;
  publishedAt: Date;
  discoveredAt: Date;
  category: Category;
  engagement: number;
  engagementVelocity: number;
  keywords: string[];
  rawData: Record<string, unknown>;
  confidenceScore: number;
  clusterId?: string | null;
}

export interface TrendCluster {
  id: string;
  title: string;
  category: Category;
  sourceCount: number;
  totalEngagement: number;
  engagementVelocity: number;
  firstSeen: Date;
  lastSeen: Date;
  sourceDiversity: number;
  signalIds: string[];
}

export interface SubScore {
  key: ScoreKey;
  label: string;
  value: number; 
  rationale: string;
}

export type ScoreKey =
  | "trendVelocity"
  | "turkeyFit"
  | "competitionGap"
  | "monetizationPotential"
  | "buildability"
  | "viralPotential"
  | "novelty";

export interface Opportunity {
  id: string;
  title: string;
  summary: string;
  category: Category;
  earlySignal: EarlySignal;
  whyNow: string;
  whatIsChanging: string;
  whyPeopleCare: string;
  turkeyFit: number;
  competitionGap: number;
  monetizationPotential: number;
  buildability: number;
  viralPotential: number;
  novelty: number;
  trendVelocity: number;
  overallScore: number;
  scoreBreakdown: SubScore[];
  estimatedMvpTime: string;
  suggestedBusinessModel: string[];
  suggestedTurkishAngle: string;
  localizationNotes: string;
  status: "ACTIVE" | "ARCHIVED";
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
  trendSignalIds: string[];
  
  signals?: TrendSignal[];
  savedStatus?: string | null;
}


export interface ClusterView extends TrendCluster {
  signals: TrendSignal[];
}
