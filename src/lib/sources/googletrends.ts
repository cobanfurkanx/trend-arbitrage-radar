import type { TrendSource } from "./types";
import { isDemoEnabled } from "./fetch";
import { makeMockProvider } from "./mockBase";




export const googleTrendsProvider: TrendSource = {
  name: "googletrends",
  fetchItems: () =>
    isDemoEnabled() ? makeMockProvider("googletrends").fetchItems() : Promise.resolve([]),
  normalizeItem: (i) => i,
};
