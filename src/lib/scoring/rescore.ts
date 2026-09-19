import "dotenv/config";
import { prisma } from "../db";
import { overallScore } from "./score";
import type { ScoreKey, SubScore } from "../types";




async function main() {
  const rows = await prisma.opportunity.findMany({
    select: { id: true, title: true, overallScore: true, scoreBreakdown: true },
  });
  let updated = 0;
  for (const r of rows) {
    let breakdown: SubScore[];
    try {
      breakdown = JSON.parse(r.scoreBreakdown) as SubScore[];
    } catch {
      continue;
    }
    const sub: Record<ScoreKey, number> = {} as Record<ScoreKey, number>;
    for (const s of breakdown) sub[s.key] = s.value;
    if (Object.keys(sub).length === 0) continue;
    const next = overallScore(sub);
    if (next !== r.overallScore) {
      await prisma.opportunity.update({ where: { id: r.id }, data: { overallScore: next } });
      console.log(`  ${r.title.slice(0, 48)}: ${r.overallScore} → ${next}`);
      updated++;
    }
  }
  console.log(`rescore done: ${updated}/${rows.length} updated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
