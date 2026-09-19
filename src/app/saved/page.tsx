import { AppShell } from "@/components/AppShell";
import { OpportunityRow } from "@/components/OpportunityRow";
import { SavedFilterBar } from "@/components/SavedFilterBar";
import { EmptyState, Eyebrow } from "@/components/editorial";
import { requireUser } from "@/lib/auth";
import { getSavedOpportunities } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SavedPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const user = await requireUser();
  const status = searchParams.status ?? "All";
  const saved = await getSavedOpportunities(user.id, status);

  return (
    <AppShell active="/saved">
      <Eyebrow>İzleme listesi</Eyebrow>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink">
          Kaydedilenler
        </h1>
        <SavedFilterBar status={status} />
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        {saved.length} dosya · durum değişimi kartın içinden yapılır.
      </p>

      {saved.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Henüz kaydedilen fırsat yok."
            hint="Bir dosyayı açıp Kaydet'e bas; izleme listen burada birikir."
          />
        </div>
      ) : (
        <div className="mt-2 border-b border-line">
          {saved.map((o) => (
            <OpportunityRow key={o.id} opp={o} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
