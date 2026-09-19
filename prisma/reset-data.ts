import "dotenv/config";
import { PrismaClient } from "@prisma/client";




async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.opportunitySource.deleteMany({});
    const opps = await prisma.opportunity.deleteMany({});
    const sigs = await prisma.trendSignal.deleteMany({});
    const clus = await prisma.trendCluster.deleteMany({});
    
    const saves = await prisma.savedOpportunity.findMany({ select: { id: true, opportunityId: true } });
    let orphans = 0;
    for (const s of saves) {
      const o = await prisma.opportunity.findUnique({ where: { id: s.opportunityId } });
      if (!o) {
        await prisma.savedOpportunity.delete({ where: { id: s.id } });
        orphans++;
      }
    }
    console.log(
      JSON.stringify({ opportunities: opps.count, signals: sigs.count, clusters: clus.count, orphanSaves: orphans })
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
