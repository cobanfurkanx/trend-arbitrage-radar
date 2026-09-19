import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({ interests: z.array(z.string()) });

export async function PATCH(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });

  await prisma.userPreference.upsert({
    where: { userId },
    update: { interests: JSON.stringify(parsed.data.interests) },
    create: { userId, interests: JSON.stringify(parsed.data.interests) },
  });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ interests: [] });
  const pref = await prisma.userPreference.findUnique({ where: { userId } });
  return NextResponse.json({ interests: pref ? JSON.parse(pref.interests) : [] });
}
