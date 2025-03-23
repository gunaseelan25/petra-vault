import { defineConfig } from "@playwright/test";

export default defineConfig({
  retries: process.env.CI ? 3 : 0,

  timeout: 60 * 1000,

  // Run your local dev server before starting the tests
  webServer: {
    command: "pnpm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
  },

  use: {
    baseURL: "http://localhost:3000",
    permissions: ["clipboard-read", "clipboard-write"],
  },
});
