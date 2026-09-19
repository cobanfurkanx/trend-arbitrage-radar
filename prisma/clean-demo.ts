import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { DEMO_TRENDS } from "../src/lib/sources/demoCatalog";




async function main() {
  const prisma = new PrismaClient();
  try {
    const demoKeys = new Set(DEMO_TRENDS.map((t) => t.key));

    
    const demoOpps = await prisma.opportunity.findMany({
      where: { isDemo: true },
      select: { id: true },
    });
    const demoOppIds = demoOpps.map((o) => o.id);
    await prisma.opportunitySource.deleteMany({ where: { opportunityId: { in: demoOppIds } } });
    const { count: opps } = await prisma.opportunity.deleteMany({
      where: { id: { in: demoOppIds } },
    });

    
    
    const signals = await prisma.trendSignal.findMany({
      select: { id: true, rawData: true },
    });
    const demoSigIds = signals
      .filter((s) => {
        try {
          const raw = JSON.parse(s.rawData) as { trendKey?: unknown };
          return typeof raw.trendKey === "string" && demoKeys.has(raw.trendKey);
        } catch {
          return false;
        }
      })
      .map((s) => s.id);
    await prisma.opportunitySource.deleteMany({ where: { signalId: { in: demoSigIds } } });
    const { count: sigs } = await prisma.trendSignal.deleteMany({
      where: { id: { in: demoSigIds } },
    });

    
    const { count: named } = await prisma.trendCluster.deleteMany({
      where: { id: { in: [...demoKeys].map((k) => `clu_${k}`) } },
    });
    const empties = await prisma.trendCluster.findMany({
      select: { id: true, _count: { select: { signals: true } } },
    });
    const emptyIds = empties.filter((c) => c._count.signals === 0).map((c) => c.id);
    const { count: orphans } = await prisma.trendCluster.deleteMany({
      where: { id: { in: emptyIds } },
    });

    console.log(
      JSON.stringify({ demoOpportunities: opps, demoSignals: sigs, demoClusters: named + orphans })
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
