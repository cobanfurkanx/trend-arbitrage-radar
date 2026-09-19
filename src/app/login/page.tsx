"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/AuthLayout";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@trendradar.app");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Tekrar hoş geldin" subtitle="Radarına giriş yap.">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div>
          <label className="label">E-posta</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Şifre</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-xs text-brick-deep">{error}</p>}
        <button disabled={busy} className="btn-primary mt-1 py-2">
          {busy ? "Giriş yapılıyor…" : "Giriş Yap"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-ink-dim">
        Demo hesabı: demo@trendradar.app / demo1234
      </p>
      <p className="mt-2 text-center text-sm text-ink-soft">
        Hesabın yok mu?{" "}
        <Link href="/signup" className="text-brick hover:underline">
          Oluştur
        </Link>
      </p>
    </AuthLayout>
  );
}
