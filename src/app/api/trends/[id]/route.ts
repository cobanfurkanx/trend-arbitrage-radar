import { NextResponse } from "next/server";
import { getCluster } from "@/lib/queries";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const c = await getCluster(params.id);
  if (!c) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json({ cluster: c });
}
