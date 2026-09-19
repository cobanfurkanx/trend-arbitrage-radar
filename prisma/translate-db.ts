import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { SCORING_WEIGHTS } from "../src/lib/config/scoring";
import type { ScoreKey, SubScore } from "../src/lib/types";

const MVP_MAP: Record<string, string> = {
  "<1 day": "<1 gün",
  "<3 days": "<3 gün",
  "<1 week": "<1 hafta",
  ">1 week": ">1 hafta",
};

const MODEL_MAP: Record<string, string> = {
  Affiliate: "Satış ortaklığı",
  "Featured listings": "Öne çıkan listeleme",
  Subscription: "Abonelik",
  "Lead generation": "Potansiyel müşteri üretimi",
  Freemium: "Freemium",
  "Pro tier": "Pro paket",
  SaaS: "SaaS",
  "Usage-based": "Kullanım bazlı",
  "Agency white-label": "Ajans beyaz etiket",
  "Open-core": "Açık çekirdek",
  Enterprise: "Kurumsal",
  "Per-seat": "Kullanıcı başı",
  "OSS add-on": "Açık kaynak eklenti",
  "Revenue-share": "Gelir paylaşımı",
  "Affiliate (registrars)": "Satış ortaklığı (kayıt firmaları)",
  "Affiliate (retail)": "Satış ortaklığı (perakende)",
  "Pay-per-tailor": "İşlem başı ödeme",
  "Pay-per-review": "İnceleme başı ödeme",
  Sponsorships: "Sponsorluklar",
  Templates: "Şablonlar",
  API: "API",
  "API usage": "API kullanımı",
  "SDK license": "SDK lisansı",
};

function parse<T>(s: string, fallback: T): T {
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const labels = new Map(SCORING_WEIGHTS.map((w) => [w.key, w.label]));
    const rows = await prisma.opportunity.findMany({
      select: {
        id: true,
        estimatedMvpTime: true,
        suggestedBusinessModel: true,
        scoreBreakdown: true,
      },
    });
    let mvp = 0;
    let models = 0;
    let breakdowns = 0;
    for (const r of rows) {
      const data: Record<string, unknown> = {};
      const nextMvp = MVP_MAP[r.estimatedMvpTime];
      if (nextMvp) {
        data.estimatedMvpTime = nextMvp;
        mvp++;
      }
      const current = parse<string[]>(r.suggestedBusinessModel, []);
      const nextModels = current.map((m) => MODEL_MAP[m] ?? m);
      if (JSON.stringify(nextModels) !== JSON.stringify(current)) {
        data.suggestedBusinessModel = JSON.stringify(nextModels);
        models++;
      }
      const bd = parse<SubScore[]>(r.scoreBreakdown, []);
      let touched = false;
      for (const s of bd) {
        const label = labels.get(s.key as ScoreKey);
        if (label && s.label !== label) {
          s.label = label;
          touched = true;
        }
      }
      if (touched) {
        data.scoreBreakdown = JSON.stringify(bd);
        breakdowns++;
      }
      if (Object.keys(data).length > 0) {
        await prisma.opportunity.update({ where: { id: r.id }, data });
      }
    }
    const cleared = await prisma.opportunity.updateMany({ data: { fingerprint: "" } });
    console.log(
      JSON.stringify({ mvpTimes: mvp, businessModels: models, breakdowns, fingerprintsCleared: cleared.count })
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
