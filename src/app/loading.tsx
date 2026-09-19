export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-ink-dim">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brick" />
        <p className="text-xs">Radar yükleniyor…</p>
      </div>
    </div>
  );
}
