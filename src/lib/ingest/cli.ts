import "dotenv/config";
import { runIngestion } from "./run";


runIngestion()
  .then((r) => {
    console.log(
      JSON.stringify(
        {
          opportunities: r.opportunities,
          skippedAi: r.skippedAi,
          pruned: r.pruned,
          filteredBigCo: r.filteredBigCo,
          signals: r.signals,
          clusters: r.clusters,
          durationMs: r.durationMs,
          sources: r.statuses.map(
            (s) => `${s.source}:${s.ok ? s.count : "ERR"}${s.filtered ? `(-${s.filtered})` : ""}`
          ),
        },
        null,
        2
      )
    );
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
