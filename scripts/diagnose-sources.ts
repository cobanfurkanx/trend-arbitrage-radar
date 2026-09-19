import { config } from "dotenv";
import { productHuntProvider } from "../src/lib/sources/producthunt";
import { sourceFailure } from "../src/lib/radar/sources";
config({ path: ".env.local", quiet: true }); config({ quiet: true });
const tokenPresent = !!process.env.PRODUCT_HUNT_TOKEN;
const approved = process.env.RADAR_PH_APPROVED === "true";
console.log(JSON.stringify({ source: "producthunt", tokenPresent, enabledInCollector: tokenPresent && approved, permissionConfigured: approved }));
async function main() {
if (tokenPresent) {
  try {
    const items = await productHuntProvider.fetchItems();
    console.log(JSON.stringify({ api: "ok", items: items.length, withDescription: items.filter((s) => (s.description?.length ?? 0) > 100).length, withWebsite: items.filter((s) => s.rawData?.productUrl).length }));
  } catch (e) { console.log(JSON.stringify({ api: "failed", reason: sourceFailure(e) })); process.exitCode = 1; }
}
}
void main();
