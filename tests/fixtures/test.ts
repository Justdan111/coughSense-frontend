import { test as base, expect, type Page } from "@playwright/test"
import path from "node:path"
import { mockApi, type MockOverrides, TEST_USER } from "./api-mocks"

export const SAMPLE_AUDIO_PATH = path.join(__dirname, "sample-cough.wav")

interface HistoryItem {
  timestamp?: string
  summary?: string
  result?: "less_risky" | "risky"
  cough_confidence_pct?: number
  confidence?: number
  score?: number
  risk_level?: "low" | "medium" | "high"
  recommendation?: string
  actions?: string[]
  disclaimer?: string
}

type Fixtures = {
  /** Install the default API mocks. Call before navigating. */
  api: (overrides?: MockOverrides) => Promise<void>
  /** Inject a fake getUserMedia + MediaRecorder so record-cough flow works headlessly. */
  fakeAudioRecorder: () => Promise<void>
  /** Seed analysis history into localStorage *before* the page script runs. */
  seedHistory: (items: HistoryItem[]) => Promise<void>
  /** Auto-accept window.confirm dialogs (logout / clear history use confirm). */
  autoAcceptDialogs: () => void
}

export const test = base.extend<Fixtures>({
  api: async ({ page }, use) => {
    await use((overrides?: MockOverrides) => mockApi(page, overrides))
  },

  fakeAudioRecorder: async ({ page }, use) => {
    const inject = async () => {
      await page.addInitScript(() => {
        // ── Fake MediaStream + getUserMedia ────────────────────────────
        class FakeMediaStreamTrack extends EventTarget {
          kind = "audio"
          enabled = true
          readyState: "live" | "ended" = "live"
          stop() {
            this.readyState = "ended"
          }
        }
        class FakeMediaStream {
          private tracks = [new FakeMediaStreamTrack()]
          getTracks() {
            return this.tracks as unknown as MediaStreamTrack[]
          }
          getAudioTracks() {
            return this.tracks as unknown as MediaStreamTrack[]
          }
        }
        const fakeGetUserMedia = async () =>
          new FakeMediaStream() as unknown as MediaStream

        if (!navigator.mediaDevices) {
          Object.defineProperty(navigator, "mediaDevices", {
            value: {},
            configurable: true,
          })
        }
        Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
          value: fakeGetUserMedia,
          configurable: true,
          writable: true,
        })

        // ── Fake MediaRecorder ─────────────────────────────────────────
        class FakeMediaRecorder extends EventTarget {
          state: "inactive" | "recording" | "paused" = "inactive"
          ondataavailable: ((e: { data: Blob }) => void) | null = null
          onstop: (() => void) | null = null
          onerror: ((e: unknown) => void) | null = null
          onstart: (() => void) | null = null
          mimeType = "audio/wav"
          stream: MediaStream

          constructor(stream: MediaStream) {
            super()
            this.stream = stream
          }

          start() {
            this.state = "recording"
            this.onstart?.()
          }

          stop() {
            // 16 bytes of silence so cough-analysis has a non-empty Blob.
            const blob = new Blob([new Uint8Array(16)], { type: this.mimeType })
            this.ondataavailable?.({ data: blob })
            this.state = "inactive"
            this.onstop?.()
          }

          requestData() {}
          pause() {
            this.state = "paused"
          }
          resume() {
            this.state = "recording"
          }
          static isTypeSupported() {
            return true
          }
        }
        // @ts-expect-error - intentional global override
        window.MediaRecorder = FakeMediaRecorder

        // Stub HTMLAudioElement.play (no real audio output in headless)
        const origPlay = HTMLMediaElement.prototype.play
        HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
          try {
            this.dispatchEvent(new Event("play"))
          } catch {}
          return Promise.resolve()
        }
        const origPause = HTMLMediaElement.prototype.pause
        HTMLMediaElement.prototype.pause = function (this: HTMLMediaElement) {
          try {
            this.dispatchEvent(new Event("pause"))
          } catch {}
          return origPause.call(this) as unknown as void
        }
        // hold the original to prevent unused warnings
        void origPlay
      })
    }
    await use(inject)
  },

  seedHistory: async ({ page }, use) => {
    await use(async (items: HistoryItem[]) => {
      const json = JSON.stringify(items)
      await page.addInitScript((data) => {
        try {
          localStorage.setItem("analysis_history", data)
        } catch {}
      }, json)
    })
  },

  autoAcceptDialogs: async ({ page }, use) => {
    await use(() => {
      page.on("dialog", (dialog) => {
        dialog.accept().catch(() => {})
      })
    })
  },
})

export { expect, TEST_USER }
export type { Page }
