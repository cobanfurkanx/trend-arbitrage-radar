import type { TrendSource } from "./types";
import { isDemoEnabled } from "./fetch";
import { makeMockProvider } from "./mockBase";



export const xProvider: TrendSource = {
  name: "x",
  fetchItems: () =>
    isDemoEnabled() ? makeMockProvider("x").fetchItems() : Promise.resolve([]),
  normalizeItem: (i) => i,
};
