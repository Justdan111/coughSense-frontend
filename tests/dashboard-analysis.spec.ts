import { test, expect, SAMPLE_AUDIO_PATH } from "./fixtures/test"
import {
  defaultAnalyzeResponse,
  defaultAssessResponse,
  failWith,
} from "./fixtures/api-mocks"

test.describe("Dashboard — cough analysis flow", () => {
  test.beforeEach(async ({ page, fakeAudioRecorder }) => {
    await fakeAudioRecorder()
    await page.addInitScript(() => localStorage.removeItem("analysis_history"))
  })

  test("dashboard renders with sidebar and audio step", async ({
    page,
    api,
  }) => {
    await api()
    await page.goto("/dashboard")
    await expect(page.getByTestId("sidebar")).toBeVisible()
    await expect(page.getByTestId("cough-analysis")).toHaveAttribute(
      "data-step",
      "audio"
    )
    await expect(page.getByTestId("audio-record")).toBeVisible()
    await expect(page.getByTestId("audio-upload-btn")).toBeVisible()
  })

  test("record → stop → analyze advances to symptoms step", async ({
    page,
    api,
  }) => {
    await api()
    await page.goto("/dashboard")

    await page.getByTestId("audio-record").click()
    await expect(page.getByTestId("audio-stop")).toBeVisible()

    await page.getByTestId("audio-stop").click()
    await expect(page.getByTestId("audio-analyze-btn")).toBeVisible()

    await page.getByTestId("audio-analyze-btn").click()

    await expect(page.getByTestId("cough-analysis")).toHaveAttribute(
      "data-step",
      "symptoms",
      { timeout: 10_000 }
    )
  })

  test("file upload path: setInputFiles → analyze → symptoms", async ({
    page,
    api,
  }) => {
    await api()
    await page.goto("/dashboard")

    await page.getByTestId("audio-file-input").setInputFiles(SAMPLE_AUDIO_PATH)
    await expect(page.getByTestId("audio-analyze-btn")).toBeVisible()

    await page.getByTestId("audio-analyze-btn").click()
    await expect(page.getByTestId("cough-analysis")).toHaveAttribute(
      "data-step",
      "symptoms",
      { timeout: 10_000 }
    )
  })

  test("retake button clears the audio and returns to record state", async ({
    page,
    api,
  }) => {
    await api()
    await page.goto("/dashboard")

    await page.getByTestId("audio-file-input").setInputFiles(SAMPLE_AUDIO_PATH)
    await expect(page.getByTestId("audio-retake-btn")).toBeVisible()
    await page.getByTestId("audio-retake-btn").click()

    await expect(page.getByTestId("audio-record")).toBeVisible()
  })

  test("analyze API failure shows an error and stays on audio step", async ({
    page,
    api,
  }) => {
    await api({ analyze: failWith(500, "Analyzer crashed") })
    await page.goto("/dashboard")

    await page.getByTestId("audio-file-input").setInputFiles(SAMPLE_AUDIO_PATH)
    await page.getByTestId("audio-analyze-btn").click()

    await expect(page.getByTestId("analysis-error")).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByTestId("cough-analysis")).toHaveAttribute(
      "data-step",
      "audio"
    )
  })

  test("symptoms toggle visually update", async ({ page, api }) => {
    await api()
    await page.goto("/dashboard")

    await page.getByTestId("audio-file-input").setInputFiles(SAMPLE_AUDIO_PATH)
    await page.getByTestId("audio-analyze-btn").click()
    await expect(page.getByTestId("cough-analysis")).toHaveAttribute(
      "data-step",
      "symptoms"
    )

    for (const key of ["fever", "blood", "chest_pain", "difficulty_breathing"]) {
      const sym = page.getByTestId(`symptom-${key}`)
      await expect(sym).toHaveAttribute("data-checked", "false")
      await sym.click()
      await expect(sym).toHaveAttribute("data-checked", "true")
    }
  })

  test("consent toggle is sent in /assess payload", async ({ page, api }) => {
    await api()
    await page.goto("/dashboard")

    await page.getByTestId("audio-file-input").setInputFiles(SAMPLE_AUDIO_PATH)
    await page.getByTestId("audio-analyze-btn").click()
    await expect(page.getByTestId("cough-analysis")).toHaveAttribute(
      "data-step",
      "symptoms"
    )

    await page.getByTestId("symptom-fever").click()
    await page.getByTestId("symptom-consent").click()

    const [request] = await Promise.all([
      page.waitForRequest((req) =>
        req.url().includes("/api/analysis/assess") && req.method() === "POST"
      ),
      page.getByTestId("symptom-submit").click(),
    ])

    const body = request.postDataJSON() as Record<string, unknown>
    expect(body.fever).toBe(true)
    expect(body.save_for_training).toBe(true)
    expect(typeof body.cough_confidence).toBe("number")
  })

  test("results step renders all cards and persists history", async ({
    page,
    api,
  }) => {
    await api()
    await page.goto("/dashboard")

    await page.getByTestId("audio-file-input").setInputFiles(SAMPLE_AUDIO_PATH)
    await page.getByTestId("audio-analyze-btn").click()
    await page.getByTestId("symptom-submit").click()

    await expect(page.getByTestId("results-card")).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByTestId("results-risk-badge")).toHaveAttribute(
      "data-risk",
      defaultAssessResponse.result
    )
    await expect(page.getByTestId("results-confidence")).toContainText(
      `${defaultAssessResponse.cough_confidence_pct.toFixed(1)}%`
    )
    await expect(page.getByTestId("results-recommendation")).toContainText(
      defaultAssessResponse.recommendation
    )
    await expect(page.getByTestId("results-disclaimer")).toBeVisible()
    for (let i = 0; i < defaultAssessResponse.actions.length; i++) {
      await expect(page.getByTestId(`results-action-${i}`)).toBeVisible()
    }

    const stored = await page.evaluate(() =>
      localStorage.getItem("analysis_history")
    )
    expect(stored).toBeTruthy()
    const items = JSON.parse(stored!) as Array<{ result: string }>
    expect(items.length).toBeGreaterThan(0)
    expect(items[0].result).toBe(defaultAssessResponse.result)
  })

  test("'New Analysis' resets to audio step", async ({ page, api }) => {
    await api()
    await page.goto("/dashboard")
    await page.getByTestId("audio-file-input").setInputFiles(SAMPLE_AUDIO_PATH)
    await page.getByTestId("audio-analyze-btn").click()
    await page.getByTestId("symptom-submit").click()
    await expect(page.getByTestId("results-card")).toBeVisible()

    await page.getByTestId("results-new-analysis").click()
    await expect(page.getByTestId("cough-analysis")).toHaveAttribute(
      "data-step",
      "audio"
    )
  })

  test("assess API failure shows error on symptoms step", async ({
    page,
    api,
  }) => {
    await api({ assess: failWith(500, "Assess service down") })
    await page.goto("/dashboard")

    await page.getByTestId("audio-file-input").setInputFiles(SAMPLE_AUDIO_PATH)
    await page.getByTestId("audio-analyze-btn").click()
    await page.getByTestId("symptom-submit").click()

    await expect(page.getByTestId("analysis-error")).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByTestId("cough-analysis")).toHaveAttribute(
      "data-step",
      "symptoms"
    )
  })

  test("higher-risk result renders with the right risk attribute", async ({
    page,
    api,
  }) => {
    await api({
      assess: async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ...defaultAssessResponse,
            result: "risky",
            score: 80,
          }),
        })
      },
    })
    await page.goto("/dashboard")
    await page.getByTestId("audio-file-input").setInputFiles(SAMPLE_AUDIO_PATH)
    await page.getByTestId("audio-analyze-btn").click()
    await page.getByTestId("symptom-submit").click()

    await expect(page.getByTestId("results-card")).toHaveAttribute(
      "data-result",
      "risky"
    )
    await expect(page.getByTestId("results-risk-badge")).toContainText(
      /Higher Risk/i
    )
  })
})
