import { test, expect } from "./fixtures/test"
import { failWith } from "./fixtures/api-mocks"

// Visit protected routes with no auth state.
test.use({ storageState: { cookies: [], origins: [] } })

const protectedRoutes = ["/dashboard", "/history", "/profile"] as const

for (const route of protectedRoutes) {
  test(`unauthenticated access to ${route} redirects to /login`, async ({
    page,
    api,
  }) => {
    await api()
    await page.goto(route)
    await page.waitForURL("**/login", { timeout: 15_000 })
    await expect(page.getByTestId("login-form")).toBeVisible()
  })
}

test("expired session (401 on /api/auth/me) clears storage and redirects", async ({
  page,
  api,
}) => {
  // Pretend we have a stale token + cached user but the server rejects it.
  await api({ me: failWith(401, "token expired") })

  await page.context().addCookies([
    {
      name: "access_token",
      value: "expired-token",
      url: "http://localhost:3000",
    },
  ])
  await page.addInitScript(() => {
    localStorage.setItem(
      "cough_triage_user",
      JSON.stringify({ id: "x", email: "stale@example.com" })
    )
  })

  await page.goto("/dashboard")
  // Auth init should call /me, fail, then redirect.
  await page.waitForURL("**/login", { timeout: 15_000 })
})
