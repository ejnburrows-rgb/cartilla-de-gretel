# Independent Technical Review & Verification Receipt — Gretel Native (Draft PR #1073)

- **Branch:** `feat/gretel-tutor-l1-3` (draft PR #1073 — NOT merged to `main`, NOT deployed)
- **Date:** 2026-11-26
- **Scope:** Finish-plan Wave 3 deliverables (Housekeeping & Backup, Book-Fidelity & 1,288-Line Script Expansion, Honest Status & Full-Lesson E2E, Real Continuous Audio Intake Proof, Split-Screen & Call UI Polish, and Teacher Review E2E Demonstration)

## 1. Audited Deliverables

1. **Housekeeping, Backup & Local Audio Tools (`@housekeeper`)**:
   - Backed up the 4 older local `cartilla-main` commits (`d766a7d8`..`03f09d21`) to `origin` as `refs/heads/backup/local-main-workbook-polish-20261126` (`03f09d21490fdf7992a9fdb317d0f56a1426f339`) without altering `cartilla-main`'s working tree or `origin/main`.
   - Installed static macOS `ffmpeg 9.1-tessus`, `ffprobe 9.1-tessus`, and Rhubarb Lip Sync `v1.14.0` into gitignored `.tools/bin/` and `.tools/rhubarb/`.
   - Fixed SonarCloud PR #1073 code-quality findings across tutor scripts and components, updated `playwright.config.ts` (`TUTOR_SPECS` + `chromium-tutor`), and documented local/preview access in `docs/tutor/PREVIEW-ACCESS.md` (`vercel.json` `git.deploymentEnabled: false` untouched).

2. **Book-Fidelity Audit & Full 24-Lesson Script Expansion (`@script-editor`)**:
   - Created `scripts/validate-tutor-book-fidelity.mjs` cross-checking all 25 v2 dialogue manifests and 30 recording batches against canonical `flipchart-text-*.json`, `book-transcription/*.json`, and `lessons.json`.
   - Replaced the invented Lesson 14 sentence (`"La niña sueña con el pañuelo de Noña"`) with authentic verified book text (`"La niña de Noña tiene sueño, Noña la tapa con el pañuelo."`, `"Noña tiene una niña."`, `"Meñe es dueña de esa piñata."`).
   - Eliminated all mechanical Flip Chart sheet-number and Workbook page-number reading aloud across all 24 lessons.
   - Expanded Lessons 1–24 from 12 lines each to **45 lines per lesson** (**1,080** lesson lines + **208** universal lines = **1,288 v2 lines**, **19,410 words**) across clean Spanish-only batches `docs/tutor/recording/B001`–`B030.txt`, with `RECORDING-INDEX.csv` and `RECORDING-INDEX.md` regenerated. All 120 legacy `tutor-lines.json` `lineId`s remain intact, and all 1,288 v2 lines stay `status: "scripted"` (zero unapproved audio activated).

3. **Honest Status Badge & Full Autonomous Lesson Flow (`@lesson-flow`)**:
   - Fixed `deriveSessionState()` in `src/lib/tutor-session/controller.ts` and `src/routes/tutor.$n.tsx` so `"Pensando…"` (`thinking`) appears ONLY during genuine turn computation, while idle states show `"Lista"` (`ready`) or `"Esperando respuesta"` (`waiting`).
   - Proved start-to-finish autonomous sessions for **Lesson 1 (Vowels)** and **Lesson 8 (Pp)** in `tests/e2e/tutor-full-lesson.spec.ts` (StubEars scripted fixtures, emulated viewports `1366×768` and `390×844`, `video: "on"`, 2/2 passed) including layout switches without avatar remount, 3-level hint escalation, Workbook & game opening, structured replay, and 8-section teacher report generation.

4. **Real Continuous Multi-Line Audio Intake Proof (`@voice-pipeline`)**:
   - Wired `.tools` binary auto-discovery, real `ffmpeg -af silencedetect` segmentation, FFT spectral flatness QC, and real Rhubarb phonetic visemes (`-r phonetic -f json --extendedShapes GX`).
   - Proved real end-to-end intake on a 32.055s continuous `.m4a` batch (12 segments with out-of-order, repeated, and missing lines) in `docs/tutor/intake/2026-11-26-continuous-batch-proof.md`, with private originals stored outside the repo (`~/GretelVoicePrivate/`) and approved manifests unpolluted.

5. **Screen, Layout & Animation Polish (`@screen-polish`)**:
   - Upgraded Mode B (Split Screen) and Mode C (Full-Screen Flip Chart + PiP) in `TutorFlipchartPresenter.tsx` and `tutor-stage.css` via `container-type: size` stage sizing so the Flip Chart fills its panel cleanly at exact `0.7171` aspect ratio across `390×844`, `1366×768`, `820×1180`, `1180×820`, and `1920×1080` with `0` horizontal overflow.
   - Moved custom Tailwind utility classes into code-split `tutor-stage.css` so the main entry CSS stays strictly under the 300 KB performance budget.

6. **Teacher Review & Structured Replay E2E Proof (`@teacher-review`)**:
   - Built `tests/e2e/tutor-teacher-review.spec.ts` (synthetic demo data explicitly labeled) proving local JSON export/import, the student-device transfer notice, `"Repetición estructurada de la sesión"` scrubbing and jump-to (`Errores`, `Correcciones`, `Pistas`), local teacher note/override persistence, and all 8 Spanish report sections with observations strictly separated from recommendations (1/1 passed at `1366×768` and `390×844`).

## 2. Final Verification Results

- `pnpm typecheck`: **PASS** (`0` errors repo-wide)
- `node scripts/validate-tutor-lines.mjs`: **PASS** (`43` approved, `77` pending)
- `node scripts/validate-tutor-visemes.mjs`: **PASS** (`43/43` valid visemes)
- `node scripts/validate-tutor-book-fidelity.mjs`: **PASS** (`1,288` v2 lines + `120` legacy lineIds, `0` invented sentences, `0` sheet/page numbers read aloud, `0` absent pp. 86–87, `0` quarantined audio)
- `pnpm verify:policy`: **PASS** (`95/95` tests, `ok: true`, `lockedVisualAuthority: true`)
- `pnpm vitest run tests/performance-budget.test.mjs src/lib/__tests__/tutor-brain.test.ts src/lib/__tests__/tutor-dialogue-manifest.test.ts src/lib/__tests__/tutor-session-log.test.ts scripts/__tests__/tutor-intake.test.mjs src/components/tutor/__tests__/TutorCallShell.test.tsx`: **PASS** (`6/6` files, `95/95` tests, including full `vite build` in `38.51s` and Entry CSS under 300 KB)
- Playwright E2E suites (scripted `StubEars` fixtures, emulated viewports):
  - `tests/e2e/tutor-full-lesson.spec.ts`: **2/2 passed** (with `.webm` videos)
  - `tests/e2e/tutor-teacher-review.spec.ts`: **1/1 passed** (`12.8s`)
- Visual screenshot inspection verified: full-height Flip Chart in Split Mode (`1366×768`), honest `"Lista"` and `"Esperando respuesta"` status badges, zero horizontal clipping (`390×844`), and clean 8-section Spanish teacher report + structured replay.

## 3. Hard-Rule Compliance

- `/Users/ejn/Desktop/Gretel/cartilla-main` working tree untouched.
- Zero runtime/browser TTS (`speechSynthesis`), zero paid voice APIs, zero `nina-sordita.mp3` or rejected 67-clip ZIP references.
- Zero Supabase schema/migration changes.
- `public/cartilla/images/gretel/layers/manifest.json` remains `{"layers": []}` (unapproved face art not activated).
- `OwnerPhotoPencilSvg.tsx`, `PENCIL-CURSOR-SPEC.md`, Workbook `curl=a`, Flip Chart Candidate A, and `vercel.json` `git.deploymentEnabled: false` untouched.
- **Not merged to `main` and not deployed to production** (awaiting explicit owner approvals).
