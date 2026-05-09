# Architecture

A short, opinionated tour of how CoughSense's frontend is wired up.

---

## High-level data flow

```
                ┌──────────────────────┐
                │      Browser         │
                │  (Next.js client)    │
                └──────────┬───────────┘
                           │ axios
                           │ baseURL: /api
                           ▼
              ┌──────────────────────────┐
              │  Next.js Route Handlers  │   ← src/app/api/**
              │   (server, edge-safe)    │
              └──────────┬───────────────┘
                         │  fetch
                         │  FASTAPI_URL
                         ▼
                ┌────────────────────┐
                │   FastAPI backend  │
                │  http://:8000      │
                └────────────────────┘
```

The route handlers exist so the FastAPI URL never appears in browser code: the only network endpoint the client knows is `/api/*`, which lets us deploy the backend behind a private VPC, swap implementations, or insert middleware without touching the SPA.

---

## Directory layout (the parts that matter)

```
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
    (dashboard)/
      layout.tsx              ← guards routes, sidebar
      dashboard/page.tsx      ← cough analysis entry
      history/page.tsx        ← localStorage-backed history
      profile/page.tsx        ← account + consent + logout
    api/
      auth/
        login/route.ts
        register/route.ts
        me/route.ts
        account/route.ts
      analysis/
        analyze/route.ts
        assess/route.ts
    layout.tsx                ← root layout, providers
    page.tsx                  ← landing
  components/
    cough-analysis.tsx        ← core multi-step flow
    header.tsx                ← landing-page header
    protected-route.tsx       ← client-side guard component
    providers.tsx             ← wraps AuthProvider
    ui/                       ← Radix-based primitives
  hooks/
    use-auth.tsx              ← context + reducer
  lib/
    api.ts                    ← service objects (auth, analysis)
    axios.ts                  ← single axios instance + interceptors
    utils.ts                  ← cn(), misc
```

The two route groups (`(auth)`, `(dashboard)`) share a URL space but get separate layouts. Anything inside `(dashboard)` is gated by [`src/app/(dashboard)/layout.tsx`](../src/app/(dashboard)/layout.tsx), which redirects to `/login` when no user is loaded.

---

## Auth

### Where state lives

| Storage | Key | Lifetime |
|---|---|---|
| Cookie | `access_token` | 7 days, `secure` in prod, `sameSite: Strict` |
| `localStorage` | `cough_triage_user` | until logout |
| `localStorage` | `consent` | until cleared |
| `localStorage` | `analysis_history` | up to 20 entries |

### Login sequence

```
client                Next.js /api/auth/login              FastAPI /api/auth/login
  │  POST {email, password}      │                                  │
  ├─────────────────────────────► │   POST                           │
  │                               ├─────────────────────────────────►│
  │                               │   {user_id, email, name,         │
  │                               │    access_token, token_type}     │
  │                               │◄─────────────────────────────────┤
  │   AuthResponse JSON           │                                  │
  │◄──────────────────────────────┤                                  │
  ▼
  Cookies.set("access_token")
  localStorage.setItem("cough_triage_user", …)
  router.push("/dashboard")
```

### Token verification

On app boot, [`AuthProvider`](../src/hooks/use-auth.tsx) reads the cookie + localStorage. If both exist, it calls `GET /api/auth/me`. A 200 means we're authenticated; a 401 clears storage and bumps to `/login`.

### Logout

Removes the cookie and both localStorage keys, then `router.push("/")`. There's no server-side blacklist; tokens expire on their own.

---

## State management

There is no global state library. Three patterns:

1. **Auth context** ([`src/hooks/use-auth.tsx`](../src/hooks/use-auth.tsx)) — `useReducer` over `{user, isLoading, error}`. Exposes `login`, `signup`, `logout`, `verifyToken`, `clearError`.
2. **Component-local `useState`** for everything else. The cough-analysis flow (a 4-step machine) lives entirely inside [`cough-analysis.tsx`](../src/components/cough-analysis.tsx).
3. **`localStorage`** for analysis history and consent. No reducer; pages read/write directly. The history page normalizes legacy items so old shapes don't crash the UI.

When in doubt, prefer local state. Promote to context only when two unrelated subtrees need the same data.

---

## Cough analysis flow

A finite state machine inside one component:

```
audio ──record/upload──► (audioBlob set) ──Analyze──► analyzing
                                                       │
                                                       ▼
results ◄─Get Results── symptoms ◄─analyze success─── (cough_confidence)
   │
   └─New Analysis──► audio (reset)
```

Network calls:

1. `POST /api/analysis/analyze` (multipart, field `audio`) → returns `confidence` (0..1)
2. `POST /api/analysis/assess` (JSON, `{cough_confidence, fever, blood, chest_pain, difficulty_breathing, save_for_training}`) → returns `{result, score, summary, recommendation, actions, disclaimer, cough_confidence_pct}`

The successful assessment is unshifted into `analysis_history` (capped at 20 entries) before transitioning to the results step.

### Audio capture

`navigator.mediaDevices.getUserMedia({audio: true})` then `MediaRecorder`. The blob is wrapped as a `File` named `cough_recording.wav` and posted via `FormData`. There is also a file-upload fallback that bypasses the recorder entirely.

In tests, both `getUserMedia` and `MediaRecorder` are stubbed by [`tests/fixtures/test.ts`](../tests/fixtures/test.ts) so the flow is exercisable in headless browsers.

---

## Styling

- Tailwind v4 with custom CSS variables for the palette (`--ct-primary`, `--risk-low`, …).
- Component composition via `class-variance-authority` and `tailwind-merge` (`cn()` helper in `lib/utils.ts`).
- Animations via Framer Motion at the page-transition and step-transition boundaries.

---

## Where to start reading code

Pick one user journey and trace it:
1. **Login**: [`src/app/(auth)/login/page.tsx`](../src/app/(auth)/login/page.tsx) → [`src/hooks/use-auth.tsx`](../src/hooks/use-auth.tsx) → [`src/lib/api.ts`](../src/lib/api.ts) → [`src/app/api/auth/login/route.ts`](../src/app/api/auth/login/route.ts).
2. **Cough analysis**: [`src/components/cough-analysis.tsx`](../src/components/cough-analysis.tsx) is the whole story.
3. **Protected layout**: [`src/app/(dashboard)/layout.tsx`](../src/app/(dashboard)/layout.tsx).
