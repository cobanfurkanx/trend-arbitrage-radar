import type { Card } from "../../src/lib/radar/schema";
import { businessAge, revenueFresh, revenueOf } from "../../src/lib/radar/revenue";

const dollars = (n: number | null) => n === null ? "Bilinmiyor" : new Intl.NumberFormat("tr-TR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
export function RevenuePanel({ card, compact = false }: { card: Card; compact?: boolean }) {
  const r = revenueOf(card);
  if (!r) return null;
  const age = businessAge(r);
  return <section className={`${compact ? "mt-3 bg-paper-soft p-3" : "border border-line bg-paper-soft p-5"}`} aria-label="Gelir verileri">
    <p className="text-xs font-medium">TrustMRR · Ödeme sağlayıcısına bağlı gelir{!revenueFresh(r) ? " · Güncelliğini yitirmiş" : ""}</p>
    <dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
      <div><dt className="text-ink-dim">Son 30 gün gelir</dt><dd className="mt-1 font-serif text-xl">{dollars(r.last30DaysUsd)}</dd></div>
      <div><dt className="text-ink-dim">MRR · aylık tekrarlayan</dt><dd className="mt-1 font-serif text-xl">{dollars(r.mrrUsd)}</dd></div>
      <div><dt className="text-ink-dim">30 günlük gelir değişimi</dt><dd className="mt-1 font-serif text-xl">{r.growth30d === null ? "Bilinmiyor" : `%${r.growth30d.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`}</dd></div>
    </dl>
    <p className="mt-3 text-xs text-ink-dim">{age === null ? "Kuruluş tarihi bilinmiyor" : `Kuruluşundan beri ${age} gün · kaynak beyanı`} · İlk satışa ulaşma süresi bilinmiyor.</p>
    {!compact && <><dl className="mt-3 grid grid-cols-2 gap-3 text-xs"><div><dt>Toplam gelir</dt><dd className="mt-1">{dollars(r.totalUsd)}</dd></div><div><dt>Kâr marjı · sahibinin beyanı</dt><dd className="mt-1">{r.profitMarginReported === null ? "Bilinmiyor" : `%${r.profitMarginReported}`}</dd></div></dl>
      <p className="mt-3 text-xs leading-relaxed text-ink-dim">Gelir, net kâr değildir. Giderler ve marj bağımsız doğrulanmadı. Çok yüksek büyüme düşük başlangıç gelirinden kaynaklanabilir. Bu veri Türkiye talebini veya kolayca kopyalanabilirliği kanıtlamaz.</p>
      <p className="mt-2 text-xs text-ink-dim">Ödeme sağlayıcısı: {r.paymentProvider} · Kaynak senkronizasyonu: {r.syncedAt ? new Date(r.syncedAt).toLocaleString("tr-TR") : "bilinmiyor"}</p>
      <a className="mt-2 inline-block text-xs text-brick underline" href={r.sourceUrl} target="_blank" rel="noopener noreferrer">Gelir kaynağını aç</a>
    </>}
    <p className="mt-2 text-[11px] text-ink-faint">Gözlem: {new Date(r.observedAt).toLocaleString("tr-TR")} · Canlı sayaç değildir.</p>
  </section>;
}
