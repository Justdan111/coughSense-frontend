# Contributing

## Branches

- `main` — protected; deployable.
- `feature branches` — short, kebab-case names like `feature/profile-name-edit` or `fix/history-risk-fallback`.

Open a PR against `main`. Squash-merge.

---

## Commits

We follow a lightweight conventional-commits style (matches recent history):

```
feat: add profile name editing and consent management
fix: normalize legacy history items missing risk_level
style: update background gradient on signup page
test: add Playwright fixtures for cough analysis flow
docs: write Architecture overview
chore: bump @playwright/test
```

Stick to: `feat`, `fix`, `style`, `refactor`, `test`, `docs`, `chore`. The first word after the colon should be a verb. Keep the subject under ~70 chars; details go in the body.

---

## Required gates before opening a PR

```bash
pnpm install
pnpm run lint
pnpm run test:e2e
```

If you touched anything visual, also run `pnpm run test:e2e:headed` once and skim the screenshots in `playwright-report/`.

---

## Adding a new page or route

1. Create the page in the appropriate route group:
   - Public: `src/app/(auth)/<name>/page.tsx`
   - Protected: `src/app/(dashboard)/<name>/page.tsx` (the layout enforces auth)
2. Add a sidebar nav entry in `src/app/(dashboard)/layout.tsx` if it should appear in the sidebar.
3. Add `data-testid` attributes to every interactive element.
4. Add a smoke test in a new spec file under `tests/`.

## Adding a new API endpoint

See the recipe at the bottom of [API.md](API.md).

---

## `data-testid` convention

- **Kebab-case**, **scoped** by feature: `<feature>-<element>`.
- For dynamic lists, suffix the index: `history-item-3`, `history-item-3-delete`.
- For toggleable state, add a `data-checked="true|false"` or `data-active="true|false"` attribute alongside the testid so tests can assert without depending on classnames.

Examples:
- `login-email`, `login-submit`, `login-error`
- `audio-record`, `audio-stop`, `audio-analyze-btn`
- `symptom-fever` (with `data-checked`)
- `results-risk-badge` (with `data-risk`)
- `nav-history` (with `data-active`)

When in doubt, search for an existing testid that matches the feature area and follow the same shape.

---

## Style

- TypeScript strict mode is on; don't `any` your way out.
- Tailwind utility classes are the default. If a class set is reused 3+ times, extract a `cva` variant.
- Components use named exports for composables and `default export` for pages.
- Keep client components annotated with `"use client"` at the top.
- Prefer hooks composition over passing 8 props through 4 layers.

---

## Adding dependencies

- Use `pnpm add <pkg>` (deps) or `pnpm add -D <pkg>` (devDeps).
- Avoid heavy UI libraries — Radix + Tailwind covers most needs.
- If you reach for state management, talk it over first. We've gotten by with context and `useReducer`.

---

## Where to ask questions

Open a draft PR early. The build/test feedback often answers half the question.
