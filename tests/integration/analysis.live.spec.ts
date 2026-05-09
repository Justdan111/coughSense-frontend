import { test, expect } from "@playwright/test"
import path from "node:path"
import fs from "node:fs"
import {
  backendIsReachable,
  isRateLimited,
  registerOrThrow,
  TEST_PASSWORD,
  uniqueEmail,
} from "./_helpers"

const SAMPLE_AUDIO = path.join(__dirname, "..", "fixtures", "sample-cough.wav")

/**
 * Real-backend analysis smoke at the API layer (no UI).
 *
 * The fixture WAV is silent, so the backend's cough validator may
 * reject it. We accept either a 2xx (validating shape) or a 4xx
 * (validating that the failure is graceful + shaped).
 */
test.describe.configure({ mode: "serial" })

test.describe("Integration — analysis (real FastAPI)", () => {
  test("API: register → upload audio → analyze + assess", async ({ request }) => {
    test.skip(
      !(await backendIsReachable(request)),
      "FastAPI backend unreachable"
    )

    // 1) Register a fresh user.
    const email = uniqueEmail("analyze")
    const { status: regStatus, body: regBody } = await registerOrThrow(
      request,
      email,
      TEST_PASSWORD,
      "Analyze API Tester"
    )
    test.skip(
      isRateLimited(regStatus, regBody),
      `Supabase rate-limited the register call: ${JSON.stringify(regBody)}`
    )
    expect(
      regStatus,
      `register should be 2xx, got ${regStatus} ${JSON.stringify(regBody)}`
    ).toBeLessThan(300)

    // 2) Login to get a clean Bearer token (register response shape varies).
    const loginRes = await request.post("/api/auth/login", {
      data: { email, password: TEST_PASSWORD },
    })
    expect(loginRes.status()).toBeLessThan(300)
    const { access_token } = (await loginRes.json()) as { access_token: string }
    expect(access_token).toBeTruthy()

    // 3) Upload audio to /api/analysis/analyze.
    const audioBuffer = fs.readFileSync(SAMPLE_AUDIO)
    const analyzeRes = await request.post("/api/analysis/analyze", {
      headers: { Authorization: `Bearer ${access_token}` },
      multipart: {
        audio: {
          name: "sample-cough.wav",
          mimeType: "audio/wav",
          buffer: audioBuffer,
        },
      },
      timeout: 60_000,
    })

    if (analyzeRes.ok()) {
      const body = (await analyzeRes.json()) as Record<string, unknown>
      // Confidence may live under any of these keys depending on backend ver.
      const confidenceCandidates = [
        body.confidence,
        body.cough_confidence,
        body.cough_confidence_pct,
        body.confidence_pct,
      ]
      expect(
        confidenceCandidates.some(
          (v) => typeof v === "number" && Number.isFinite(v)
        ),
        `expected one numeric confidence field, got ${JSON.stringify(body)}`
      ).toBe(true)

      // 4) Run /assess with a plausible cough_confidence.
      const numericConfidence =
        confidenceCandidates.find(
          (v) => typeof v === "number" && Number.isFinite(v)
        ) ?? 0
      const assessRes = await request.post("/api/analysis/assess", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        data: {
          cough_confidence:
            (numericConfidence as number) > 1
              ? (numericConfidence as number) / 100
              : (numericConfidence as number),
          fever: false,
          blood: false,
          chest_pain: false,
          difficulty_breathing: false,
          save_for_training: false,
        },
      })
      expect(assessRes.status()).toBeLessThan(500)
      if (assessRes.ok()) {
        const assessBody = (await assessRes.json()) as Record<string, unknown>
        expect(assessBody.result === "less_risky" || assessBody.result === "risky").toBe(true)
        expect(typeof assessBody.recommendation).toBe("string")
      }
    } else {
      // 4xx is acceptable — the silent WAV may be rejected by the validator.
      expect(analyzeRes.status()).toBeGreaterThanOrEqual(400)
      expect(analyzeRes.status()).toBeLessThan(500)
      const body = await analyzeRes.json()
      expect(body.detail, "error response should have a `detail` field").toBeTruthy()
    }
  })
})
