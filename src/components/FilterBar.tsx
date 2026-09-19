"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { CATEGORIES, CATEGORY_LABELS, EARLY_SIGNAL_LABELS, EARLY_SIGNALS } from "@/lib/config/scoring";

const SCORE_OPTS = [
  { value: "All", label: "Skor: tümü" },
  { value: "80", label: "Skor 80+" },
  { value: "70", label: "Skor 70+" },
  { value: "60", label: "Skor 60+" },
];
const BUILD_OPTS = [
  { value: "All", label: "Süre: tümü" },
  { value: "<1 gün", label: "<1 gün" },
  { value: "<3 gün", label: "<3 gün" },
  { value: "<1 hafta", label: "<1 hafta" },
  { value: ">1 hafta", label: ">1 hafta" },
];
const PROFIT_OPTS = [
  { value: "All", label: "Kazanç: tümü" },
  { value: "70", label: "Kazanç 70+" },
  { value: "80", label: "Kazanç 80+" },
];

function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input w-auto py-1.5 text-xs"
      aria-label={label}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-paper-card">
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function FilterBar({
  category,
  score,
  early,
  build,
  profit,
  q,
}: {
  category: string;
  score: string;
  early: string;
  build: string;
  profit: string;
  q: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function push(next: Record<string, string>) {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === "All") p.delete(k);
      else p.set(k, v);
    }
    const qs = p.toString();
    router.push(`/dashboard${qs ? `?${qs}` : ""}`);
  }

  function clearAll() {
    router.push("/dashboard");
  }

  const catOpts = [{ value: "All", label: "Kategori: tümü" }, ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))];
  const earlyOpts = [
    { value: "All", label: "Aşama: tümü" },
    ...EARLY_SIGNALS.map((e) => ({ value: e, label: EARLY_SIGNAL_LABELS[e] })),
  ];

  const active: { key: string; label: string; clear: () => void }[] = [];
  if (category !== "All")
    active.push({
      key: "category",
      label: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category,
      clear: () => push({ category: "All" }),
    });
  if (score !== "All")
    active.push({ key: "score", label: `Skor ${score}+`, clear: () => push({ score: "All" }) });
  if (early !== "All")
    active.push({
      key: "early",
      label: EARLY_SIGNAL_LABELS[early as keyof typeof EARLY_SIGNAL_LABELS] ?? early,
      clear: () => push({ early: "All" }),
    });
  if (build !== "All")
    active.push({ key: "build", label: `MVP ${build}`, clear: () => push({ build: "All" }) });
  if (profit !== "All")
    active.push({ key: "profit", label: `Kazanç ${profit}+`, clear: () => push({ profit: "All" }) });
  if (q) active.push({ key: "q", label: `“${q}”`, clear: () => push({ q: "" }) });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Fırsat filtreleri">
        <span className="kicker" aria-hidden>
          Süz
        </span>
        <FilterSelect label="Kategori" value={category} onChange={(v) => push({ category: v })} options={catOpts} />
        <FilterSelect label="Skor" value={score} onChange={(v) => push({ score: v })} options={SCORE_OPTS} />
        <FilterSelect label="Aşama" value={early} onChange={(v) => push({ early: v })} options={earlyOpts} />
        <FilterSelect label="Yapım süresi" value={build} onChange={(v) => push({ build: v })} options={BUILD_OPTS} />
        <FilterSelect label="Kazanç skoru" value={profit} onChange={(v) => push({ profit: v })} options={PROFIT_OPTS} />
      </div>
      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-ink-faint">Aktif: {active.length}</span>
          {active.map((a) => (
            <button
              key={a.key}
              onClick={a.clear}
              className="inline-flex items-center gap-1 border border-line bg-paper-card px-2 py-0.5 text-xs text-ink hover:border-ink-dim"
              aria-label={`${a.label} filtresini kaldır`}
            >
              {a.label}
              <X size={12} aria-hidden />
            </button>
          ))}
          <button onClick={clearAll} className="text-xs font-medium text-brick underline-offset-2 hover:underline">
            Temizle
          </button>
        </div>
      )}
    </div>
  );
}
