import { NextResponse } from "next/server";
import { listOpportunities } from "@/lib/queries";
import { getUserId } from "@/lib/auth";
import type { Category, EarlySignal } from "@/lib/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = await getUserId();
  const opps = await listOpportunities({
    category: (url.searchParams.get("category") as Category | "All") ?? "All",
    early: (url.searchParams.get("early") as EarlySignal | "All") ?? "All",
    build: url.searchParams.get("build") ?? "All",
    scoreMin: url.searchParams.get("score") ? Number(url.searchParams.get("score")) : undefined,
    profitMin: url.searchParams.get("profit") ? Number(url.searchParams.get("profit")) : undefined,
    q: url.searchParams.get("q") ?? "",
    sort: (url.searchParams.get("sort") as "score" | "recent") ?? "score",
    userId,
  });
  return NextResponse.json({ count: opps.length, opportunities: opps });
}
