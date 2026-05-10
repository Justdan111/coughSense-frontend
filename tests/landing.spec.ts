import { test, expect } from "./fixtures/test"

// Landing page does not require auth. Override the per-project storageState
// so this suite runs with a clean unauthenticated browser.
test.use({ storageState: { cookies: [], origins: [] } })

test.describe("Landing page", () => {
  test("renders header with login + get-started CTAs when logged out", async ({
    page,
    api,
  }) => {
    await api()
    await page.goto("/")

    await expect(page.getByTestId("header-login")).toBeVisible()
    await expect(page.getByTestId("header-get-started")).toBeVisible()
  })

  test("clicking 'Log in' navigates to /login", async ({ page, api }) => {
    await api()
    await page.goto("/")

    await page.getByTestId("header-login").click()
    await page.waitForURL("**/login")
    await expect(page.getByTestId("login-form")).toBeVisible()
  })

  test("clicking 'Get Started' navigates to /login", async ({ page, api }) => {
    await api()
    await page.goto("/")

    await page.getByTestId("header-get-started").click()
    await page.waitForURL("**/login")
  })

  test("mobile menu toggles on small viewports", async ({ page, api }) => {
    await api()
    await page.setViewportSize({ width: 375, height: 720 })
    await page.goto("/")

    const toggle = page.getByTestId("header-mobile-toggle")
    await expect(toggle).toBeVisible()

    await toggle.click()
    await expect(page.getByTestId("header-login-mobile")).toBeVisible()
    await expect(page.getByTestId("header-get-started-mobile")).toBeVisible()
  })

  test("page title is set", async ({ page, api }) => {
    await api()
    await page.goto("/")
    await expect(page).toHaveTitle(/cough/i)
  })
})
