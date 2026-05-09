import type { Page, Route } from "@playwright/test"

export const TEST_USER = {
  id: "test-user-id-123",
  email: "test@coughsense.dev",
  name: "Test User",
  password: "Password123",
  access_token: "test-jwt-token-abc123",
}

export interface AssessMockResponse {
  user_id: string
  result: "less_risky" | "risky"
  cough_confidence_pct: number
  score: number
  summary: string
  recommendation: string
  actions: string[]
  disclaimer: string
}

export interface AnalyzeMockResponse {
  user_id: string
  confidence: number
  cough_confidence_pct: number
  severity?: string
  risk_level?: "low" | "medium" | "high"
  summary?: string
  recommendation?: string
  actions?: string[]
  disclaimer?: string
}

export const defaultAnalyzeResponse: AnalyzeMockResponse = {
  user_id: TEST_USER.id,
  confidence: 0.87,
  cough_confidence_pct: 87,
  severity: "moderate",
  risk_level: "low",
  summary: "Cough detected with high confidence.",
  recommendation: "Monitor symptoms.",
  actions: ["Rest", "Stay hydrated"],
  disclaimer: "For triage only.",
}

export const defaultAssessResponse: AssessMockResponse = {
  user_id: TEST_USER.id,
  result: "less_risky",
  cough_confidence_pct: 87,
  score: 30,
  summary: "Your cough pattern looks consistent with a mild upper-respiratory issue.",
  recommendation: "Rest and monitor symptoms over the next 48 hours.",
  actions: [
    "Drink plenty of fluids",
    "Get adequate rest",
    "Monitor for fever or breathing difficulty",
  ],
  disclaimer:
    "This tool is for informational purposes only and is not a substitute for professional medical advice.",
}

export interface MockOverrides {
  login?: (route: Route) => Promise<void> | void
  register?: (route: Route) => Promise<void> | void
  me?: (route: Route) => Promise<void> | void
  account?: (route: Route) => Promise<void> | void
  patchAccount?: (route: Route) => Promise<void> | void
  analyze?: (route: Route) => Promise<void> | void
  assess?: (route: Route) => Promise<void> | void
}

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
})

/**
 * Register default mocks for every API endpoint the frontend calls.
 * Pass `overrides` to replace any handler per-test.
 */
export async function mockApi(page: Page, overrides: MockOverrides = {}) {
  // Auth: login
  await page.route("**/api/auth/login", async (route) => {
    if (overrides.login) return overrides.login(route)
    await route.fulfill(
      json({
        user_id: TEST_USER.id,
        email: TEST_USER.email,
        name: TEST_USER.name,
        access_token: TEST_USER.access_token,
        token_type: "bearer",
      })
    )
  })

  // Auth: register
  await page.route("**/api/auth/register", async (route) => {
    if (overrides.register) return overrides.register(route)
    await route.fulfill(
      json({
        user_id: TEST_USER.id,
        email: TEST_USER.email,
        name: TEST_USER.name,
        access_token: TEST_USER.access_token,
        token_type: "bearer",
      })
    )
  })

  // Auth: me (token verify)
  await page.route("**/api/auth/me", async (route) => {
    if (overrides.me) return overrides.me(route)
    await route.fulfill(
      json({ id: TEST_USER.id, email: TEST_USER.email, name: TEST_USER.name })
    )
  })

  // Auth: account get + patch
  await page.route("**/api/auth/account", async (route) => {
    if (route.request().method() === "PATCH") {
      if (overrides.patchAccount) return overrides.patchAccount(route)
      const body = route.request().postDataJSON() as { name?: string }
      await route.fulfill(
        json({
          id: TEST_USER.id,
          email: TEST_USER.email,
          name: body?.name ?? TEST_USER.name,
        })
      )
      return
    }
    if (overrides.account) return overrides.account(route)
    await route.fulfill(
      json({ id: TEST_USER.id, email: TEST_USER.email, name: TEST_USER.name })
    )
  })

  // Analysis: analyze (audio upload)
  await page.route("**/api/analysis/analyze", async (route) => {
    if (overrides.analyze) return overrides.analyze(route)
    await route.fulfill(json(defaultAnalyzeResponse))
  })

  // Analysis: assess (combined)
  await page.route("**/api/analysis/assess", async (route) => {
    if (overrides.assess) return overrides.assess(route)
    await route.fulfill(json(defaultAssessResponse))
  })
}

/** Helper to fail an endpoint with a given status + message body. */
export const failWith = (status: number, message: string) => async (
  route: Route
) => {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify({ detail: message }),
  })
}
