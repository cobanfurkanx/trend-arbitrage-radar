"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function RefreshButton({ label = "Verileri Yenile" }: { label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  async function run() {
    setBusy(true);
    setDone(false);
    setFailed(false);
    try {
      const res = await fetch("/api/ingest", { method: "POST" });
      if (!res.ok) {
        
        setFailed(true);
        setTimeout(() => setFailed(false), 3000);
        return;
      }
      router.refresh();
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch {
      setFailed(true);
      setTimeout(() => setFailed(false), 3000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={run} disabled={busy} className="btn-ghost py-1.5 text-xs">
      <RefreshCw size={13} className={busy ? "animate-spin" : ""} />
      {busy ? "Alınıyor…" : failed ? "Kilitli (yenileme cron'da)" : done ? "Güncellendi" : label}
    </button>
  );
}
