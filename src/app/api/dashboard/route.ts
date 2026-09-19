import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { dashboardSummary, listOpportunities } from "@/lib/queries";

export async function GET() {
  const userId = await getUserId();
  const [summary, top] = await Promise.all([
    dashboardSummary(),
    listOpportunities({ sort: "score", userId }),
  ]);
  return NextResponse.json({ summary, top: top.slice(0, 10), total: summary.total });
}
