import type { APIRequestContext } from "@playwright/test"

/**
 * Live integration helpers. These tests hit the real Next.js route handlers,
 * which proxy to the FastAPI backend at FASTAPI_URL. No mocks, no
 * `mockApi()` — if the backend is down or misconfigured, the suite
 * skips itself.
 */

// Probe the upstream FastAPI directly — the backend exposes
// `/api/auth/health`, but Next.js does not proxy it. Fall back to
// FASTAPI_URL or the documented default.
const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://127.0.0.1:8000"
const PROBE_URL = `${FASTAPI_URL}/api/auth/health`

export async function backendIsReachable(
  request: APIRequestContext
): Promise<boolean> {
  try {
    const res = await request.get(PROBE_URL, { timeout: 5_000 })
    return res.ok()
  } catch {
    return false
  }
}

/**
 * Generate a unique throwaway email so concurrent runs don't collide.
 *
 * NOTE on TLDs: the backend uses Pydantic `EmailStr` (via email-validator),
 * which rejects special-use/reserved TLDs (`.test`, `.invalid`, `.example`,
 * `.localhost`, …). Use a real TLD like `.dev` to avoid 422s.
 */
export function uniqueEmail(prefix = "pwtest"): string {
  const stamp = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${stamp}-${rand}@coughsense-pw.dev`
}

export const TEST_PASSWORD = "Password@123!"

/**
 * Best-effort register. Returns the parsed body on 2xx; throws on
 * non-2xx but tags the error with status + body so callers can
 * inspect for rate-limit messages from Supabase.
 */
export async function registerOrThrow(
  request: APIRequestContext,
  email: string,
  password: string,
  name = "Integration Tester"
): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await request.post("/api/auth/register", {
    data: { email, password, name },
    timeout: 30_000,
  })
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
  return { status: res.status(), body }
}

/** Heuristic: detect Supabase / FastAPI rate-limit + email-throttle errors. */
export function isRateLimited(status: number, body: unknown): boolean {
  if (status === 429) return true
  if (typeof body !== "object" || body === null) return false
  const detail = (body as Record<string, unknown>).detail
  const msg = typeof detail === "string" ? detail.toLowerCase() : ""
  return (
    msg.includes("rate limit") ||
    msg.includes("too many") ||
    msg.includes("email rate limit") ||
    msg.includes("over_email_send_rate_limit")
  )
}
