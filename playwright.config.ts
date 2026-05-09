import { defineConfig, devices } from "@playwright/test"

const PORT = process.env.PORT ?? "3000"
const BASE_URL = `http://localhost:${PORT}`

// Mocked specs (default, no backend needed) and integration specs
// (real FastAPI backend) live side-by-side. Integration specs are
// opt-in via the `integration` project so the default `pnpm run test:e2e`
// stays fast and hermetic.
const INTEGRATION_GLOB = /tests\/integration\/.*\.spec\.ts/
const SETUP_GLOB = /.*\.setup\.ts/

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  outputDir: "./test-results",

  timeout: 30_000,
  expect: { timeout: 7_000 },

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: "setup",
      testMatch: SETUP_GLOB,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: [SETUP_GLOB, INTEGRATION_GLOB],
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: [SETUP_GLOB, INTEGRATION_GLOB],
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: [SETUP_GLOB, INTEGRATION_GLOB],
    },
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: [SETUP_GLOB, INTEGRATION_GLOB],
    },
    {
      name: "mobile-safari",
      use: {
        ...devices["iPhone 13"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: [SETUP_GLOB, INTEGRATION_GLOB],
    },

    // ── Integration: real FastAPI backend at FASTAPI_URL ──────────
    // No auth setup, no storage state, no API mocks. Each spec
    // skips itself if the backend isn't reachable.
    //
    // `fullyParallel: false` → tests within a single integration
    // spec run serially. We also use `test.describe.configure({mode:
    // "serial"})` per file to avoid hammering Supabase + the local
    // dev server with concurrent compiles/auth calls.
    {
      name: "integration",
      testMatch: INTEGRATION_GLOB,
      timeout: 60_000, // analyze can take a while (ML inference)
      fullyParallel: false,
      use: {
        ...devices["Desktop Chrome"],
        storageState: { cookies: [], origins: [] },
        actionTimeout: 30_000,
        navigationTimeout: 30_000,
      },
    },
  ],

  webServer: {
    command: "pnpm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
})
