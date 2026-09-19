import "dotenv/config";
import { runIngestion } from "./ingest/run";





const HOURS = Number(process.env.INGEST_INTERVAL_HOURS ?? "12");

let running = false;

async function tick(reason: string) {
  if (running) {
    console.log("[scheduler] previous run still active, skipping");
    return;
  }
  running = true;
  try {
    const r = await runIngestion();
    console.log(
      `[scheduler] ${reason} done in ${Math.round(r.durationMs / 1000)}s: ` +
        `${r.opportunities} analyzed, ${r.skippedAi} skipped, ${r.pruned} pruned, ` +
        `${r.filteredBigCo} big-co filtered, ${r.signals} signals, ${r.clusters} clusters`
    );
  } catch (err) {
    console.error("[scheduler] run failed:", err instanceof Error ? err.message : err);
  } finally {
    running = false;
  }
}

console.log(`[scheduler] every ${HOURS}h — first run now`);
tick("boot");
setInterval(() => tick("interval"), HOURS * 3600 * 1000);
