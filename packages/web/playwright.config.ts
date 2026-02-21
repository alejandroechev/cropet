import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:1450",
    headless: true,
  },
  webServer: {
    command: "pnpm dev",
    port: 1450,
    reuseExistingServer: true,
  },
});
