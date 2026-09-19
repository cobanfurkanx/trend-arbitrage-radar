import Link from "next/link";
import { LayoutDashboard, Bookmark, Settings2, Search } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_BADGE } from "@/lib/utils";
import { LogoutButton } from "./LogoutButton";

const NAV = [
  { href: "/dashboard", label: "Fırsatlar", icon: LayoutDashboard },
  { href: "/saved", label: "Kaydedilenler", icon: Bookmark },
  { href: "/admin", label: "Teşhis", icon: Settings2 },
];

export async function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  const user = await getCurrentUser();
  const demoUi = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-baseline gap-2">
            <span className="font-serif text-xl font-semibold tracking-tight text-ink">
              Trend Radarı
            </span>
            <span className="hidden text-[11px] uppercase tracking-[0.14em] text-ink-faint sm:block">
              Araştırma Masası
            </span>
          </Link>

          <nav className="ml-2 flex items-center gap-1" aria-label="Ana gezinti">
            {NAV.map((n) => {
              const isActive = active === n.href;
              const Icon = n.icon;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-1.5 border-b-2 px-2.5 py-1.5 text-sm ${
                    isActive
                      ? "border-brick font-medium text-ink"
                      : "border-transparent text-ink-soft hover:text-ink"
                  }`}
                >
                  <Icon size={15} aria-hidden />
                  <span className="hidden md:block">{n.label}</span>
                </Link>
              );
            })}
          </nav>

          <form action="/dashboard" method="get" className="ml-auto flex items-center" role="search">
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
                aria-hidden
              />
              <input
                name="q"
                placeholder="Fırsat ara…"
                className="input w-36 rounded py-1.5 pl-8 text-sm sm:w-52"
              />
            </div>
          </form>

          {demoUi && (
            <span className="border border-line bg-paper-soft px-2 py-0.5 text-[11px] uppercase tracking-[0.1em] text-ink-dim">
              {DEMO_BADGE}
            </span>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-ink-dim lg:block">{user.email}</span>
              <LogoutButton />
            </div>
          ) : (
            <Link href="/login" className="btn-primary py-1.5 text-sm">
              Giriş Yap
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-line py-5 text-center text-xs text-ink-faint">
        {demoUi
          ? "Trend Arbitraj Radarı · Demo sürüm · Sinyaller, canlı kaynaklar bağlanana kadar sentetiktir."
          : "Trend Arbitraj Radarı · Canlı radar"}
      </footer>
    </div>
  );
}
