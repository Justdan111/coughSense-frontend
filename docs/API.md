# API Reference

The frontend talks only to its own Next.js route handlers under `/api/*`. Those route handlers proxy to the FastAPI backend at `process.env.FASTAPI_URL` (default `http://127.0.0.1:8000`).

---

## Frontend → Next.js route handlers

| Method | Path | Auth | Request body | Response |
|---|---|---|---|---|
| POST | `/api/auth/register` | none | `{email, password, name?}` | `AuthResponse` |
| POST | `/api/auth/login` | none | `{email, password}` | `AuthResponse` |
| GET  | `/api/auth/me` | Bearer | — | `{id, email, name?}` |
| GET  | `/api/auth/account` | Bearer | — | `{id, email, name}` |
| PATCH | `/api/auth/account` | Bearer | `{name}` | `{id, email, name}` |
| POST | `/api/analysis/analyze` | Bearer | `multipart/form-data` with `audio` (File) | `AnalyzeResponse` |
| POST | `/api/analysis/assess` | Bearer | `AssessRequest` | `AssessResponse` |

The Bearer token comes from the `access_token` cookie. The axios instance in [`src/lib/axios.ts`](../src/lib/axios.ts) attaches it automatically; the route handlers forward it upstream.

---

## Types

```ts
// src/lib/api.ts

interface AuthResponse {
  user_id: string
  email: string
  name?: string
  access_token: string
  token_type: "bearer"
}

interface AnalyzeResponse {
  user_id: string
  severity: string
  confidence: number          // 0..1 after normalization
  risk_level: "low" | "medium" | "high"
  summary: string
  recommendation: string
  actions: string[]
  disclaimer: string
}

interface AssessRequest {
  cough_confidence: number    // 0..1
  fever: boolean
  blood: boolean
  chest_pain: boolean
  difficulty_breathing: boolean
  save_for_training: boolean
}

interface AssessResponse {
  user_id: string
  result: "less_risky" | "risky"
  cough_confidence_pct: number   // 0..100
  score: number
  summary: string
  recommendation: string
  actions: string[]
  disclaimer: string
}
```

---

## Error format

Both Next.js handlers and FastAPI return errors as:

```json
{ "detail": "Human-readable message" }
```

`detail` may also be an array of `{msg: string}` objects (FastAPI validation). The client extractor in [`src/lib/api.ts:105`](../src/lib/api.ts#L105) flattens both shapes into a single error string.

Status codes used:
- `400` — validation errors
- `401` — missing/invalid token, wrong credentials
- `403` — authenticated but forbidden (rare)
- `404` — not found
- `409` — duplicate email on register
- `500` — upstream/server error

---

## Auth header & cookie

- Header sent by axios: `Authorization: Bearer <jwt>`
- Cookie set by `useAuth().login` after successful authentication: `access_token=<jwt>; expires=<7d>; sameSite=Strict; secure (in prod)`
- Cached user JSON in `localStorage["cough_triage_user"]`: `{id, email, name?}`

A 401 from any endpoint clears storage and routes to `/login` (axios interceptor in [`src/lib/axios.ts`](../src/lib/axios.ts)).

---

## Upstream FastAPI

The route handlers proxy these paths verbatim. The backend lives at [`backend/app/routes/`](../../backend/app/routes/) (relative to the repo root). The frontend only knows about the endpoints listed above; if you need to add a new one:

1. Add the FastAPI route in the backend.
2. Add a Next.js route handler at `src/app/api/<area>/<name>/route.ts` that proxies request + response.
3. Add a service method in `src/lib/api.ts`.
4. Add a default mock handler in `tests/fixtures/api-mocks.ts`.
