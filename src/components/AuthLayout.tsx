import Link from "next/link";
import { Radar } from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 self-center font-serif text-2xl font-semibold tracking-tight text-ink">
        <span className="mr-2 inline-flex h-8 w-8 items-center justify-center border border-line bg-paper-card align-middle text-brick">
          <Radar size={18} aria-hidden />
        </span>
        Trend Radarı
      </Link>
      <div className="border border-line bg-paper-card p-6 sm:p-8">
        <h1 className="font-serif text-2xl font-semibold text-ink">{title}</h1>
        <p className="mb-5 mt-1 text-sm text-ink-soft">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
