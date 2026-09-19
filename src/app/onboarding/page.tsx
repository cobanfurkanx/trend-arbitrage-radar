"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Radar, ArrowRight } from "lucide-react";
import { INTEREST_OPTIONS } from "@/lib/config/scoring";

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(INTEREST_OPTIONS.map((i) => i.value));
  const [busy, setBusy] = useState(false);

  function toggle(v: string) {
    setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  }

  async function save() {
    setBusy(true);
    try {
      await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: selected }),
      });
      router.push("/dashboard");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-6 self-center font-serif text-2xl font-semibold tracking-tight text-ink">
        Trend Radarı
      </Link>
      <div className="border border-line bg-paper-card p-6">
        <h1 className="font-serif text-2xl font-semibold text-ink">Ne avlamak istiyorsun?</h1>
        <p className="mt-1 text-sm text-ink-soft">
          İlgilendiğin kategorileri seç. Fırsatları sana göre sıralayıp filtreleyelim.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {INTEREST_OPTIONS.map((opt) => {
            const on = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className={`rounded border p-3 text-left transition-colors ${
                  on ? "border-brick bg-brick-tint/50" : "border-line bg-paper-card hover:border-ink-dim"
                }`}
              >
                <div className={`text-sm font-semibold ${on ? "text-ink" : "text-ink-soft"}`}>
                  {opt.label}
                </div>
                <div className="mt-0.5 text-[11px] text-ink-dim">{opt.hint}</div>
              </button>
            );
          })}
        </div>
        <button onClick={save} disabled={busy} className="btn-primary mt-6 w-full py-2">
          {busy ? "Kaydediliyor…" : "Panele devam et"} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
