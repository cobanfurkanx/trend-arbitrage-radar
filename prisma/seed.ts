import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { runIngestion } from "../src/lib/ingest/run";
import { INTEREST_OPTIONS } from "../src/lib/config/scoring";

const prisma = new PrismaClient();

async function main() {
  console.log("→ Running ingestion pipeline (collect → cluster → score → opportunity)...");
  const result = await runIngestion();
  console.log(
    `  signals=${result.signals} clusters=${result.clusters} opportunities=${result.opportunities} (${result.durationMs}ms)`
  );
  const ok = result.statuses.filter((s) => s.ok).length;
  console.log(`  sources ok=${ok}/${result.statuses.length}`);

  console.log("→ Creating demo user...");
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const interests = INTEREST_OPTIONS.map((i) => i.value);
  await prisma.user.upsert({
    where: { email: "demo@trendradar.app" },
    update: { passwordHash, isDemo: true },
    create: {
      email: "demo@trendradar.app",
      name: "Demo Founder",
      passwordHash,
      isDemo: true,
      plan: "HUNTER",
      preferences: { create: { interests: JSON.stringify(interests) } },
    },
  });
  console.log("  demo@trendradar.app / demo1234 ready (plan: HUNTER)");

  console.log("✓ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
