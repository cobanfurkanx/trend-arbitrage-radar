import { prisma } from "./db";
import type {
  Category,
  EarlySignal,
  Opportunity,
  ScoreKey,
  SubScore,
  TrendCluster,
  TrendSignal,
} from "./types";
import { DEMO_TRENDS } from "./sources/demoCatalog";

function parseJSON<T>(s: string | null, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export interface OpportunityFilters {
  category?: Category | "All";
  scoreMin?: number;
  profitMin?: number;
  early?: EarlySignal | "All";
  build?: string; // "<1 day" | "<3 days" | "<1 week" | ">1 week" | "All"
  q?: string;
  sort?: "score" | "recent";
  userId?: string | null;
}

function matchBuildTime(mvp: string, filter?: string): boolean {
  if (!filter || filter === "All") return true;
  return mvp === filter;
}

export async function listOpportunities(f: OpportunityFilters = {}): Promise<Opportunity[]> {
  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (f.category && f.category !== "All") where.category = f.category;
  if (f.early && f.early !== "All") where.earlySignal = f.early;
  if (f.q && f.q.trim()) {
    const q = f.q.trim();
    
    
    where.OR = [
      { title: { contains: q } },
      { summary: { contains: q } },
      { suggestedTurkishAngle: { contains: q } },
    ];
  }

  const rows = await prisma.opportunity.findMany({
    where,
    orderBy: f.sort === "recent" ? { createdAt: "desc" } : { overallScore: "desc" },
    include: { sources: { include: { signal: true } } },
  });

  const [savedRows, preference] = f.userId
    ? await Promise.all([
        prisma.savedOpportunity.findMany({ where: { userId: f.userId } }),
        prisma.userPreference.findUnique({ where: { userId: f.userId } }),
      ])
    : [[], null];
  const savedMap = new Map(savedRows.map((s) => [s.opportunityId, s.status] as const));
  const interests = new Set(parseJSON<Category[]>(preference?.interests ?? null, []));

  const opps: Opportunity[] = rows
    .map((r) => serializeOpportunity(r as unknown as OppRow))
    .filter((o) => (f.scoreMin ? o.overallScore >= f.scoreMin : true))
    .filter((o) => (f.profitMin ? o.monetizationPotential >= f.profitMin : true))
    .filter((o) => (f.build ? matchBuildTime(o.estimatedMvpTime, f.build) : true))
    .map((o) => ({ ...o, savedStatus: savedMap.get(o.id) ?? null }))
    .sort((a, b) => {
      if (f.sort === "recent" || interests.size === 0) return 0;
      const interestDifference = Number(interests.has(b.category)) - Number(interests.has(a.category));
      return interestDifference || b.overallScore - a.overallScore;
    }) as Opportunity[];

  return opps;
}

interface OppRow {
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
  scoreBreakdown: string;
  estimatedMvpTime: string;
  suggestedBusinessModel: string;
  suggestedTurkishAngle: string;
  localizationNotes: string;
  status: string;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
  sources: { signal: SignalRow }[];
}

interface SignalRow {
  id: string;
  source: string;
  sourceUrl: string;
  title: string;
  description: string;
  author: string | null;
  publishedAt: Date;
  discoveredAt: Date;
  category: string;
  engagement: number;
  engagementVelocity: number;
  keywords: string;
  rawData: string;
  confidenceScore: number;
  clusterId: string | null;
}

function serializeSignal(s: SignalRow): TrendSignal {
  return {
    id: s.id,
    source: s.source as TrendSignal["source"],
    sourceUrl: s.sourceUrl,
    title: s.title,
    description: s.description,
    author: s.author,
    publishedAt: s.publishedAt,
    discoveredAt: s.discoveredAt,
    category: s.category as Category,
    engagement: s.engagement,
    engagementVelocity: s.engagementVelocity,
    keywords: parseJSON<string[]>(s.keywords, []),
    rawData: parseJSON<Record<string, unknown>>(s.rawData, {}),
    confidenceScore: s.confidenceScore,
    clusterId: s.clusterId,
  };
}

function serializeOpportunity(r: OppRow): Opportunity {
  return {
    id: r.id,
    title: r.title,
    summary: r.summary,
    category: r.category,
    earlySignal: r.earlySignal,
    whyNow: r.whyNow,
    whatIsChanging: r.whatIsChanging,
    whyPeopleCare: r.whyPeopleCare,
    turkeyFit: r.turkeyFit,
    competitionGap: r.competitionGap,
    monetizationPotential: r.monetizationPotential,
    buildability: r.buildability,
    viralPotential: r.viralPotential,
    novelty: r.novelty,
    trendVelocity: r.trendVelocity,
    overallScore: r.overallScore,
    scoreBreakdown: parseJSON<SubScore[]>(r.scoreBreakdown, []),
    estimatedMvpTime: r.estimatedMvpTime,
    suggestedBusinessModel: parseJSON<string[]>(r.suggestedBusinessModel, []),
    suggestedTurkishAngle: r.suggestedTurkishAngle,
    localizationNotes: r.localizationNotes,
    status: r.status as Opportunity["status"],
    isDemo: r.isDemo,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    trendSignalIds: r.sources.map((s) => s.signal.id),
    signals: r.sources.map((s) => serializeSignal(s.signal)),
  };
}

export async function getOpportunity(id: string, userId?: string | null): Promise<Opportunity | null> {
  const r = await prisma.opportunity.findUnique({
    where: { id },
    include: { sources: { include: { signal: true } } },
  });
  if (!r) return null;
  const opp = serializeOpportunity(r as unknown as OppRow);
  if (userId) {
    const saved = await prisma.savedOpportunity.findUnique({
      where: { userId_opportunityId: { userId, opportunityId: id } },
    });
    opp.savedStatus = saved?.status ?? null;
  }
  return opp;
}

export async function listClusters(): Promise<(TrendCluster & { signals: TrendSignal[] })[]> {
  const rows = await prisma.trendCluster.findMany({
    orderBy: { sourceDiversity: "desc" },
    include: { signals: true },
  });
  return rows.map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category as Category,
    sourceCount: c.sourceCount,
    totalEngagement: c.totalEngagement,
    engagementVelocity: c.engagementVelocity,
    firstSeen: c.firstSeen,
    lastSeen: c.lastSeen,
    sourceDiversity: c.sourceDiversity,
    signalIds: parseJSON<string[]>(c.signalIds, []),
    signals: c.signals.map(serializeSignal),
  }));
}

export async function getCluster(id: string): Promise<(TrendCluster & { signals: TrendSignal[] }) | null> {
  const c = await prisma.trendCluster.findUnique({
    where: { id },
    include: { signals: true },
  });
  if (!c) return null;
  return {
    id: c.id,
    title: c.title,
    category: c.category as Category,
    sourceCount: c.sourceCount,
    totalEngagement: c.totalEngagement,
    engagementVelocity: c.engagementVelocity,
    firstSeen: c.firstSeen,
    lastSeen: c.lastSeen,
    sourceDiversity: c.sourceDiversity,
    signalIds: parseJSON<string[]>(c.signalIds, []),
    signals: c.signals.map(serializeSignal),
  };
}

export interface DashboardSummary {
  total: number;
  byCategory: { category: Category; count: number }[];
  topScore: number;
  avgScore: number;
  demo: boolean;
  lastIngestedAt: string | null;
}

export async function dashboardSummary(): Promise<DashboardSummary> {
  const [total, byCat, last] = await Promise.all([
    prisma.opportunity.count({ where: { status: "ACTIVE" } }),
    prisma.opportunity.groupBy({ by: ["category"], where: { status: "ACTIVE" }, _count: true }),
    prisma.opportunity.findFirst({ where: { status: "ACTIVE" }, orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
  ]);
  const scored = await prisma.opportunity.findMany({
    where: { status: "ACTIVE" },
    select: { overallScore: true },
  });
  const scores = scored.map((s) => s.overallScore);
  return {
    total,
    byCategory: byCat.map((c) => ({ category: c.category as Category, count: c._count })),
    topScore: scores.length ? Math.max(...scores) : 0,
    avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    demo: true,
    lastIngestedAt: last?.updatedAt?.toISOString() ?? null,
  };
}

export async function getSavedOpportunities(
  userId: string,
  status?: string
): Promise<(Opportunity & { savedStatus: string })[]> {
  const where: Record<string, unknown> = { userId };
  if (status && status !== "All") where.status = status;
  const saved = await prisma.savedOpportunity.findMany({
    where,
    include: {
      opportunity: { include: { sources: { include: { signal: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return saved.map((s) => ({
    ...serializeOpportunity(s.opportunity as unknown as OppRow),
    savedStatus: s.status,
  }));
}

export async function adminStatus() {
  const [signals, clusters, opps, users] = await Promise.all([
    prisma.trendSignal.count(),
    prisma.trendCluster.count(),
    prisma.opportunity.count(),
    prisma.user.count(),
  ]);
  return { signals, clusters, opportunities: opps, users };
}

export const DEMO_COUNT = DEMO_TRENDS.length;
