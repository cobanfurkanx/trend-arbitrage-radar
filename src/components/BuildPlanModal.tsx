"use client";

import { useState } from "react";
import { Rocket, X, Check } from "lucide-react";
import { Eyebrow, Rule } from "./editorial";

interface BuildPlan {
  mvpScope: string;
  features: string[];
  landingPageCopy: { headline: string; subheadline: string; cta: string };
  suggestedPricing: string[];
  acquisitionChannels: string[];
  launchStrategy: string[];
  copyChecklist: { clone: string[]; localize: string[]; skip: string[] };
}

export function BuildPlanButton({ opportunityId }: { opportunityId: string }) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<BuildPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/build-plan`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Plan üretilemedi");
      setPlan(data.plan);
      setOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Plan üretilemedi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={generate} disabled={loading} className="btn-primary py-2 text-sm">
        <Rocket size={15} aria-hidden /> {loading ? "Oluşturuluyor…" : "Yapım Planı"}
      </button>

      {open && plan && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#1C1814]/60 p-4 py-10"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="mx-auto w-full max-w-2xl border border-line bg-paper p-6 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="YZ yapım planı"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <Eyebrow>Dosya eki</Eyebrow>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">YZ Yapım Planı</h2>
              </div>
              <button onClick={() => setOpen(false)} className="btn-subtle p-1" aria-label="Kapat">
                <X size={18} aria-hidden />
              </button>
            </div>

            <Rule className="my-5" />

            <Section title="MVP kapsamı">
              <p className="max-w-xl text-sm leading-relaxed text-ink-soft">{plan.mvpScope}</p>
            </Section>

            <Section title={`Temel özellikler (${plan.features.length})`}>
              <ul className="flex max-w-xl flex-col">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 border-b border-line-soft py-1.5 text-sm text-ink last:border-0">
                    <Check size={14} aria-hidden className="mt-0.5 shrink-0 text-moss" /> {f}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Açılış sayfası metni">
              <div className="max-w-xl border-l-2 border-brick pl-3">
                <p className="font-serif text-lg font-semibold text-ink">{plan.landingPageCopy.headline}</p>
                <p className="mt-1 text-sm text-ink-soft">{plan.landingPageCopy.subheadline}</p>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.1em] text-brick">
                  CTA: {plan.landingPageCopy.cta}
                </p>
              </div>
            </Section>

            <Section title="Önerilen fiyatlandırma">
              <ul className="flex max-w-xl flex-col text-sm text-ink">
                {plan.suggestedPricing.map((p) => (
                  <li key={p} className="border-b border-line-soft py-1.5 last:border-0">
                    {p}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Müşteri kazanım kanalları">
              <ul className="flex max-w-xl flex-col text-sm text-ink">
                {plan.acquisitionChannels.map((c) => (
                  <li key={c} className="border-b border-line-soft py-1.5 last:border-0">
                    {c}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Lansman stratejisi">
              <ol className="flex max-w-xl flex-col">
                {plan.launchStrategy.map((s, i) => (
                  <li key={s} className="flex items-start gap-3 border-b border-line-soft py-1.5 text-sm text-ink last:border-0">
                    <span className="text-ink-faint tnum">{i + 1}.</span> {s}
                  </li>
                ))}
              </ol>
            </Section>

            {plan.copyChecklist && (
              <Section title="Kopya rehberi">
                <div className="grid gap-6 sm:grid-cols-3">
                  <CopyList title="Birebir kopyala" items={plan.copyChecklist.clone} />
                  <CopyList title="TR için uyarla" items={plan.copyChecklist.localize} />
                  <CopyList title="v1'de atla" items={plan.copyChecklist.skip} />
                </div>
              </Section>
            )}

            <p className="mt-5 text-xs text-ink-faint">
              YZ katmanı tarafından üretildi. Harekete geçmeden önce kaynaklarla doğrula.
            </p>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-brick-deep">{error}</p>}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <h3 className="kicker mb-2">{title}</h3>
      {children}
    </div>
  );
}

function CopyList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-1 border-b-2 border-ink pb-1 text-xs font-semibold uppercase tracking-[0.1em] text-ink">
        {title}
      </p>
      <ul className="flex flex-col">
        {(items ?? []).map((it) => (
          <li key={it} className="border-b border-line-soft py-1.5 text-[13px] leading-relaxed text-ink-soft last:border-0">
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
