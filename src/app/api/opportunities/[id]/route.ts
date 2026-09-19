import { NextResponse } from "next/server";
import { getOpportunity } from "@/lib/queries";
import { getUserId } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const userId = await getUserId();
  const opp = await getOpportunity(params.id, userId);
  if (!opp) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json({ opportunity: opp });
}
