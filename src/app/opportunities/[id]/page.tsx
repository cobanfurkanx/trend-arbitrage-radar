import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { SaveButton } from "@/components/SaveButton";
import { BuildPlanButton } from "@/components/BuildPlanModal";
import { DataNote, Dot, Eyebrow, FactRow, Rule, ScoreFigure, SectionHead } from "@/components/editorial";
import { getOpportunity, getCluster } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { CATEGORY_LABELS, EARLY_SIGNAL_LABELS, SOURCE_LABELS } from "@/lib/config/scoring";
import {
  firstMoverWindow,
  formatDate,
  relativeTime,
  scoreLabel,
  windowDot,
  windowLabel,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OpportunityDetail({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();
  const opp = await getOpportunity(params.id, user.id);
  if (!opp) notFound();

  const cluster = opp.trendSignalIds.length
    ? await getCluster(`clu_${opp.id.replace(/^opp_/, "")}`).catch(() => null)
    : null;

  const signals = opp.signals ?? [];
  const window = firstMoverWindow(opp.earlySignal, opp.competitionGap);
  const singleSource = signals.length <= 1;

  return (
    <AppShell>
      <Link
        href="/dashboard"
        className="mb-5 inline-flex items-center gap-1 text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
      >
        <ArrowLeft size={14} aria-hidden /> Fırsatlara dön
      </Link>

      <Eyebrow>
        Araştırma dosyası · {CATEGORY_LABELS[opp.category]} · {EARLY_SIGNAL_LABELS[opp.earlySignal]}
        {opp.isDemo ? " · Demo verisi" : ""}
      </Eyebrow>
      <h1 className="mt-2 max-w-3xl font-serif text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
        {opp.title}
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{opp.summary}</p>
      <p className="mt-3 text-xs text-ink-faint">
        İlk görülme {formatDate(opp.createdAt)} · Güncelleme {relativeTime(opp.updatedAt)}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_290px]">
        <div className="min-w-0">
          <section aria-labelledby="sec-ozet">
            <SectionHead index="01" title="Özet" />
            <p className="max-w-2xl text-[15px] leading-relaxed text-ink">{opp.summary}</p>
          </section>

          <Rule className="my-8" />

          <section aria-labelledby="sec-neden">
            <SectionHead index="02" title="Neden şimdi" />
            <div className="flex max-w-2xl flex-col gap-4 text-[15px] leading-relaxed">
              <p>
                <span className="font-medium text-ink">Gözlem: </span>
                <span className="text-ink-soft">{opp.whyNow}</span>
              </p>
              <p>
                <span className="font-medium text-ink">Değişim: </span>
                <span className="text-ink-soft">{opp.whatIsChanging}</span>
              </p>
              <p>
                <span className="font-medium text-ink">Motivasyon: </span>
                <span className="text-ink-soft">{opp.whyPeopleCare}</span>
              </p>
            </div>
          </section>

          <Rule className="my-8" />

          <section aria-labelledby="sec-kanit">
            <SectionHead
              index="03"
              title="Kaynaklar ve kanıtlar"
              aside={`${signals.length} sinyal · ${cluster?.sourceCount ?? signals.length} bağımsız kaynak`}
            />
            {singleSource && (
              <div className="mb-4 max-w-2xl">
                <DataNote>
                  Tek kaynak: bu dosya henüz doğrulanmamış bir erken sinyaldir. Karar
                  vermeden önce kaynağı açıp ham kanıtı incele.
                </DataNote>
              </div>
            )}
            <ol className="flex flex-col">
              {signals.map((s, i) => (
                <li key={s.id} className="border-t border-line py-3 last:border-b">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-xs text-ink-faint tnum">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm font-medium text-ink">
                      {SOURCE_LABELS[s.source] ?? s.source}
                    </span>
                    <span className="text-xs text-ink-faint">
                      {formatDate(s.publishedAt)} · {s.engagement} etkileşim
                    </span>
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-brick underline-offset-2 hover:underline"
                    >
                      Kaynağı aç <ArrowUpRight size={12} aria-hidden />
                    </a>
                  </div>
                  <p className="mt-1 text-sm font-medium text-ink">{s.title}</p>
                  {s.description && (
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">
                      <span className="text-ink-faint">Gözlem: </span>
                      {s.description}
                    </p>
                  )}
                </li>
              ))}
              {signals.length === 0 && (
                <li className="border-t border-line py-3 text-sm text-ink-dim">
                  Bu dosyaya bağlı sinyal kaydı yok.
                </li>
              )}
            </ol>
          </section>

          <Rule className="my-8" />

          <section aria-labelledby="sec-tr">
            <SectionHead index="04" title="Türkiye açısından fırsat" />
            <div className="max-w-2xl">
              <FactRow term="Türkiye uyumu">
                <span className="tnum">
                  {opp.turkeyFit}/100 · Rekabet boşluğu {opp.competitionGap}/100
                </span>
              </FactRow>
              <FactRow term="Önerilen açı">{opp.suggestedTurkishAngle}</FactRow>
              <FactRow term="Yerelleştirme">{opp.localizationNotes}</FactRow>
              <FactRow term="Kazanç modelleri">{opp.suggestedBusinessModel.join(" · ") || "—"}</FactRow>
              <FactRow term="Pencere">
                <Dot tone={windowDot(window)} label={windowLabel(window)} />
              </FactRow>
            </div>
          </section>

          <Rule className="my-8" />

          <section aria-labelledby="sec-yapim">
            <SectionHead index="05" title="Yapım planı" />
            <div className="max-w-2xl">
              <FactRow term="Tahmini MVP süresi">{opp.estimatedMvpTime}</FactRow>
              <FactRow term="Karmaşıklık">
                {opp.buildability >= 80 ? "Düşük" : opp.buildability >= 70 ? "Orta" : "Yüksek"}
              </FactRow>
              <FactRow term="Yapılabilirlik">
                <span className="tnum">{opp.buildability}/100</span>
              </FactRow>
            </div>
            <div className="mt-4">
              <BuildPlanButton opportunityId={opp.id} />
            </div>
          </section>
        </div>

        <aside aria-label="Skor ve eylemler" className="lg:border-l lg:border-line lg:pl-6">
          <Eyebrow>Skor</Eyebrow>
          <div className="mt-2">
            <ScoreFigure score={opp.overallScore} label={scoreLabel(opp.overallScore)} />
          </div>
          <div className="mt-4">
            <DataNote>
              Skor bir öncelik sırasıdır, güven düzeyi değildir. Dayanağı aşağıda,
              kalem kalem açık.
            </DataNote>
          </div>
          <div className="mt-5">
            <ScoreBreakdown breakdown={opp.scoreBreakdown} />
          </div>

          <Rule className="my-6" />

          <Eyebrow>Eylemler</Eyebrow>
          <div className="mt-3 flex flex-col items-stretch gap-2">
            <SaveButton opportunityId={opp.id} initialStatus={opp.savedStatus} />
          </div>

          <Rule className="my-6" />

          <Eyebrow>Dosya bilgisi</Eyebrow>
          <dl className="mt-2">
            <FactRow term="Kategori">{CATEGORY_LABELS[opp.category]}</FactRow>
            <FactRow term="Aşama">{EARLY_SIGNAL_LABELS[opp.earlySignal]}</FactRow>
            <FactRow term="Çeşitlilik">
              {cluster ? `%${Math.round(cluster.sourceDiversity * 100)}` : "—"}
            </FactRow>
          </dl>
        </aside>
      </div>
    </AppShell>
  );
}
