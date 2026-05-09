# CoughSense — Frontend

AI-assisted respiratory triage. Users record (or upload) a cough sample, optionally answer a short symptom checklist, and receive a risk-scored recommendation.

> **Disclaimer**: CoughSense is an informational tool, not a medical device. It does not diagnose, prevent, or treat any condition.

---

## Stack

| Concern        | Choice |
|----------------|--------|
| Framework      | Next.js 16 (App Router, React Compiler enabled) |
| Language       | TypeScript 5 (strict) |
| UI             | Tailwind CSS v4, Radix UI primitives, Lucide icons |
| Animation      | Framer Motion |
| HTTP           | Axios with token interceptor |
| Auth           | JWT in cookie + cached user in `localStorage` |
| Testing        | Playwright (E2E) + axe-core (a11y) |
| Package mgr    | pnpm |

---

## Quick start

### Prerequisites
- Node.js 20+
- pnpm 10+
- Docker Desktop (only required if you want to use the MCP-driven dev tooling)
- The CoughSense FastAPI backend running on `http://127.0.0.1:8000` (only required for live data — tests run fully mocked)

### Install + run

```bash
pnpm install
pnpm run dev
# → http://localhost:3000
```

Then in another terminal, start the backend (see [`../../backend/`](../../backend/)):

```bash
cd ../../backend && uvicorn main:app --reload
```

### Environment

Create `.env.local`:
```
FASTAPI_URL=http://127.0.0.1:8000
```

The Next.js route handlers under [`src/app/api/`](src/app/api/) proxy to this URL.

---

## Scripts

| Script | What it does |
|---|---|
| `pnpm run dev` | Start Next.js dev server with webpack |
| `pnpm run build` | Production build |
| `pnpm run start` | Run the production build |
| `pnpm run lint` | ESLint |
| `pnpm run test:e2e` | Run the full Playwright suite (mocked, no backend needed) |
| `pnpm run test:e2e:integration` or | Run integration tests against the live FastAPI backend |
| `pnpm run test:e2e:ui` | Open Playwright's UI mode for interactive debugging |
| `pnpm run test:e2e:headed` | Run tests with visible browsers |
| `pnpm run test:e2e:debug` | Step through tests with `PWDEBUG=1` |
| `pnpm run test:e2e:report` | Open the last HTML report |
| `pnpm run test:e2e:update-snapshots` | Refresh visual snapshots |
| `pnpm exec playwright show-report` | 

---

## Routes

| Route | Auth | Purpose |
|---|---|---|
| `/` | public | Landing page |
| `/login` | public | Sign in |
| `/register` | public | Create account |
| `/dashboard` | required | Cough analysis flow |
| `/history` | required | Past analyses (client-side, `localStorage`) |
| `/profile` | required | Account settings + privacy + logout |

---

## Documentation

| Doc | What's in it |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | High-level data flow, auth, state |
| [docs/TESTING.md](docs/TESTING.md) | Playwright setup, fixtures, how to add tests |
| [docs/API.md](docs/API.md) | All Next.js route handlers + upstream FastAPI endpoints |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Branching, commit style, conventions |

Older project notes are still in [API_ROUTES_ARCHITECTURE.md](API_ROUTES_ARCHITECTURE.md), [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md), and [QUICK_START.md](QUICK_START.md).

---

## MCP servers

The project ships with [`.mcp.json`](.mcp.json) wiring the [Docker MCP Gateway](https://docs.docker.com/desktop/mcp/), which exposes `context7` (library docs), `playwright` (browser automation), and other catalog servers to Claude Code / Cursor / VS Code agents working in this repo.

Connect a client once:
```bash
docker mcp client connect claude-code
```

Then enable specific servers:
```bash
docker mcp server enable context7 playwright
```

---

## License

Internal project — see repository root for license terms.
