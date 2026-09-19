import { NextResponse } from "next/server";
import { adminStatus } from "@/lib/queries";
import { collectSignals } from "@/lib/sources";

export async function GET() {
  const [status, { statuses }] = await Promise.all([adminStatus(), collectSignals()]);
  return NextResponse.json({ ...status, sourceStatuses: statuses });
}
