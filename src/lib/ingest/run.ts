import { prisma } from "../db";
import { collectSignals, type SourceStatus } from "../sources";
import { clusterSignals, groupToBrief } from "./cluster";
import { fingerprintOf, mapWithConcurrency } from "./batch";
import { heuristicScores, overallScore, scoreBreakdown } from "../scoring/score";
import { aiProvider } from "../ai";
import { DEMO_TRENDS, type DemoTrend } from "../sources/demoCatalog";
import type { ClusterBrief, OpportunityDraft } from "../ai/types";
import type { ScoreKey, SubScore as SubScoreType } from "../types";

export interface IngestResult {
  signals: number;
  clusters: number;
  opportunities: number;
  skippedAi: number;
  pruned: number;
  filteredBigCo: number;
  statuses: SourceStatus[];
  durationMs: number;
  startedAt: string;
}

const stableId = (prefix: string, key: string, source?: string) =>
  source ? `${prefix}_${key}_${source}` : `${prefix}_${key}`;

interface PendingAnalysis {
  oppId: string;
  signalIds: string[];
  fingerprint: string;
  brief: ClusterBrief;
  subScores: Record<ScoreKey, number>;
  overall: number;
  trend: DemoTrend | undefined;
}

async function linkSignals(oppId: string, signalIds: string[]) {
  for (const sid of signalIds) {
    await prisma.opportunitySource.upsert({
      where: { opportunityId_signalId: { opportunityId: oppId, signalId: sid } },
      update: {},
      create: { opportunityId: oppId, signalId: sid },
    });
  }
}

export async function runIngestion(): Promise<IngestResult> {
  const start = Date.now();
  try {
    await prisma.$executeRawUnsafe("PRAGMA journal_mode=WAL;");
    await prisma.$executeRawUnsafe("PRAGMA busy_timeout=10000;");
  } catch {
    // Non-SQLite backends (prod Postgres) do not understand PRAGMA.
  }
  const { signals: raw, statuses } = await collectSignals();
  const groups = clusterSignals(raw);

  let signalCount = 0;
  let clusterCount = 0;
  let oppCount = 0;
  let skippedAi = 0;

  
  
  async function pruneStale(): Promise<number> {
    const days = Number(process.env.PRUNE_AFTER_DAYS ?? "7");
    const cutoff = new Date(Date.now() - days * 24 * 3600 * 1000);
    const stale = await prisma.opportunity.findMany({
      where: { status: "ACTIVE", lastIngestedAt: { lt: cutoff } },
      select: { id: true },
    });
    let pruned = 0;
    for (const s of stale) {
      const saved = await prisma.savedOpportunity.count({ where: { opportunityId: s.id } });
      if (saved > 0) continue;
      await prisma.opportunity.update({ where: { id: s.id }, data: { status: "ARCHIVED" } });
      pruned++;
    }
    return pruned;
  }

  const pending: PendingAnalysis[] = [];

  
  
  for (const g of groups) {
    const lite = groupToBrief(g);
    const trend = DEMO_TRENDS.find((t) => t.key === g.key);
    const subScores: Record<ScoreKey, number> = trend
      ? { ...trend.subScores }
      : heuristicScores({
          category: lite.category,
          earlySignal: lite.earlySignal,
          sourceCount: lite.sourceCount,
          sourceDiversity: lite.sourceDiversity,
          totalEngagement: lite.totalEngagement,
          firstSeen: lite.firstSeen,
          keywords: lite.keywords,
        });

    const overall = overallScore(subScores);

    const brief: ClusterBrief = {
      title: trend?.title ?? g.signals[0]?.title ?? g.key,
      category: lite.category,
      earlySignal: lite.earlySignal,
      sourceCount: lite.sourceCount,
      sourceNames: lite.sourceNames,
      totalEngagement: lite.totalEngagement,
      firstSeen: lite.firstSeen,
      lastSeen: lite.lastSeen,
      sourceDiversity: lite.sourceDiversity,
      keywords: lite.keywords,
      rawData: lite.rawData,
      signals: g.signals.map((s) => ({
        source: s.source,
        title: s.title,
        url: s.sourceUrl,
        engagement: s.engagement ?? 0,
        publishedAt: s.publishedAt,
      })),
    };

    const oppId = stableId("opp", g.key);
    const fingerprint = fingerprintOf([
      ...g.signals
        .map((s) => `${stableId("sig", g.key, s.source)}:${s.engagement ?? 0}`)
        .sort(),
      `sources:${lite.sourceCount}`,
      `engagement:${lite.totalEngagement}`,
    ]);
    const existing = await prisma.opportunity.findUnique({
      where: { id: oppId },
      select: { fingerprint: true },
    });

    const clusterId = stableId("clu", g.key);
    await prisma.trendCluster.upsert({
      where: { id: clusterId },
      update: {
        title: brief.title,
        category: brief.category,
        sourceCount: brief.sourceCount,
        totalEngagement: brief.totalEngagement,
        engagementVelocity: brief.totalEngagement,
        firstSeen: brief.firstSeen,
        lastSeen: brief.lastSeen,
        sourceDiversity: brief.sourceDiversity,
        signalIds: JSON.stringify(g.signals.map((s) => stableId("sig", g.key, s.source))),
      },
      create: {
        id: clusterId,
        title: brief.title,
        category: brief.category,
        sourceCount: brief.sourceCount,
        totalEngagement: brief.totalEngagement,
        engagementVelocity: brief.totalEngagement,
        firstSeen: brief.firstSeen,
        lastSeen: brief.lastSeen,
        sourceDiversity: brief.sourceDiversity,
        signalIds: JSON.stringify(g.signals.map((s) => stableId("sig", g.key, s.source))),
      },
    });
    clusterCount++;

    const signalIds: string[] = [];
    for (const s of g.signals) {
      const id = stableId("sig", g.key, s.source);
      signalIds.push(id);
      await prisma.trendSignal.upsert({
        where: { id },
        update: {
          source: s.source,
          sourceUrl: s.sourceUrl,
          title: s.title,
          description: s.description ?? "",
          author: s.author ?? null,
          publishedAt: s.publishedAt,
          category: s.category ?? "Other",
          engagement: s.engagement ?? 0,
          engagementVelocity: s.engagement ?? 0,
          keywords: JSON.stringify(s.keywords ?? []),
          rawData: JSON.stringify(s.rawData ?? {}),
          confidenceScore: s.confidenceScore ?? 0.5,
          clusterId,
        },
        create: {
          id,
          source: s.source,
          sourceUrl: s.sourceUrl,
          title: s.title,
          description: s.description ?? "",
          author: s.author ?? null,
          publishedAt: s.publishedAt,
          category: s.category ?? "Other",
          engagement: s.engagement ?? 0,
          engagementVelocity: s.engagement ?? 0,
          keywords: JSON.stringify(s.keywords ?? []),
          rawData: JSON.stringify(s.rawData ?? {}),
          confidenceScore: s.confidenceScore ?? 0.5,
          clusterId,
        },
      });
      signalCount++;
    }

    if (existing != null && existing.fingerprint === fingerprint) {
      skippedAi++;
      await prisma.opportunity.update({
        where: { id: oppId },
        data: { lastIngestedAt: new Date() },
      });
      await linkSignals(oppId, signalIds);
    } else {
      pending.push({ oppId, signalIds, fingerprint, brief, subScores, overall, trend });
    }
  }

  const CHUNK = 8;
  for (let start = 0; start < pending.length; start += CHUNK) {
    const slice = pending.slice(start, start + CHUNK);
    const drafts: OpportunityDraft[] = await mapWithConcurrency(slice, 4, (p) =>
      aiProvider.analyzeCluster({ ...p.brief, subScores: p.subScores })
    );
    for (let j = 0; j < slice.length; j++) {
      const p = slice[j];
      const draft = drafts[j];
      try {
        await persistAnalyzed(p, draft);
        oppCount++;
        await linkSignals(p.oppId, p.signalIds);
      } catch (err) {
        console.error(
          `[ingest] cluster failed, continuing: ${p.oppId}`,
          err instanceof Error ? err.message : err
        );
      }
    }
  }

  async function persistAnalyzed(p: PendingAnalysis, draft: OpportunityDraft) {
    const breakdown: SubScoreType[] = scoreBreakdown(p.subScores).map((s) => ({
      key: s.key,
      label: s.label,
      value: s.value,
      rationale: draft.scoreRationales[s.key] ?? "",
    }));

    await prisma.opportunity.upsert({
      where: { id: p.oppId },
      update: {
        title: draft.title,
        summary: draft.summary,
        category: p.brief.category,
        earlySignal: p.brief.earlySignal,
        whyNow: draft.whyNow,
        whatIsChanging: draft.whatIsChanging,
        whyPeopleCare: draft.whyPeopleCare,
        turkeyFit: p.subScores.turkeyFit,
        competitionGap: p.subScores.competitionGap,
        monetizationPotential: p.subScores.monetizationPotential,
        buildability: p.subScores.buildability,
        viralPotential: p.subScores.viralPotential,
        novelty: p.subScores.novelty,
        trendVelocity: p.subScores.trendVelocity,
        overallScore: p.overall,
        scoreBreakdown: JSON.stringify(breakdown),
        estimatedMvpTime: draft.estimatedMvpTime,
        suggestedBusinessModel: JSON.stringify(draft.suggestedBusinessModel),
        suggestedTurkishAngle: draft.suggestedTurkishAngle,
        localizationNotes: draft.localizationNotes,
        isDemo: !!p.trend,
        fingerprint: p.fingerprint,
        lastIngestedAt: new Date(),
      },
      create: {
        id: p.oppId,
        title: draft.title,
        summary: draft.summary,
        category: p.brief.category,
        earlySignal: p.brief.earlySignal,
        whyNow: draft.whyNow,
        whatIsChanging: draft.whatIsChanging,
        whyPeopleCare: draft.whyPeopleCare,
        turkeyFit: p.subScores.turkeyFit,
        competitionGap: p.subScores.competitionGap,
        monetizationPotential: p.subScores.monetizationPotential,
        buildability: p.subScores.buildability,
        viralPotential: p.subScores.viralPotential,
        novelty: p.subScores.novelty,
        trendVelocity: p.subScores.trendVelocity,
        overallScore: p.overall,
        scoreBreakdown: JSON.stringify(breakdown),
        estimatedMvpTime: draft.estimatedMvpTime,
        suggestedBusinessModel: JSON.stringify(draft.suggestedBusinessModel),
        suggestedTurkishAngle: draft.suggestedTurkishAngle,
        localizationNotes: draft.localizationNotes,
        isDemo: !!p.trend,
        fingerprint: p.fingerprint,
        lastIngestedAt: new Date(),
      },
      });
  }

  const pruned = await pruneStale();
  const filteredBigCo = statuses.reduce((s, x) => s + (x.filtered ?? 0), 0);

  return {
    signals: signalCount,
    clusters: clusterCount,
    opportunities: oppCount,
    skippedAi,
    pruned,
    filteredBigCo,
    statuses,
    durationMs: Date.now() - start,
    startedAt: new Date().toISOString(),
  };
}
