import { z } from "zod";
import type { Card } from "./schema";
import { builderProfile, buyerLabels, formatLabels } from "./builder";

export const notebookSchema = z.record(z.string(), z.object({
  status: z.enum(["watching", "interviewing", "building", "paid", "dropped"]),
  note: z.string().max(4000),
}));
export type Notebook = z.infer<typeof notebookSchema>;
export function buildPrompt(card: Card): string {
  const a = card.analysis;
  if (!a || builderProfile(card).kind === "tool") return "";
  const p = builderProfile(card);
  return `# ${a.title}\n\nBu bir doğrulanması gereken ürün hipotezidir.\nMüşteri: ${a.customer}\nProblem: ${a.problem}\nTürkiye açısı: ${a.turkishAngle}\n\nÖnce doğrula:\n${a.validation.map((v) => `- ${v}`).join("\n")}\nİptal kriteri: ${a.stopCondition}\n\nDar MVP:\n${a.features.map((v) => `- ${v}`).join("\n")}\n\nYapılabilirlik hipotezi:\nAlıcı grubu: ${buyerLabels[p.buyer]}\nBiçim: ${formatLabels[p.format]}\nBaşlangıç USD tahmini: ${p.upfrontUsd ?? "bilinmiyor"}\nAylık USD tahmini: ${p.monthlyUsd ?? "bilinmiyor"}\nAPI / özel veri / GPU: ${[p.needsApi, p.needsPrivateData, p.needsGpu].map((v) => v === null ? "bilinmiyor" : v ? "gerekli" : "gerekmiyor").join(" / ")}\n${a.builder?.basis ?? "Bütçeyi ve gereksinimleri inşadan önce araştır."}\n\nİnşa talimatları:\n1. Önce mevcut repoyu incele; çalışan UI ve stacki koru.\n2. Bu kapsam için veri modeli ve ölçülebilir kabul kriterleri yaz. Bilinmeyenleri varsayım olarak işaretle.\n3. En küçük uçtan uca kullanıcı akışını kur; sonra kalan özellikleri ekle.\n4. Gizli anahtarları sunucuda tut. Varsayılan olarak ücretli servis kullanma.\n5. Gerçek akışı test et; mock ve doğrulanmamış sonuçları açıkça etiketle.\n6. Her aşamanın çalıştığını doğrulamadan sonraki aşamaya geçme.\n\nİlk müşteri kanalları:\n${a.firstCustomers.map((v) => `- ${v}`).join("\n")}\n\nBilinmeyenler:\n${a.unknowns.map((v) => `- ${v}`).join("\n")}\n\nKaynaklar:\n${card.signals.map((s) => `- ${s.title}: ${s.url}`).join("\n")}\n\nGelir garantisi verme; marka, içerik veya kaynak kodu birebir kopyalama. İş problemini bağımsız bir uygulamayla çöz.`;
}
export function economics(price: number, variable: number, fixed: number) {
  const contribution = price - variable;
  return { contribution, customers: contribution > 0 ? Math.ceil(fixed / contribution) : null };
}
