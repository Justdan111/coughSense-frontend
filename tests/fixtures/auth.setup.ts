import { test as setup, expect } from "@playwright/test"
import path from "node:path"
import { mockApi, TEST_USER } from "./api-mocks"

const STORAGE_STATE = path.join(__dirname, "..", "..", "playwright", ".auth", "user.json")

setup("authenticate", async ({ page }) => {
  // Mock all auth endpoints so the login UI flow succeeds without a backend.
  await mockApi(page)

  await page.goto("/login")

  await expect(page.getByTestId("login-form")).toBeVisible()
  await page.getByTestId("login-email").fill(TEST_USER.email)
  await page.getByTestId("login-password").fill(TEST_USER.password)
  await page.getByTestId("login-submit").click()

  // After login, useAuth pushes to /dashboard.
  await page.waitForURL("**/dashboard", { timeout: 15_000 })
  await expect(page.getByTestId("sidebar")).toBeVisible()

  // Persist cookies + localStorage for reuse in authenticated test projects.
  await page.context().storageState({ path: STORAGE_STATE })
})
