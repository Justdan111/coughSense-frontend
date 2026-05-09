import { test, expect, TEST_USER } from "./fixtures/test"

test.describe("Profile page", () => {
  test("displays user info from auth state", async ({ page, api }) => {
    await api()
    await page.goto("/profile")

    await expect(page.getByTestId("profile-email")).toContainText(
      TEST_USER.email
    )
    await expect(page.getByTestId("profile-user-id")).toContainText(TEST_USER.id)
    await expect(page.getByTestId("profile-name")).toHaveValue(TEST_USER.name)
  })

  test("editing the name calls PATCH /api/auth/account with the new value", async ({
    page,
    api,
  }) => {
    await api()
    await page.goto("/profile")

    const nameInput = page.getByTestId("profile-name")
    await nameInput.fill("Renamed Test User")

    const [request] = await Promise.all([
      page.waitForRequest(
        (req) =>
          req.url().includes("/api/auth/account") && req.method() === "PATCH"
      ),
      page.getByTestId("profile-save").click(),
    ])

    expect(request.postDataJSON()).toEqual({ name: "Renamed Test User" })
    await expect(page.getByTestId("profile-save-success")).toBeVisible()
  })

  test("toggling consent persists in localStorage", async ({ page, api }) => {
    await api()
    await page.goto("/profile")

    const consent = page.getByTestId("profile-consent")
    await expect(consent).not.toBeChecked()
    await consent.check()
    await expect(consent).toBeChecked()

    const stored = await page.evaluate(() => localStorage.getItem("consent"))
    expect(stored).toBe("true")

    await consent.uncheck()
    const storedAfter = await page.evaluate(() =>
      localStorage.getItem("consent")
    )
    expect(storedAfter).toBe("false")
  })

  test("logout clears auth and redirects to landing", async ({
    page,
    api,
    autoAcceptDialogs,
  }) => {
    await api()
    autoAcceptDialogs()
    await page.goto("/profile")

    await page.getByTestId("profile-logout").click()
    await page.waitForURL((url) => url.pathname === "/", { timeout: 15_000 })

    const cookies = await page.context().cookies()
    expect(cookies.find((c) => c.name === "access_token")).toBeUndefined()
    const stored = await page.evaluate(() =>
      localStorage.getItem("cough_triage_user")
    )
    expect(stored).toBeNull()
  })
})

test.describe("Sidebar nav", () => {
  test("navigates between sections", async ({ page, api }) => {
    await api()
    await page.goto("/dashboard")

    await page.getByTestId("nav-history").click()
    await page.waitForURL("**/history")

    await page.getByTestId("nav-account").click()
    await page.waitForURL("**/profile")

    await page.getByTestId("nav-analyze").click()
    await page.waitForURL("**/dashboard")
  })

  test("active link is highlighted", async ({ page, api }) => {
    await api()
    await page.goto("/history")
    await expect(page.getByTestId("nav-history")).toHaveAttribute(
      "data-active",
      "true"
    )
  })
})
