import { AppShell } from "@/components/AppShell";
import { FilterBar } from "@/components/FilterBar";
import { OpportunityRow } from "@/components/OpportunityRow";
import { RefreshButton } from "@/components/RefreshButton";
import { DataNote, EmptyState, Eyebrow } from "@/components/editorial";
import { requireUser } from "@/lib/auth";
import { listOpportunities, dashboardSummary } from "@/lib/queries";
import type { Category, EarlySignal } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { category?: string; score?: string; early?: string; build?: string; profit?: string; q?: string };
}) {
  const user = await requireUser();

  const category = (searchParams.category as Category | "All") ?? "All";
  const early = (searchParams.early as EarlySignal | "All") ?? "All";
  const build = searchParams.build ?? "All";
  const score = searchParams.score ?? "All";
  const profit = searchParams.profit ?? "All";
  const q = searchParams.q ?? "";

  const [opps, summary] = await Promise.all([
    listOpportunities({
      category,
      early,
      build,
      scoreMin: score && score !== "All" ? Number(score) : undefined,
      profitMin: profit && profit !== "All" ? Number(profit) : undefined,
      q,
      userId: user.id,
    }),
    dashboardSummary(),
  ]);

  return (
    <AppShell active="/dashboard">
      <Eyebrow>Bugünün seçkisi</Eyebrow>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink">Fırsatlar</h1>
        <RefreshButton />
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
        {summary.total} fırsat tarandı · en yüksek skor {summary.topScore} · ortalama{" "}
        {summary.avgScore}
        {q && (
          <>
            {" "}
            · <span className="text-ink">“{q}”</span> araması
          </>
        )}
        . Skor öncelik sırasıdır; tek kaynaklı satırlar doğrulanmamış erken sinyallerdir.
      </p>

      <div className="mt-5 border-y border-line py-3">
        <FilterBar category={category} score={score} early={early} build={build} profit={profit} q={q} />
      </div>

      {opps.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Bu ölçütlere uyan fırsat yok."
            hint={
              q
                ? "Daha genel bir terim dene ya da filtreleri temizle."
                : "Filtreleri gevşet ya da veri alımını yenile."
            }
          />
        </div>
      ) : (
        <div className="border-b border-line">
          {opps.map((o) => (
            <OpportunityRow key={o.id} opp={o} />
          ))}
        </div>
      )}

      <div className="mt-6">
        <DataNote>
          Skor, kaynak sayısı ve etkileşime dayalı bir öncelik hesabıdır; güven düzeyi
          değildir. Kaynak bağlantılarından ham kanıtı her zaman kendin doğrula.
        </DataNote>
      </div>
    </AppShell>
  );
}
