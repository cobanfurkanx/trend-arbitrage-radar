"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "WATCHING", label: "İzleniyor" },
  { value: "BUILDING", label: "Geliştiriliyor" },
  { value: "BUILT", label: "Tamamlandı" },
  { value: "IGNORED", label: "Yoksayıldı" },
];

export function SaveButton({
  opportunityId,
  initialStatus,
}: {
  opportunityId: string;
  initialStatus?: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(initialStatus ?? null);
  const [busy, setBusy] = useState(false);

  async function save(next: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        setStatus(next);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function unsave() {
    setBusy(true);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/save`, { method: "DELETE" });
      if (res.ok) {
        setStatus(null);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  if (!status) {
    return (
      <button
        disabled={busy}
        onClick={() => save("WATCHING")}
        className="btn-ghost py-1.5 text-xs"
      >
        <Bookmark size={14} aria-hidden /> Kaydet
      </button>
    );
  }

  const current = STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];

  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1.5 border border-line bg-paper-soft px-2 py-1 text-xs text-ink">
        <Check size={12} aria-hidden className="text-moss" /> {current.label}
      </span>
      <select
        value={status}
        disabled={busy}
        onChange={(e) => save(e.target.value)}
        className={cn("input w-auto py-1 text-xs")}
        aria-label="Durumu değiştir"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value} className="bg-paper-card">
            {s.label}
          </option>
        ))}
      </select>
      <button onClick={unsave} disabled={busy} className="btn-subtle px-1 text-xs text-ink-dim hover:text-ink" aria-label="Kaydı kaldır">
        ✕
      </button>
    </div>
  );
}
