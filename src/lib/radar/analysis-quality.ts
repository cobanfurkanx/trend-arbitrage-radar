import type { Analysis } from "./schema";

/** Minimum rejection gates, not a claim of automatic factual verification. */
export function vetAnalysis(a: Analysis): Analysis {
  const validation = a.validation.join(" ");
  const claims = [a.problem, a.turkishAngle, a.builder?.basis].join(" ");
  if (/\b(bildirdi|bildirildi|ulaştı|elde edildi|kanıtlandı|doğrulandı)\b/iu.test(validation)
    || /(?:türkiye[\s\S]{0,180}ilk uygulama|turkish market demand validated|türkiye talebi doğrulanmıştır)/iu.test(claims)) {
    throw new Error("AI_UNSUPPORTED_CLAIMS");
  }
  // A list of revenue metrics is not a plan a builder can execute in 48 hours.
  if (a.validation.filter((s) => /görüş|araştır|ölç|test|dene|topla|sor|ulaş|sun|gönder|oluştur|hazırla|listele|göster|yayınla|gözlem|karşılaştır|doğrula|ön.?satış|teklif|röportaj|anket/iu.test(s)).length < 2) throw new Error("AI_UNSUPPORTED_CLAIMS");
  const b = a.builder;
  if (b && /kaynakta[^.]{0,120}(yok|belirtilm|bilinm)/iu.test(b.basis)
    && (b.upfrontUsd !== null || b.monthlyUsd !== null || b.needsApi === false || b.needsGpu === false || b.needsPrivateData === false)) throw new Error("AI_UNSUPPORTED_CLAIMS");
  return a;
}
