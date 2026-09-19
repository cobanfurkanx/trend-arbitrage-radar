import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://localhost:3101", channel: process.env.CI ? "chromium" : "msedge", headless: true, screenshot: "only-on-failure" },
  outputDir: ".radar/test-results",
  webServer: { command: "node scripts/preview-free.mjs", url: "http://localhost:3101", reuseExistingServer: !process.env.CI, timeout: 30000 },
});
