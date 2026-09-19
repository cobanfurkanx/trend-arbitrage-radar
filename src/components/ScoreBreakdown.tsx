import type { SubScore } from "@/lib/types";

export function ScoreBreakdown({ breakdown }: { breakdown: SubScore[] }) {
  return (
    <div className="flex flex-col">
      {breakdown.map((s) => (
        <div key={s.key} className="border-b border-line-soft py-2.5 last:border-0">
          <div className="flex items-baseline justify-between gap-2 text-[13px]">
            <span className="text-ink-soft">{s.label}</span>
            <span className="font-semibold text-ink tnum">{s.value}</span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-sm bg-paper-soft">
            <div className="h-full rounded-sm bg-ink" style={{ width: `${s.value}%` }} />
          </div>
          {s.rationale && (
            <p className="mt-1.5 text-xs leading-relaxed text-ink-dim">{s.rationale}</p>
          )}
        </div>
      ))}
    </div>
  );
}
