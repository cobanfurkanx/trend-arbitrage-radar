import { cn } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("kicker", className)}>{children}</p>;
}

export function Rule({ className }: { className?: string }) {
  return <hr className={cn("rule", className)} aria-hidden />;
}

export function SectionHead({
  index,
  title,
  aside,
}: {
  index?: string;
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="font-serif text-xl font-semibold text-ink">
        {index && <span className="mr-2 text-sm font-normal text-ink-faint tnum">{index}</span>}
        {title}
      </h2>
      {aside && <div className="shrink-0 text-xs text-ink-dim">{aside}</div>}
    </div>
  );
}

export function FactRow({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line-soft py-1.5 text-sm last:border-0">
      <dt className="shrink-0 text-ink-dim">{term}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  );
}

export function ScoreFigure({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-serif text-4xl font-semibold text-ink tnum">{score}</span>
      <span className="text-xs text-ink-dim">/ 100 · {label}</span>
    </div>
  );
}

export function Dot({ tone, label }: { tone: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" title={label}>
      <span aria-hidden className={cn("inline-block h-2 w-2 rounded-[1px]", tone)} />
      {label && <span>{label}</span>}
    </span>
  );
}

export function DataNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-brick bg-brick-tint/60 px-3 py-2 text-xs leading-relaxed text-ink-soft">
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-line bg-paper-card px-6 py-14 text-center">
      <p className="font-serif text-lg text-ink">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-sm text-sm text-ink-dim">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border-t border-line" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 border-b border-line-soft py-4">
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-3 w-2/3" />
          <div className="skeleton h-3 w-1/4" />
        </div>
      ))}
    </div>
  );
}
