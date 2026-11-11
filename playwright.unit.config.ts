import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results/unit",
  testMatch: "proxy.spec.ts",
  workers: 1,
});
