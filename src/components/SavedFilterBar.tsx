"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SAVED_STATUS_OPTIONS } from "@/lib/config/scoring";

export function SavedFilterBar({ status }: { status: string }) {
  const router = useRouter();
  const params = useSearchParams();
  function update(v: string) {
    const p = new URLSearchParams(params.toString());
    if (!v || v === "All") p.delete("status");
    else p.set("status", v);
    router.push(`/saved?${p.toString()}`);
  }
  return (
    <label className="flex items-center gap-1.5 text-xs text-ink-soft">
      <span className="hidden lg:block">Durum</span>
      <select
        value={status}
        onChange={(e) => update(e.target.value)}
        className="input w-auto py-1.5 text-xs"
        aria-label="Duruma göre filtrele"
      >
        <option value="All" className="bg-paper-card">
          Tümü
        </option>
        {SAVED_STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value} className="bg-paper-card">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
