# Release Verification Baseline Report (Current Main)

- **Main Commit SHA:** `917475169665e5746251ee06d698b83064a9b134`
- **Parent Issue:** #458
- **Prior Harness Lane:** #389 (completed)
- **Goal:** Run direct release gate on CURRENT main before final art/voice integration to identify any unrelated release failures early.

---

## Verification Executive Summary

| Stage | Command / Action | Result | Notes |
| :--- | :--- | :--- | :--- |
| **Prebuild** | `node scripts/prebuild-fetch-pdfs.mjs` | **PASS** | `public/book/book.pdf` runtime source fallback confirmed |
| **Prepare Art** | `node scripts/prepare-art-assets.mjs` | **PASS** | 158 manifest entries, 96 wired production, 0 errors, 24 warnings |
| **Verify Assets** | `node scripts/verify-production-assets.mjs` | **PASS** | 479 assets checked (local), 0 errors |
| **Typecheck** | `tsc --noEmit` | **PASS** | Zero TypeScript errors |
| **Vitest Suite** | `vitest run` | **PASS** | 128 test files passed, 1,576 tests passed (2 expected fails) |
| **Vite Production Build** | `vite build` | **PASS** | Production bundles generated in 29.39s (`dist/`) |
| **Playwright E2E** | `playwright test` | **FAIL** | WebServer launch failure due to `powershell` invocation in `playwright.config.ts` |

---

## Detailed Stage Metrics

### 1. Prebuild & Production Art Verification
- `pnpm prebuild`: Passed (`public/book/book.pdf` not present, runtime source fallback active).
- `pnpm prepare:art`: Passed.
  - Manifest Entries: 158
  - Quarantined Assets: 35
  - Wired Production Assets: 96
  - Processed Canonical Assets: 108
  - Errors: 0
  - Warnings: 24 (aspect ratio drift / crop boundary touch warnings)
- `pnpm verify:assets`: Passed.
  - Workbook Assets: 58
  - Flip Chart Assets: 167
  - Backgrounds: 148
  - Delivery Assets: 106
  - Total Checked: 479
  - Errors: 0

### 2. Typecheck
- Command: `pnpm typecheck` (`tsc --noEmit`)
- Result: **0 errors**

### 3. Vitest Unit & Integration Test Suite
- Command: `pnpm test` (`vitest run`)
- Result: **PASS**
  - **Test Files:** 128 passed / 128 total
  - **Tests:** 1,576 passed, 2 expected fail (1,578 total)
  - **Skipped Tests:** 0
  - **Duration:** 90.60s

### 4. Production Application Build
- Command: `vite build`
- Result: **PASS**
  - Built in 29.39s
  - Chunks generated cleanly under `dist/`

### 5. Playwright E2E Gate (Release Failure Report)

- **Failing Stage:** Playwright E2E (`test:e2e` / `config.webServer`)
- **Error Log Output:**
  ```text
  > cartilla-de-gretel-platform@ test:e2e /app
  > playwright test

  [WebServer] /bin/sh: 1: powershell: not found
  Error: Process from config.webServer was not able to start. Exit code: 127
  ```
- **Exact Root Cause:**
  In `playwright.config.ts`, `webServer.command` wraps the server start command in a helper function `envCommand`:
  ```ts
  const envCommand = (env: Record<string, string>, command: string) => {
    const assignments = Object.entries(env)
      .map(([key, value]) => `$env:${key}='${value.replaceAll("'", "''")}'`)
      .join("; ");
    return `powershell -NoProfile -Command \"${assignments}; ${command}\"`;
  };
  ```
  `envCommand` explicitly executes `powershell`, which is not present in POSIX / Linux environment containers (where `/bin/sh` or `/bin/bash` is used).
- **Impact:** `pnpm test:e2e` fails immediately during webServer spawn before any Playwright spec can execute.
- **Scope / Remediation:**
  As per lane directive ("do not fix product failures in this lane. Report exact failing stage/test/file so controller can create a narrow repair task"), this platform environment incompatibility in `playwright.config.ts` is documented here for controller repair.

---

## Artifact Integrity & Non-Mutation
All generated assets under `dist/` and `public/cartilla/art/` produced during `pnpm verify:release` were treated as verification output and restored/cleaned. The working directory contains only this verification baseline report in `docs/proofs/pre-final-release-baseline/SUMMARY.md`.
