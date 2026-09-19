"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/AuthLayout";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Signup failed.");
        return;
      }
      router.push("/onboarding");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Hesabını oluştur" subtitle="Trend avına başla.">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div>
          <label className="label">İsim (opsiyonel)</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Kurucu" />
        </div>
        <div>
          <label className="label">E-posta</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Şifre</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="en az 6 karakter" required />
        </div>
        {error && <p className="text-xs text-brick-deep">{error}</p>}
        <button disabled={busy} className="btn-primary mt-1 py-2">
          {busy ? "Oluşturuluyor…" : "Hesap Oluştur"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-ink-soft">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="text-brick hover:underline">
          Giriş yap
        </Link>
      </p>
    </AuthLayout>
  );
}
