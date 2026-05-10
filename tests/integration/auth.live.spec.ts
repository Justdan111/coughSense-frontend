import { test, expect } from "@playwright/test"
import {
  backendIsReachable,
  isRateLimited,
  registerOrThrow,
  TEST_PASSWORD,
  uniqueEmail,
} from "./_helpers"

/**
 * Real-backend auth smoke. Two layers:
 *
 *   1. **API-level**: drive the Next.js route handlers directly via
 *      Playwright's `request` fixture — proves the proxy + FastAPI +
 *      Supabase chain is wired up correctly.
 *   2. **UI-level**: a single happy-path login flow, plus the bogus-creds
 *      flow which the app currently handles by hard-redirecting to /login
 *      (the response interceptor in src/lib/axios.ts does
 *      `window.location.href = "/login"` on any 401).
 *
 * Each test individually skips itself if FASTAPI_URL is unreachable.
 */
test.describe.configure({ mode: "serial" })

test.describe("Integration — auth (real FastAPI)", () => {
  test("API: register → login → /me round-trip", async ({ request }) => {
    test.skip(
      !(await backendIsReachable(request)),
      "FastAPI backend unreachable"
    )

    const email = uniqueEmail("api")

    // 1) Register
    const { status: regStatus, body: registerBody } = await registerOrThrow(
      request,
      email,
      TEST_PASSWORD,
      "API Tester"
    )
    test.skip(
      isRateLimited(regStatus, registerBody),
      `Supabase rate-limited the register call: ${JSON.stringify(registerBody)}`
    )
    expect(
      regStatus,
      `register should be 2xx, got ${regStatus} ${JSON.stringify(registerBody)}`
    ).toBeLessThan(300)
    // Backend wraps the auth payload under `user`.
    const userObj = registerBody.user as Record<string, unknown> | undefined
    const accessTokenFromRegister =
      (userObj?.access_token as string | undefined) ??
      (registerBody.access_token as string | undefined)
    expect(accessTokenFromRegister, "got access_token from register").toBeTruthy()

    // 2) Login
    const loginRes = await request.post("/api/auth/login", {
      data: { email, password: TEST_PASSWORD },
    })
    expect(loginRes.status(), "login should be 2xx").toBeLessThan(300)
    const loginBody = await loginRes.json()
    const accessToken: string = loginBody.access_token
    expect(accessToken).toBeTruthy()
    // Login uses a flat shape: {access_token, token_type, user:{id,email}}
    expect(loginBody.user?.email).toBe(email)

    // 3) /me with that token (Next.js can be slow to JIT this route).
    const meRes = await request.get("/api/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 30_000,
    })
    expect(meRes.status(), "/me should be 2xx").toBeLessThan(300)
    const meBody = await meRes.json()
    expect(meBody.email).toBe(email)
  })

  test("API: invalid login returns 401 with detail message", async ({
    request,
  }) => {
    test.skip(
      !(await backendIsReachable(request)),
      "FastAPI backend unreachable"
    )

    const res = await request.post("/api/auth/login", {
      data: {
        email: uniqueEmail("nope"),
        password: "wrong-password-xyz",
      },
    })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.detail).toBeTruthy()
  })

  test("UI: valid login lands on /dashboard with auth cookie", async ({
    page,
    request,
  }) => {
    test.skip(
      !(await backendIsReachable(request)),
      "FastAPI backend unreachable"
    )

    // Pre-register through the API so we have a known good account.
    const email = uniqueEmail("uilogin")
    const { status: regStatus, body: regBody } = await registerOrThrow(
      request,
      email,
      TEST_PASSWORD,
      "UI Login Tester"
    )
    test.skip(
      isRateLimited(regStatus, regBody),
      `Supabase rate-limited the register call: ${JSON.stringify(regBody)}`
    )
    expect(
      regStatus,
      `register should be 2xx, got ${regStatus} ${JSON.stringify(regBody)}`
    ).toBeLessThan(300)

    await page.goto("/login")
    await page.getByTestId("login-email").fill(email)
    await page.getByTestId("login-password").fill(TEST_PASSWORD)
    await page.getByTestId("login-submit").click()

    await page.waitForURL("**/dashboard", { timeout: 30_000 })
    await expect(page.getByTestId("sidebar")).toBeVisible()

    const cookies = await page.context().cookies()
    expect(cookies.find((c) => c.name === "access_token")?.value).toBeTruthy()
  })

  test("UI: bogus credentials end up back on /login (401 interceptor)", async ({
    page,
    request,
  }) => {
    test.skip(
      !(await backendIsReachable(request)),
      "FastAPI backend unreachable"
    )

    await page.goto("/login")
    await page.getByTestId("login-email").fill(uniqueEmail("nope"))
    await page.getByTestId("login-password").fill("wrong-password-xyz")

    // The axios response interceptor does `window.location.href = "/login"`
    // on any 401, which is a full reload. We just assert we end up there.
    const submitClick = page.getByTestId("login-submit").click()
    await Promise.race([
      page.waitForURL(/\/login/, { timeout: 20_000 }),
      submitClick,
    ])
    await expect(page).toHaveURL(/\/login$/)

    // Cookie/localStorage should be empty (the interceptor clears them).
    const cookies = await page.context().cookies()
    expect(cookies.find((c) => c.name === "access_token")).toBeUndefined()
  })
})
