import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { aiProvider } from "@/lib/ai";
import { getOpportunity } from "@/lib/queries";
import type { ClusterBrief } from "@/lib/ai/types";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const opp = await getOpportunity(params.id, userId);
  if (!opp) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const brief: ClusterBrief = {
    title: opp.title,
    category: opp.category,
    earlySignal: opp.earlySignal,
    sourceCount: (opp.signals ?? []).length,
    sourceNames: Array.from(new Set((opp.signals ?? []).map((s) => s.source))),
    totalEngagement: (opp.signals ?? []).reduce((a, s) => a + s.engagement, 0),
    firstSeen: (opp.signals ?? [])[0]?.publishedAt ?? opp.createdAt,
    lastSeen: opp.updatedAt,
    sourceDiversity: opp.trendSignalIds.length ? 1 : 0,
    keywords: Array.from(new Set((opp.signals ?? []).flatMap((s) => s.keywords))),
    rawData: {},
    signals: (opp.signals ?? []).map((s) => ({
      source: s.source,
      title: s.title,
      url: s.sourceUrl,
      engagement: s.engagement,
      publishedAt: s.publishedAt,
    })),
  };

  const draft = {
    title: opp.title,
    summary: opp.summary,
    whyNow: opp.whyNow,
    whatIsChanging: opp.whatIsChanging,
    whyPeopleCare: opp.whyPeopleCare,
    suggestedTurkishAngle: opp.suggestedTurkishAngle,
    localizationNotes: opp.localizationNotes,
    suggestedBusinessModel: opp.suggestedBusinessModel,
    estimatedMvpTime: opp.estimatedMvpTime,
    scoreRationales: {},
  };

  const plan = await aiProvider.generateBuildPlan(brief, draft);
  return NextResponse.json({ plan });
}
