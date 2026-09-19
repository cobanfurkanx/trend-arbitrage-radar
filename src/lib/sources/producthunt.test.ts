import { afterEach, expect, it, vi } from "vitest";
import { productHuntProvider } from "./producthunt";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
it("rejects HTTP 200 GraphQL errors instead of reporting an empty successful source", async () => {
  vi.stubEnv("PRODUCT_HUNT_TOKEN", "test-only");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ errors: [{ message: "Not authorized" }] }))));
  await expect(productHuntProvider.fetchItems()).rejects.toThrow("PH_GRAPHQL_ERROR");
});
it("rejects missing GraphQL data but accepts a real empty result", async () => {
  vi.stubEnv("PRODUCT_HUNT_TOKEN", "test-only");
  const fetch = vi.fn().mockResolvedValueOnce(new Response("{}"))
    .mockResolvedValueOnce(new Response(JSON.stringify({ data: { posts: { edges: [] } } })));
  vi.stubGlobal("fetch", fetch);
  await expect(productHuntProvider.fetchItems()).rejects.toThrow("PH_INVALID_RESPONSE");
  await expect(productHuntProvider.fetchItems()).resolves.toEqual([]);
});
it("collects newest products with full context and an outbound website", async () => {
  vi.stubEnv("PRODUCT_HUNT_TOKEN", "test-only");
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { posts: { edges: [{ node: {
    name: "Invoices", tagline: "Invoice reminders", description: "Tracks late invoices for agencies.",
    website: "https://invoices.example", url: "https://www.producthunt.com/posts/invoices", votesCount: 2, createdAt: "2026-09-18T00:00:00Z",
  } }] } } })));
  vi.stubGlobal("fetch", fetch);
  const items = await productHuntProvider.fetchItems();
  expect(items[0].description).toContain("Tracks late invoices");
  expect(items[0].rawData?.productUrl).toBe("https://invoices.example");
  expect(JSON.parse(fetch.mock.calls[0][1].body).query).toContain("NEWEST");
});
