# Testing

Playwright is the only test runner in this project. It exercises the app end-to-end against a real Next.js dev server, with all `/api/**` calls mocked at the network layer so the FastAPI backend doesn't need to be running.

---

## Why Playwright (and not Jest + RTL or Cypress)

- The two riskiest flows in CoughSense — auth (cookie + localStorage) and audio capture (`MediaRecorder`) — only behave correctly in a real browser. RTL would mock both into oblivion.
- One tool covers desktop Chrome, Firefox, WebKit, and mobile viewports. CI runs all five projects in parallel.
- First-class network interception (`page.route`) means we can swap the FastAPI backend out of the loop without standing up test infrastructure.

---

## Layout

```
playwright.config.ts             ← projects, webServer, reporters
playwright/.auth/                ← saved storage state (gitignored)
tests/
  fixtures/
    api-mocks.ts                 ← default + override-able route handlers
    auth.setup.ts                ← logs in once, persists state
    sample-cough.wav             ← tiny silent WAV used by upload tests
    test.ts                      ← extended `test` with our fixtures
  landing.spec.ts                ┐
  auth.spec.ts                   │
  protected-routes.spec.ts       │ mocked, hermetic; the default suite
  dashboard-analysis.spec.ts     │ run by `pnpm run test:e2e`
  history.spec.ts                │
  profile.spec.ts                │
  accessibility.spec.ts          ┘
  integration/                   ← real FastAPI backend (opt-in)
    _helpers.ts                  ← reachability probe + unique-email
    auth.live.spec.ts
    analysis.live.spec.ts
```

---

## How auth works in tests

`playwright.config.ts` declares a `setup` project pointing at [`tests/fixtures/auth.setup.ts`](../tests/fixtures/auth.setup.ts). It mocks `/api/auth/*`, runs the UI login flow once, and saves cookies + localStorage to `playwright/.auth/user.json`. Every other project (`chromium`, `firefox`, `webkit`, `mobile-chrome`, `mobile-safari`) declares `dependencies: ["setup"]` and `storageState: "playwright/.auth/user.json"`, so individual specs start logged in.

Specs that need to test *un*authenticated flows opt out at the top of the file:

```ts
test.use({ storageState: { cookies: [], origins: [] } })
```

See [`tests/landing.spec.ts`](../tests/landing.spec.ts) and [`tests/auth.spec.ts`](../tests/auth.spec.ts).

---

## Fixtures

`tests/fixtures/test.ts` extends Playwright's base `test` with four helpers:

| Fixture | Purpose |
|---|---|
| `api(overrides?)` | Registers default handlers for every API endpoint. Pass `overrides` to fail or shape one call. |
| `fakeAudioRecorder()` | Stubs `navigator.mediaDevices.getUserMedia`, `MediaRecorder`, and `HTMLMediaElement.play/pause` so the record-cough flow runs headlessly. |
| `seedHistory(items)` | Writes `analysis_history` to `localStorage` *before* the page loads. |
| `autoAcceptDialogs()` | Auto-accepts `window.confirm` (logout & clear-history use confirmations). |

Example:

```ts
import { test, expect } from "./fixtures/test"
import { failWith } from "./fixtures/api-mocks"

test("server 401 keeps user on /login", async ({ page, api }) => {
  await api({ login: failWith(401, "Invalid credentials") })
  await page.goto("/login")
  // …
})
```

---

## API mocks

[`tests/fixtures/api-mocks.ts`](../tests/fixtures/api-mocks.ts) provides:

- `mockApi(page, overrides?)` — registers `page.route("**/api/**", …)` for every endpoint.
- `defaultAnalyzeResponse`, `defaultAssessResponse` — the canonical shapes.
- `TEST_USER` — the test user identity. Reuse this across specs so seeded state matches.
- `failWith(status, message)` — convenience for failure cases.

When a backend contract changes, update the response shapes in this one file; specs pick up the new defaults automatically.

---

## Running tests

```bash
pnpm run test:e2e                          # full mocked suite, all browsers
pnpm run test:e2e -- tests/landing.spec.ts # one file
pnpm run test:e2e --grep "login"           # by title
pnpm run test:e2e --project chromium       # one browser
pnpm run test:e2e:integration              # ← real backend (see below)
pnpm run test:e2e:ui                       # interactive UI mode
pnpm run test:e2e:headed                   # see the browser
pnpm run test:e2e:debug                    # step through with PWDEBUG=1
pnpm run test:e2e:report                   # open last HTML report
```

The dev server is started automatically by Playwright's `webServer` config (port 3000). If you already have `pnpm run dev` running locally, it's reused.

---

## Integration tests (real backend)

The `integration` project under `tests/integration/` hits the live FastAPI backend. No mocks, no fake recorder — every request goes through Next.js → FastAPI → Supabase.

**Prereqs:**
- FastAPI running at `FASTAPI_URL` (default `http://127.0.0.1:8000`)
- Supabase reachable from the backend (the backend's `.env` handles this)

**Run them:**
```bash
pnpm run test:e2e:integration
```

**Behavior:**
- Each spec calls `backendIsReachable(request)` against `FASTAPI_URL/api/auth/health` and skips if it returns false. So `pnpm run test:e2e:integration` is safe to run even when the backend is down — you just get a "skipped" report.
- Each test registers a fresh user with a timestamped email (`pwtest+<stamp>@coughsense.test`) so concurrent runs don't collide. There's no automatic cleanup; users accumulate in Supabase.
- The default mocked suite (`pnpm run test:e2e`) explicitly **ignores** the `integration/` folder, so the two never run together unless you ask.

**What's covered:**

| Spec | Flow |
|---|---|
| [tests/integration/auth.live.spec.ts](../tests/integration/auth.live.spec.ts) | Register → dashboard → /me → patch name → reload (persistence) → logout. Plus a wrong-password assertion. |
| [tests/integration/analysis.live.spec.ts](../tests/integration/analysis.live.spec.ts) | Upload `sample-cough.wav` → analyze → assess → results, accepting either a successful flow or a graceful 4xx rejection from the cough validator (the silent fixture may be rejected on purpose). |

**Adding a new integration spec:** drop a file in `tests/integration/<name>.spec.ts`, import `backendIsReachable` and `uniqueEmail` from `./_helpers`, and gate the suite with `test.skip(({ request }) => …)` at the `describe` level so it doesn't fail loudly when the backend is offline.

---

## Adding a new test

1. Decide whether it needs auth.
   - **Authenticated**: import `test` from `./fixtures/test` and skip the `test.use` opt-out. Storage state from the `setup` project is reused.
   - **Unauthenticated**: add `test.use({ storageState: { cookies: [], origins: [] } })` at the top.
2. Choose stable selectors.
   - Prefer `page.getByTestId("…")` — every interactive element in the app has a `data-testid`.
   - Fall back to `getByRole`, `getByLabel`, `getByText` for accessibility coverage.
3. Mock what you need.
   ```ts
   await api({ assess: failWith(503, "service unavailable") })
   ```
4. Drive the UI like a user would. Avoid asserting on classes or implementation details.
5. Assert on observable state: text, attributes (e.g. `data-step`, `data-risk`), URLs, cookies, localStorage.

Skeleton:

```ts
import { test, expect } from "./fixtures/test"

test.describe("Feature X", () => {
  test("happy path", async ({ page, api }) => {
    await api()
    await page.goto("/feature-x")
    await page.getByTestId("feature-x-do-thing").click()
    await expect(page.getByTestId("feature-x-result")).toBeVisible()
  })
})
```

---

## Audio + microphone testing

`fakeAudioRecorder()` injects a `MediaRecorder` shim that emits a 16-byte silent blob on `stop()`. That's enough for the analysis flow because the file content never matters in tests — the API response is mocked.

For the file-upload code path, use the real fixture:

```ts
import { SAMPLE_AUDIO_PATH } from "./fixtures/test"

await page.getByTestId("audio-file-input").setInputFiles(SAMPLE_AUDIO_PATH)
```

`tests/fixtures/sample-cough.wav` is 8KB of silent PCM, regenerated from the script in `package.json` if it's ever lost.

---

## Accessibility

[`tests/accessibility.spec.ts`](../tests/accessibility.spec.ts) runs `@axe-core/playwright` on every public + protected page and asserts no `serious` or `critical` violations. Add new pages here as they ship.

---

## CI

Recommended GitHub Actions snippet:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
- uses: pnpm/action-setup@v4
- run: pnpm install --frozen-lockfile
- run: pnpm exec playwright install --with-deps
- run: pnpm run test:e2e
- if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 14
```

`retries: 2` and `workers: 1` are already set when `process.env.CI` is truthy.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Error: Port 3000 is in use` | Either kill the existing process or set `PORT=3001 pnpm run test:e2e`. |
| Browsers missing | `pnpm exec playwright install` |
| `MediaRecorder is not defined` in a spec | You forgot to call `await fakeAudioRecorder()` before navigating. |
| `Auth setup` fails | Probably the dev server isn't building. Run `pnpm run dev` in another terminal and rerun. |
| Snapshots flaky | Re-baseline with `pnpm run test:e2e:update-snapshots`. |
