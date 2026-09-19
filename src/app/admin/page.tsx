import { AppShell } from "@/components/AppShell";
import { RefreshButton } from "@/components/RefreshButton";
import { Eyebrow, FactRow, Rule } from "@/components/editorial";
import { requireUser } from "@/lib/auth";
import { adminStatus, dashboardSummary } from "@/lib/queries";
import { collectSignals } from "@/lib/sources";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireUser();
  const [status, summary, { statuses }] = await Promise.all([
    adminStatus(),
    dashboardSummary(),
    collectSignals(),
  ]);

  const stats = [
    ["Fırsatlar", status.opportunities],
    ["Kümeler", status.clusters],
    ["Sinyaller", status.signals],
    ["Kullanıcılar", status.users],
  ] as const;

  return (
    <AppShell active="/admin">
      <Eyebrow>Sistem teşhisi</Eyebrow>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink">
          Veri Alımı
        </h1>
        <RefreshButton label="Alımı çalıştır" />
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Big-tech sinyalleri indie filtresinden geçemez; elenenler kaynak bazında
        sayılır.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-paper-card p-4">
            <dt className="text-xs text-ink-dim">{label}</dt>
            <dd className="mt-1 font-serif text-3xl font-semibold text-ink tnum">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <section aria-label="Kaynak durumu">
          <h2 className="font-serif text-xl font-semibold text-ink">Kaynak durumu</h2>
          <ul className="mt-3 border-t border-line">
            {statuses.map((s) => (
              <li
                key={s.source}
                className="flex items-baseline justify-between gap-3 border-b border-line-soft py-2.5"
              >
                <span className="flex items-center gap-2 text-sm text-ink">
                  <span
                    aria-hidden
                    className={`inline-block h-2 w-2 rounded-[1px] ${s.ok ? "bg-moss" : "bg-brick"}`}
                  />
                  <span className="capitalize">{s.source}</span>
                </span>
                <span className="text-xs text-ink-dim">
                  {s.ok
                    ? `${s.count} sinyal${s.filtered ? ` · ${s.filtered} big-tech elendi` : ""}`
                    : `hata: ${s.error ?? "bilinmiyor"}`}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Alım bilgisi">
          <h2 className="font-serif text-xl font-semibold text-ink">Alım bilgisi</h2>
          <dl className="mt-3 max-w-md">
            <FactRow term="Son alım">
              {summary.lastIngestedAt ? relativeTime(summary.lastIngestedAt) : "—"}
            </FactRow>
            <FactRow term="Mod">
              {process.env.DEMO_MODE !== "false" ? "Demo (sahte sağlayıcılar)" : "Canlı"}
            </FactRow>
            <FactRow term="YZ sağlayıcı">{process.env.AI_PROVIDER ?? "mock"}</FactRow>
            <FactRow term="Veritabanı">SQLite (Postgres&apos;a hazır)</FactRow>
          </dl>
          <Rule className="my-5 max-w-md" />
          <p className="max-w-md text-xs leading-relaxed text-ink-dim">
            Yeni kaynak eklemek: <code>src/lib/sources/</code> altında{" "}
            <code>TrendSource</code> arayüzünü uygula, kayıt defterine ekle. Pipeline
            değişmez.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
