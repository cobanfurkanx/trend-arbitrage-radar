import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, signSession, sessionCookieOptions } from "@/lib/auth";
import { INTEREST_OPTIONS } from "@/lib/config/scoring";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz e-posta veya şifre (en az 6 karakter)." }, { status: 400 });
  }
  const { email, password, name } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Bu e-postayla bir hesap zaten var." }, { status: 409 });
  }
  const user = await prisma.user.create({
    data: {
      email,
      name: name ?? null,
      passwordHash: await hashPassword(password),
      preferences: {
        create: { interests: JSON.stringify(INTEREST_OPTIONS.map((i) => i.value)) },
      },
    },
  });
  const res = NextResponse.json({ ok: true, userId: user.id });
  res.cookies.set({ ...sessionCookieOptions(), value: signSession(user.id) });
  return res;
}
