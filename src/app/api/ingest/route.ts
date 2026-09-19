import { NextResponse } from "next/server";
import { runIngestion } from "@/lib/ingest/run";







export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Veri alımı yapılandırılmamış" }, { status: 503 });
  if (secret) {
    const url = new URL(req.url);
    const presented = req.headers.get("x-cron-secret") ?? url.searchParams.get("secret");
    if (presented !== secret) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
  }
  try {
    const result = await runIngestion();
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "veri alımı başarısız" },
      { status: 500 }
    );
  }
}
