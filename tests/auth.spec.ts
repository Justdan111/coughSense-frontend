import { test, expect, TEST_USER } from "./fixtures/test"
import { failWith } from "./fixtures/api-mocks"

// All auth specs run unauthenticated.
test.use({ storageState: { cookies: [], origins: [] } })

test.describe("Login", () => {
  test("renders the login form", async ({ page, api }) => {
    await api()
    await page.goto("/login")
    await expect(page.getByTestId("login-form")).toBeVisible()
    await expect(page.getByTestId("login-email")).toBeVisible()
    await expect(page.getByTestId("login-password")).toBeVisible()
    await expect(page.getByTestId("login-submit")).toBeVisible()
  })

  test("blocks submit when fields are empty (HTML5 validation)", async ({
    page,
    api,
  }) => {
    await api()
    await page.goto("/login")
    await page.getByTestId("login-submit").click()
    // We never navigate away — still on /login.
    await expect(page).toHaveURL(/\/login$/)
  })

  test("password visibility toggle flips type", async ({ page, api }) => {
    await api()
    await page.goto("/login")
    const pwInput = page.getByTestId("login-password")
    await pwInput.fill("secret")
    await expect(pwInput).toHaveAttribute("type", "password")
    await page.getByTestId("login-password-toggle").click()
    await expect(pwInput).toHaveAttribute("type", "text")
  })

  test("valid credentials redirect to /dashboard and persist auth", async ({
    page,
    api,
  }) => {
    await api()
    await page.goto("/login")
    await page.getByTestId("login-email").fill(TEST_USER.email)
    await page.getByTestId("login-password").fill(TEST_USER.password)
    await page.getByTestId("login-submit").click()

    await page.waitForURL("**/dashboard")
    await expect(page.getByTestId("sidebar")).toBeVisible()

    // access_token cookie is set
    const cookies = await page.context().cookies()
    expect(cookies.some((c) => c.name === "access_token")).toBe(true)

    // user is in localStorage
    const stored = await page.evaluate(() =>
      localStorage.getItem("cough_triage_user")
    )
    expect(stored).toContain(TEST_USER.email)
  })

  test("server 401 shows the error block and stays on /login", async ({
    page,
    api,
  }) => {
    await api({ login: failWith(401, "Invalid credentials") })
    await page.goto("/login")
    await page.getByTestId("login-email").fill(TEST_USER.email)
    await page.getByTestId("login-password").fill("wrong-password")
    await page.getByTestId("login-submit").click()

    await expect(page.getByTestId("login-error")).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })

  test("'Sign up' link goes to /register", async ({ page, api }) => {
    await api()
    await page.goto("/login")
    await page.getByTestId("login-signup-link").click()
    await page.waitForURL("**/register")
    await expect(page.getByTestId("register-form")).toBeVisible()
  })
})

test.describe("Register", () => {
  test("renders the register form", async ({ page, api }) => {
    await api()
    await page.goto("/register")
    await expect(page.getByTestId("register-form")).toBeVisible()
    await expect(page.getByTestId("register-name")).toBeVisible()
    await expect(page.getByTestId("register-email")).toBeVisible()
    await expect(page.getByTestId("register-password")).toBeVisible()
    await expect(page.getByTestId("register-confirm")).toBeVisible()
  })

  test("password rules light up as they're satisfied", async ({ page, api }) => {
    await api()
    await page.goto("/register")
    const pw = page.getByTestId("register-password")

    await pw.fill("a")
    await expect(
      page.getByTestId("register-password-rule-length")
    ).toHaveAttribute("data-passed", "false")

    await pw.fill("Abcdef12")
    for (const rule of ["length", "uppercase", "lowercase", "number"]) {
      await expect(
        page.getByTestId(`register-password-rule-${rule}`)
      ).toHaveAttribute("data-passed", "true")
    }
  })

  test("mismatched confirm password shows mismatch indicator", async ({
    page,
    api,
  }) => {
    await api()
    await page.goto("/register")
    await page.getByTestId("register-password").fill("Password123")
    await page.getByTestId("register-confirm").fill("Different1")
    await expect(page.getByTestId("register-confirm-status")).toHaveAttribute(
      "data-match",
      "false"
    )
  })

  test("submit with weak password shows field error", async ({ page, api }) => {
    await api()
    await page.goto("/register")
    await page.getByTestId("register-email").fill("new@example.com")
    await page.getByTestId("register-password").fill("weak")
    await page.getByTestId("register-confirm").fill("weak")
    await page.getByTestId("register-submit").click()
    await expect(page.getByTestId("register-error-password")).toBeVisible()
  })

  test("submit with mismatched passwords shows confirm error", async ({
    page,
    api,
  }) => {
    await api()
    await page.goto("/register")
    await page.getByTestId("register-email").fill("new@example.com")
    await page.getByTestId("register-password").fill("Password123")
    await page.getByTestId("register-confirm").fill("Different1")
    await page.getByTestId("register-submit").click()
    await expect(
      page.getByTestId("register-error-confirmPassword")
    ).toBeVisible()
  })

  test("server-side conflict (duplicate email) renders error", async ({
    page,
    api,
  }) => {
    await api({
      register: failWith(409, "An account with this email already exists"),
    })
    await page.goto("/register")
    await page.getByTestId("register-name").fill("New User")
    await page.getByTestId("register-email").fill("dup@example.com")
    await page.getByTestId("register-password").fill("Password123")
    await page.getByTestId("register-confirm").fill("Password123")
    await page.getByTestId("register-submit").click()

    await expect(page.getByTestId("register-error")).toBeVisible()
    await expect(page).toHaveURL(/\/register$/)
  })

  test("successful signup redirects to /dashboard and stores auth", async ({
    page,
    api,
  }) => {
    await api()
    await page.goto("/register")
    await page.getByTestId("register-name").fill("New User")
    await page.getByTestId("register-email").fill("new@example.com")
    await page.getByTestId("register-password").fill("Password123")
    await page.getByTestId("register-confirm").fill("Password123")
    await page.getByTestId("register-submit").click()

    await page.waitForURL("**/dashboard")
    const cookies = await page.context().cookies()
    expect(cookies.some((c) => c.name === "access_token")).toBe(true)
  })

  test("'Sign in' link goes back to /login", async ({ page, api }) => {
    await api()
    await page.goto("/register")
    await page.getByTestId("register-login-link").click()
    await page.waitForURL("**/login")
  })
})
