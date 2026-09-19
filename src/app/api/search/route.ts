import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { listClusters, listOpportunities } from "@/lib/queries";


export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") ?? "20")));
  if (!q) return NextResponse.json({ query: q, count: 0, opportunities: [], trends: [] });

  const userId = await getUserId();
  const [opps, clusters] = await Promise.all([
    listOpportunities({ q, sort: "score", userId }),
    listClusters(),
  ]);
  const trends = clusters
    .filter((c) => c.title.toLowerCase().includes(q.toLowerCase()))
    .slice(0, limit)
    .map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      sourceCount: c.sourceCount,
      totalEngagement: c.totalEngagement,
    }));
  return NextResponse.json({
    query: q,
    count: opps.length,
    opportunities: opps.slice(0, limit),
    trends,
  });
}
