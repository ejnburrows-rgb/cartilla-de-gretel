# Wave 2 — Student happy-path E2E smoke test (issue #241)

Added a Playwright end-to-end smoke test that drives a real browser through the
core student flow: open Lesson 1, tap a picture activity, press **Comprobar**,
and see it graded.

## What shipped
- `playwright.config.ts` — `testDir: tests/e2e`, a `webServer` that runs
  `pnpm dev` and waits for `http://127.0.0.1:5173`, and a single Chromium
  project pinned to the environment's browser via `executablePath`
  (`/opt/pw-browsers/...`). No `playwright install` is ever run.
- `tests/e2e/student-happy-path.spec.ts` — seeds `cartilla.lesson-progress.v1`
  in `localStorage`, navigates to `/cartilla/leccion/1`, asserts the faithful
  page renders, taps a `.fp-ix-cell`, clicks **Comprobar**, and asserts a
  visible grading reaction (`.graded-correct/.graded-wrong/.graded-missed`) plus
  the check button becoming disabled. Saves a screenshot as proof.
- `package.json` — new script `"test:e2e": "playwright test"`; dev-dependency
  `@playwright/test@1.52.0` (matched to the repo's existing `playwright@1.52.0`
  to avoid a two-versions clash).
- `vite.config.ts` — Vitest `exclude` now includes `tests/e2e/**` so
  `pnpm test` (unit) never tries to run the Playwright spec.

## Verified here
- `pnpm test` → **1056 passed** (+2 expected-fail), 71 files — and it does NOT
  pick up the E2E spec (exclude works).
- `pnpm typecheck` → pass. `pnpm build` → pass.

## Blocker — `pnpm test:e2e` could not be run to green in this session
The E2E runner needs the Vite dev server. In this execution sandbox, `vite dev`
is killed immediately on launch (exit code **144 / SIGTERM**, no output), so the
`webServer` step never comes up and the test cannot execute. This started only
after several hours of heavy use in one long session (the dev server ran fine
earlier), so it is a session-level process/resource limit, not a problem with
the test or the app. Per issue #241's guidance, this is reported as the blocker
rather than weakening the test into something that doesn't actually drive the
browser.

**To run it:** in a fresh environment (or locally), `pnpm install` then
`pnpm test:e2e`. The config reuses an already-running dev server if one is up
(`reuseExistingServer: true`).
