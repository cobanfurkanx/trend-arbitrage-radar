import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";

const COOKIE = "tr_session";
const SECRET = process.env.JWT_SECRET ?? "dev-insecure-secret-change-me";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.error(
    "[auth] FATAL-ish: JWT_SECRET is not set — sessions use an insecure default. " +
      "Set JWT_SECRET in production immediately."
  );
}
const DAYS = Number(process.env.SESSION_DAYS ?? "30");

export function hashPassword(p: string) {
  return bcrypt.hash(p, 10);
}
export function verifyPassword(p: string, hash: string) {
  return bcrypt.compare(p, hash);
}

export function signSession(userId: string) {
  return jwt.sign({ uid: userId }, SECRET, { expiresIn: `${DAYS}d` });
}

export function verifySession(token: string): string | null {
  try {
    const decoded = jwt.verify(token, SECRET) as { uid: string };
    return decoded.uid;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    name: COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: DAYS * 24 * 60 * 60,
  };
}

export async function getCurrentUser() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const uid = verifySession(token);
  if (!uid) return null;
  const user = await prisma.user.findUnique({
    where: { id: uid },
    include: { preferences: true },
  });
  return user;
}

export async function getUserId(): Promise<string | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}


export async function getSavedMap(userId: string | null) {
  if (!userId) return new Map<string, string>();
  const saved = await prisma.savedOpportunity.findMany({ where: { userId } });
  return new Map(saved.map((s) => [s.opportunityId, s.status]));
}
