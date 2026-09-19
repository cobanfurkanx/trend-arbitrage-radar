import { NextResponse } from "next/server";
import { listClusters } from "@/lib/queries";

export async function GET() {
  const clusters = await listClusters();
  return NextResponse.json({ count: clusters.length, clusters });
}
