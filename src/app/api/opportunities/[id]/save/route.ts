import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({ status: z.enum(["WATCHING", "BUILDING", "BUILT", "IGNORED"]) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });

  const opp = await prisma.opportunity.findUnique({ where: { id: params.id } });
  if (!opp) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  await prisma.savedOpportunity.upsert({
    where: { userId_opportunityId: { userId, opportunityId: params.id } },
    update: { status: parsed.data.status },
    create: { userId, opportunityId: params.id, status: parsed.data.status },
  });
  return NextResponse.json({ ok: true, status: parsed.data.status });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  await prisma.savedOpportunity.deleteMany({ where: { userId, opportunityId: params.id } });
  return NextResponse.json({ ok: true });
}
