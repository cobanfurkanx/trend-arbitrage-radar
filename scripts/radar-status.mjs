import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
const snapshot = JSON.parse(await readFile("free/public/data/radar.json", "utf8"));
let used = null;
try {
  const state = JSON.parse(await readFile(resolve(process.env.RADAR_STATE_DIR ?? ".radar", "state.json"), "utf8"));
  used = state.usage[new Date().toISOString().slice(0, 10)] ?? 0;
} catch (error) { if (error.code !== "ENOENT") throw error; }
console.log(JSON.stringify({
  products: snapshot.cards.length,
  analyses: snapshot.cards.filter((c) => c.analysis).length,
  validated: snapshot.cards.filter((c) => c.stage === "validated").length,
  todayAiAttemptsUTC: used,
  lastSuccessfulCollection: snapshot.lastSuccessfulCollection,
  sources: snapshot.sources,
}, null, 2));
