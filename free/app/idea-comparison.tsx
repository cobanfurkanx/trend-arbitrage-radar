import type { Card } from "../../src/lib/radar/schema";
import { builderProfile, buyerLabels, commercialEvidence, commercialLabels } from "../../src/lib/radar/builder";
import { revenueFresh, revenueOf } from "../../src/lib/radar/revenue";

const criteria = {
  customer: "Müşteri hipotezi",
  demand: "Türkiye talebi",
  evidence: "Ticari kanıt",
  revenue: "Son 30 gün gelir (USD)",
  mvp: "MVP süresi · tahmin",
  upfront: "Başlangıç bütçesi · tahmin",
  monthly: "Aylık gider · tahmin",
};

export function IdeaComparison({ cards }: { cards: Card[] }) {
  const usd = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  const columns = cards.map((card) => {
    const profile = builderProfile(card);
    const revenue = revenueOf(card);
    return {
      id: card.id,
      title: card.analysis?.title ?? card.title,
      values: {
        customer: card.analysis?.customer || buyerLabels[profile.buyer],
        demand: card.stage === "validated" ? "Kanıtı incelendi" : "Bilinmiyor",
        evidence: commercialLabels[commercialEvidence(card)],
        revenue: revenue?.last30DaysUsd != null && revenueFresh(revenue) ? usd.format(revenue.last30DaysUsd) : "Bilinmiyor",
        mvp: card.analysis ? `${card.analysis.mvpDays} gün` : "Bilinmiyor",
        upfront: profile.upfrontUsd === null ? "Bilinmiyor" : usd.format(profile.upfrontUsd),
        monthly: profile.monthlyUsd === null ? "Bilinmiyor" : usd.format(profile.monthlyUsd),
      },
    };
  });

  return (
    <section className="mb-6 border border-line bg-paper-card p-4" aria-labelledby="idea-comparison">
      <h2 id="idea-comparison" className="font-serif text-2xl">Fikirleri karşılaştır</h2>
      <p className="mt-2 text-xs text-ink-dim">Süre ve bütçe tahmindir. Gelir gözlemi kaynak tarihine aittir.</p>
      <p className="mt-2 text-xs text-ink-dim sm:hidden">Diğer fikirler için tabloyu yana kaydır.</p>
      <div className="mt-4 overflow-x-auto" role="region" aria-labelledby="idea-comparison" tabIndex={0}>
        <table className="w-full text-left text-sm" aria-labelledby="idea-comparison">
          <thead>
            <tr>
              <th className="sticky left-0 min-w-28 bg-paper-card px-2 py-2" scope="col">Ölçüt</th>
              {columns.map((column) => <th className="min-w-40 px-2 py-2 align-top" key={column.id} scope="col">{column.title}</th>)}
            </tr>
          </thead>
          <tbody>
            {(Object.keys(criteria) as (keyof typeof criteria)[]).map((key) => (
              <tr className="border-t border-line" key={key}>
                <th className="sticky left-0 bg-paper-card px-2 py-2 align-top text-xs font-medium text-ink-dim" scope="row">{criteria[key]}</th>
                {columns.map((column) => <td className="px-2 py-2 align-top" key={column.id}>{column.values[key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
