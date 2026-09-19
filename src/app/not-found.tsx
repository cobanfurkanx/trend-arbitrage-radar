import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="kicker">404</p>
      <h1 className="font-serif text-2xl font-semibold text-ink">Bulunamadı</h1>
      <p className="max-w-sm text-sm text-ink-soft">Bu fırsat veya sayfa mevcut değil.</p>
      <Link href="/dashboard" className="btn-primary py-2">
        Panele dön
      </Link>
    </div>
  );
}
