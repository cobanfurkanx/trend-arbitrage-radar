import { config } from "dotenv";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
config({ path: ".env.local", quiet: true }); config({ quiet: true });
const secrets = Object.entries(process.env).filter(([k, v]) => /(?:KEY|SECRET|TOKEN|PASSWORD)$/.test(k) && v && v.length >= 12).map(([, v]) => v);
let files = 0;
async function check(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    if (item.name.startsWith(".env") || item.name === "state.json" || item.name === ".radar") throw new Error("Private file in export");
    const path = join(dir, item.name);
    if (item.isDirectory()) await check(path);
    else if (item.isFile()) {
      const content = await readFile(path, "utf8");
      if (secrets.some((s) => content.includes(s))) throw new Error("Credential detected in export");
      files++;
    }
  }
}
await check("free/out");
const source = JSON.parse(await readFile("free/public/data/radar.json", "utf8"));
const built = JSON.parse(await readFile("free/out/data/radar.json", "utf8"));
if (JSON.stringify(source) !== JSON.stringify(built)) throw new Error("Built snapshot is stale; rebuild before publishing");
console.log(`Verified ${files} static files; current snapshot; no configured credentials or private state.`);
