import Link from "next/link";
import type { Opportunity } from "@/lib/types";
import { CATEGORY_LABELS, EARLY_SIGNAL_LABELS } from "@/lib/config/scoring";
import {
  firstMoverWindow,
  relativeTime,
  scoreLabel,
  windowDot,
  windowLabel,
} from "@/lib/utils";
import { Dot, ScoreFigure } from "./editorial";
import { SaveButton } from "./SaveButton";

export function OpportunityRow({ opp }: { opp: Opportunity }) {
  const signals = opp.signals ?? [];
  const sources = Array.from(new Set(signals.map((s) => s.source)));
  const latest = signals.length
    ? new Date(Math.max(...signals.map((s) => new Date(s.publishedAt).getTime())))
    : opp.createdAt;
  const window = firstMoverWindow(opp.earlySignal, opp.competitionGap);

  return (
    <article className="grid gap-4 border-t border-line py-5 md:grid-cols-[1fr_230px]">
      <div className="min-w-0">
        <p className="text-xs text-ink-faint">
          {CATEGORY_LABELS[opp.category]} · {EARLY_SIGNAL_LABELS[opp.earlySignal]} ·{" "}
          {relativeTime(opp.createdAt)}
        </p>
        <h3 className="mt-1 font-serif text-xl font-semibold leading-snug text-ink">
          <Link href={`/opportunities/${opp.id}`} className="hover:text-brick-deep hover:underline">
            {opp.title}
          </Link>
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{opp.summary}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          <span className="font-medium">Neden dikkate değer: </span>
          {opp.whyNow}
        </p>
        <p className="mt-2 text-xs text-ink-dim">
          Kanıt: {sources.length > 0 ? sources.join(" · ") : "kaynak yok"} ({signals.length}{" "}
          sinyal) · Son sinyal {relativeTime(latest)} ·{" "}
          <Dot tone={windowDot(window)} label={windowLabel(window)} />
        </p>
      </div>

      <aside className="flex flex-row items-start justify-between gap-4 border-t border-line-soft pt-3 md:flex-col md:items-stretch md:justify-start md:border-0 md:pt-0">
        <div>
          <ScoreFigure score={opp.overallScore} label={scoreLabel(opp.overallScore)} />
          <dl className="mt-3">
            <div className="flex items-baseline justify-between gap-3 border-b border-line-soft py-1 text-[13px] last:border-0">
              <dt className="text-ink-dim">MVP süresi</dt>
              <dd className="text-ink">{opp.estimatedMvpTime}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-line-soft py-1 text-[13px] last:border-0">
              <dt className="text-ink-dim">Kazanç</dt>
              <dd className="text-ink">{opp.suggestedBusinessModel[0] ?? "—"}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-1 text-[13px]">
              <dt className="text-ink-dim">Türkiye uyumu</dt>
              <dd className="tnum text-ink">{opp.turkeyFit}/100</dd>
            </div>
          </dl>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 md:flex-row md:items-center">
          <SaveButton opportunityId={opp.id} initialStatus={opp.savedStatus} />
          <Link href={`/opportunities/${opp.id}`} className="btn-ghost py-1.5 text-xs">
            Dosyayı aç
          </Link>
        </div>
      </aside>
    </article>
  );
}
