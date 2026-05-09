import { test, expect } from "./fixtures/test"
import AxeBuilder from "@axe-core/playwright"

const SERIOUS_OR_CRITICAL = ["serious", "critical"]

async function runAxe(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze()
  return results.violations.filter((v) =>
    SERIOUS_OR_CRITICAL.includes(v.impact ?? "")
  )
}

test.describe("Accessibility — public pages", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  for (const route of ["/", "/login", "/register"]) {
    test(`no serious axe violations on ${route}`, async ({ page, api }) => {
      await api()
      await page.goto(route)
      const violations = await runAxe(page)
      expect(
        violations,
        `Found ${violations.length} serious/critical violations on ${route}: ${violations
          .map((v) => v.id)
          .join(", ")}`
      ).toEqual([])
    })
  }
})

test.describe("Accessibility — authenticated pages", () => {
  for (const route of ["/dashboard", "/history", "/profile"]) {
    test(`no serious axe violations on ${route}`, async ({ page, api }) => {
      await api()
      await page.goto(route)
      const violations = await runAxe(page)
      expect(
        violations,
        `Found ${violations.length} serious/critical violations on ${route}: ${violations
          .map((v) => v.id)
          .join(", ")}`
      ).toEqual([])
    })
  }
})
