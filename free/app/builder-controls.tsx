import type { Card } from "../../src/lib/radar/schema";
import { builderProfile, buyerLabels, commercialEvidence, commercialLabels, difficultyLabels, formatLabels, type BuilderFilters } from "../../src/lib/radar/builder";

export function BuilderControls({ value, change, scopeVisible }: { value: BuilderFilters; change: (next: BuilderFilters) => void; scopeVisible: boolean }) {
  function field(key: keyof BuilderFilters, label: string, options: Record<string, string>) {
    return <label className="label mb-0" key={key}>{label}<select aria-label={label} className="input mt-1" value={value[key]} onChange={(e) => change({ ...value, [key]: e.target.value })}>{Object.entries(options).map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></label>;
  }
  return <div className="mb-4 rounded border border-line bg-paper-soft p-4">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {scopeVisible && field("scope", "Yapılabilirlik seçkisi", { solo: "Tek kişi · en fazla 2 hafta", lean: "Düşük bütçeli solo MVP", all: "Tüm adaylar / bilinmeyenler" })}
      {field("buyer", "Kime satılır?", { all: "Tüm müşteri grupları", ...buyerLabels })}
      {field("format", "Ne geliştiririm?", { all: "Tüm ürün türleri", ...formatLabels })}
      {field("evidence", "Ticari kanıt", { all: "Tüm kanıt düzeyleri", ...commercialLabels })}
    </div>
    <details className="mt-3"><summary className="cursor-pointer text-xs font-medium text-ink-soft">Bütçe, zorluk ve bağımlılıklar</summary><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {field("difficulty", "Teknik zorluk", { all: "Tüm zorluklar", ...difficultyLabels })}
      {field("upfront", "Başlangıç bütçesi · USD", { all: "Bütçe sınırı yok", "0": "0 $ tahmini", "50": "En fazla 50 $", "200": "En fazla 200 $", unknown: "Bilinmiyor" })}
      {field("monthly", "Aylık işletme · USD", { all: "Bütçe sınırı yok", "0": "0 $ tahmini", "20": "En fazla 20 $", "50": "En fazla 50 $", unknown: "Bilinmiyor" })}
      {field("dependency", "Altyapı gereksinimi", { all: "Tüm gereksinimler", no_api: "Harici API gerektirmeyen", no_gpu: "GPU gerektirmeyen", no_private_data: "Özel veri gerektirmeyen", unknown: "Gereksinimleri bilinmeyen" })}
      {field("distribution", "Müşteriye erişim", { all: "Tüm erişim düzeyleri", reviewed: "Kanal kanıtı incelendi", hypothesis: "Kanal hipotezi var", unknown: "Bilinmiyor" })}
    </div><p className="mt-3 text-xs leading-relaxed text-ink-dim">Bütçeler AI tahminidir; kendi emeğin, vergi ve müşteri edinimi hariçtir. Bilinmeyen maliyetler bütçe filtrelerine dahil edilmez. Düşük bütçeli seçki: başlangıç ≤50 $, aylık ≤20 $, GPU ve özel veri gerektirmeyen, en fazla 14 günlük MVP.</p></details>
  </div>;
}
const money = (n: number | null) => n === null ? "Bilinmiyor" : `~${n} $`;
const yesNo = (n: boolean | null) => n === null ? "Bilinmiyor" : n ? "Gerekli" : "Gerekmiyor";
export function BuilderBadges({ card }: { card: Card }) {
  const p = builderProfile(card);
  if (p.kind === "tool") return <p className="mt-3 text-xs text-ink-dim">Yapım kaynağı · Lisans ve entegrasyonu incele</p>;
  return <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-ink-soft">
    {[buyerLabels[p.buyer], formatLabels[p.format], `Zorluk: ${difficultyLabels[p.difficulty]}`, commercialLabels[commercialEvidence(card)]].map((label) => <span key={label} className="rounded border border-line bg-paper-soft px-2 py-1">{label}</span>)}
  </div>;
}
export function BuilderSummary({ card }: { card: Card }) {
  const p = builderProfile(card);
  if (p.kind === "tool") return <section className="border border-line bg-paper-card p-5"><h2 className="font-serif text-xl">Yapım kaynağı</h2><p className="mt-2 text-xs text-ink-dim">Yapım aracı; doğrudan satılabilir ürün olarak değerlendirilmedi.</p><p className="mt-3 text-sm">Lisansı, bakım durumunu ve mevcut stackine uygunluğunu incele.</p></section>;
  return <section className="border border-line bg-paper-card p-5"><h2 className="font-serif text-xl">Bunu ben yapabilir miyim?</h2><p className="mt-2 text-xs text-ink-dim">{p.solo ? "Solo MVP adayı · süre ve kapsam tahmini" : "Solo uygunluğu henüz belirlenmedi veya kapsam geniş."}</p><dl className="mt-4 space-y-2 text-xs">{[
    ["Müşteri hipotezi", buyerLabels[p.buyer]], ["Ürün türü", formatLabels[p.format]], ["Zorluk", difficultyLabels[p.difficulty]],
    ["Başlangıç tahmini", money(p.upfrontUsd)], ["Aylık işletme tahmini", money(p.monthlyUsd)],
    ["Harici API", yesNo(p.needsApi)], ["Özel veri erişimi", yesNo(p.needsPrivateData)], ["GPU / güçlü sunucu", yesNo(p.needsGpu)],
  ].map(([k, v]) => <div className="flex justify-between gap-3 border-b border-line-soft pb-2" key={k}><dt className="text-ink-dim">{k}</dt><dd className="text-right">{v}</dd></div>)}</dl><p className="mt-3 text-xs leading-relaxed text-ink-dim">{card.analysis?.builder?.basis ?? "Mevcut metinden sınırlı sınıflandırma. Bütçe ve bağımlılıklar araştırılmadı."}</p><p className="mt-2 text-xs text-ink-faint">Etiketler ve maliyetler tahmindir; ticari kanıt yerine geçmez.</p></section>;
}
