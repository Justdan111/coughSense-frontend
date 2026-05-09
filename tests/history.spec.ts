import { test, expect } from "./fixtures/test"

const sampleItems = [
  {
    timestamp: "2026-04-01T12:34:00.000Z",
    summary: "Most recent analysis",
    cough_confidence_pct: 82.5,
    score: 28,
    risk_level: "low" as const,
    result: "less_risky" as const,
    recommendation: "Rest.",
    actions: ["Hydrate"],
    disclaimer: "Triage only.",
  },
  {
    timestamp: "2026-03-28T09:00:00.000Z",
    summary: "Older analysis",
    cough_confidence_pct: 64,
    score: 55,
    risk_level: "medium" as const,
    result: "less_risky" as const,
    recommendation: "Watch for fever.",
    actions: [],
    disclaimer: "Triage only.",
  },
]

test.describe("History page", () => {
  test("empty state renders when no history", async ({
    page,
    api,
    seedHistory,
  }) => {
    await api()
    await seedHistory([])
    await page.goto("/history")

    await expect(page.getByTestId("history-empty")).toBeVisible()
    await expect(page.getByTestId("history-clear-all")).toBeHidden()
  })

  test("seeded items render with summary, confidence, and risk badge", async ({
    page,
    api,
    seedHistory,
  }) => {
    await api()
    await seedHistory(sampleItems)
    await page.goto("/history")

    await expect(page.getByTestId("history-item-0")).toBeVisible()
    await expect(page.getByTestId("history-item-0-summary")).toContainText(
      "Most recent analysis"
    )
    await expect(page.getByTestId("history-item-0-confidence")).toContainText(
      "82.5"
    )
    await expect(page.getByTestId("history-item-0-risk")).toHaveAttribute(
      "data-risk",
      "low"
    )

    await expect(page.getByTestId("history-item-1-risk")).toHaveAttribute(
      "data-risk",
      "medium"
    )
  })

  test("delete a single item removes it from list and storage", async ({
    page,
    api,
    seedHistory,
  }) => {
    await api()
    await seedHistory(sampleItems)
    await page.goto("/history")

    await page.getByTestId("history-item-0-delete").click()
    await expect(page.getByTestId("history-item-1")).toBeHidden()
    // Originally index-1 ("Older") becomes index-0.
    await expect(page.getByTestId("history-item-0-summary")).toContainText(
      "Older analysis"
    )

    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("analysis_history") ?? "[]")
    )
    expect(stored).toHaveLength(1)
  })

  test("'Clear History' empties everything", async ({
    page,
    api,
    seedHistory,
    autoAcceptDialogs,
  }) => {
    await api()
    autoAcceptDialogs()
    await seedHistory(sampleItems)
    await page.goto("/history")

    await page.getByTestId("history-clear-all").click()
    await expect(page.getByTestId("history-empty")).toBeVisible()

    const stored = await page.evaluate(() =>
      localStorage.getItem("analysis_history")
    )
    expect(stored).toBeNull()
  })

  test("legacy items missing risk_level still render (normalization)", async ({
    page,
    api,
    seedHistory,
  }) => {
    const legacy = [
      {
        timestamp: "2026-02-15T10:00:00.000Z",
        summary: "Legacy item without risk_level",
        confidence: 55,
      },
    ]
    await api()
    await seedHistory(legacy)
    await page.goto("/history")

    await expect(page.getByTestId("history-item-0")).toBeVisible()
    await expect(page.getByTestId("history-item-0-summary")).toContainText(
      "Legacy item"
    )
    // Falls back to "medium" when both risk_level and result are missing.
    await expect(page.getByTestId("history-item-0-risk")).toHaveAttribute(
      "data-risk",
      "medium"
    )
  })
})
