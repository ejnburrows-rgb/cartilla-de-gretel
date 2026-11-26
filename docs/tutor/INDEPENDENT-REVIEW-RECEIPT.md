# Independent Technical Review & Verification Receipt — Gretel Native (Draft PR #1073)

- **Branch:** `feat/gretel-tutor-l1-3` (draft PR #1073 — NOT merged to `main`, NOT deployed)
- **Date:** 2026-11-26
- **Scope:** Finish-plan Wave 3 + Final Correction & Completion Wave (Gitar Defect Fixes, SonarCloud Security Hardening + PR #1323 Intake Hardening, PR #1073 + PR #1322 + PR #1323 Authoritative Catalog Reconciliation, All-24-Lessons E2E Sweep, Web-Accessible Avatar Approval Preview, and Honest Private HTTPS Preview Audit)

## 1. Audited Deliverables

### Wave 3 Foundation (Verified & Preserved)
1. **Housekeeping, Backup & Local Audio Tools (`@housekeeper`)**:
   - Backed up the 4 older local `cartilla-main` commits (`d766a7d8`..`03f09d21`) to `origin` as `refs/heads/backup/local-main-workbook-polish-20261126` (`03f09d21490fdf7992a9fdb317d0f56a1426f339`) without altering `cartilla-main`'s working tree or `origin/main`.
   - Installed static macOS `ffmpeg 9.1-tessus`, `ffprobe 9.1-tessus`, and Rhubarb Lip Sync `v1.14.0` into gitignored `.tools/bin/` and `.tools/rhubarb/`.
2. **Book-Fidelity Validator & Continuous Multi-Line Intake Proof (`@script-editor`, `@voice-pipeline`)**:
   - Enforced zero invented sentences, zero Flip Chart sheet-number / Workbook page-number narration, zero absent pp. 86–87 references, and zero quarantined audio across all manifests and recording batches.
   - Proved real end-to-end continuous `.m4a` intake (`32.055s`, 12 segments) in `docs/tutor/intake/2026-11-26-continuous-batch-proof.md`, with private originals stored outside the repo (`~/GretelVoicePrivate/`).
3. **Screen, Layout, Animation Polish & Teacher Review (`@screen-polish`, `@teacher-review`)**:
   - Code-split `tutor-stage.css` keeps Entry CSS strictly under the 300 KB performance budget while preserving `0.7171` Flip Chart aspect ratio and `0` horizontal overflow across desktop and mobile viewports.
   - Proved local JSON export/import, student-device transfer notice, structured session replay (`Errores`, `Correcciones`, `Pistas`), local teacher note/override persistence, and all 8 Spanish report sections.

### Final Correction & Completion Wave (Audited on Current Head)
4. **Functional Defect Fixes (`@defect-fixer`)**:
   - **Gitar #5 (Per-lesson missed-word isolation & review queue):** Added `missesByLesson: Record<number, string[]>` in `src/lib/tutor-memory.ts` (with legacy migration); `beginSession` clears only the started lesson; carried-over `reviewItemIds` are filtered to current-lesson items and `findNextValidReview` in `src/lib/tutor-brain.ts` skips unknown IDs instead of prematurely celebrating.
   - **Gitar #12 (`TYPED_ANSWER` without mic):** Added `{ type: "TYPED_ANSWER"; transcript: string }` in `src/lib/tutor-brain.ts` and `src/routes/tutor.$n.tsx` so typed responses work in `LISTEN` without activating `getUserMedia` (`gumCallCount === 0`).
   - **Gitar #11 (Invalid lesson URL guard):** Split `TutorSessionScreen` in `src/routes/tutor.$n.tsx` to validate `lesson` before mounting `ValidTutorSessionScreen`, rendering `"Esta lección todavía no está lista."` on `/tutor/25`, `/tutor/0`, `/tutor/abc`, and `NaN` without constructing `TutorSessionController` or `createSessionLog`.
   - **Gitar #13, #14, #15 (Flip Chart vs Workbook sheet separation & session logging):** Added explicit `flipchartSheet?: number` in `src/lib/tutor-session-log.ts` and updated `generateTeacherSessionReport` + `src/components/tutor/TutorReplay.tsx` to render `"Rotafolio · lámina N"` separately from `"Cuaderno · pág. impresa P (hoja PDF S)"`, with full session log persistence on progress, page/mode changes, and session end.
   - **Gitar #16 (Portable E2E paths):** Removed all hardcoded `/Users/ejn/...` defaults from `tests/e2e/tutor-*.spec.ts` in favor of `path.join(process.cwd(), "test-results", ...)`.
   - **Sonar `S8786`:** Replaced leading/trailing hyphen regexes in `idSlug()` (`src/lib/tutor-content.ts`) with linear O(n) trimming.

5. **Security Audit & Hardening (`@security-hardener` — `docs/tutor/SECURITY-AUDIT.md`)**:
   - **Sonar `S1523` (CRITICAL):** Eliminated `node:vm` / `vm.runInNewContext` in `scripts/tutor-coverage-matrix.mjs`; replaced with pure static TypeScript AST literal extraction (`ts.createSourceFile`).
   - **Sonar `S4036` (Security Hotspots):** Replaced bare `"tar"`, `"unzip"`, and `"git"` subprocess invocations in `scripts/fetch-vosk-model.mjs`, `scripts/tutor-intake/guard.mjs`, and `scripts/tutor-intake/visemes.mjs` with `resolveFixedSystemBinary()` checking fixed absolute paths via `accessSync(X_OK)` (and verified `scripts/build-tutor-visemes.mjs` has zero direct subprocess invocations).
   - **Sonar `S8786`:** Replaced polynomial regexes in `scripts/tutor-coverage-matrix.mjs` (`idSlug`) and `scripts/validate-tutor-book-fidelity.mjs` (`/^B\d+.*\.txt$/i`) with linear O(n) checks.
   - **PR #1323 Intake Hardening:** Enforced owner-only `0o700` dir / `0o600` file permissions via `enforcePrivatePermissions()`, added `FFMPEG_SECURITY_FLAGS` (`-nostdin -xerror -protocol_whitelist file,pipe`) and `FFPROBE_SECURITY_FLAGS` (`-protocol_whitelist file,pipe`), and added SHA-256 content-hash matching against installed approved speech in `scripts/tutor-intake/{guard,media,index}.mjs`, locked by 4 new unit tests in `scripts/__tests__/tutor-intake.test.mjs`.

6. **Authoritative Recording Catalog Reconciliation (`@catalog-merger` — `docs/tutor/CATALOG-RECONCILIATION.md`)**:
   - Merged PR #1073 (`1,288` lines), PR #1322 (`origin/tembo/tutor-dialogue-atlas`: `1,047` distinct texts / `1,208` context mappings), and PR #1323 (`origin/tembo/tutor-private-intake`) into **one authoritative catalog** in `src/content/tutor-dialogue/universal.json` + `lesson-01..24.json`:
     - **1,368 unique v2 scripted utterances** (`240` universal across `B001`–`B006` + `1,128` across Lessons 1–24 = `47`/lesson across `B007`–`B030`, `20,102` total spoken words, **0 duplicate normalized Spanish texts**).
     - **120 legacy `src/content/tutor-lines.json` `lineId`s intact** (`43` owner-approved word models + `77` pending; `1,488` total merged entries).
     - **100% of PR #1322's `1,208` `sourceContexts` preserved** (`971` `workbookPage`, `971` `workbookPdfSheet`, `180` `flipchartSheet`, `433` `expectedAnswer`, `204` `commonError`, `204` `sharedClip` preventing `161` duplicate recordings).
     - **Reconciled 2-Batch Priority Recording Package:** `docs/tutor/recording/PRIORITY-PACKAGE.md`, `PRIORITY-B001-universal.txt` (`B001`, 36 lines, 436 words), and `PRIORITY-B002-lesson-01.txt` (`B007`, 47 lines, 695 words) = **83 lines (~10.3 min)** synchronized 1-to-1 with `B001`–`B030.txt`, `RECORDING-INDEX.csv`, and `RECORDING-INDEX.md`.
     - **0 active unapproved audio** (all `1,368` v2 lines remain `status: "scripted"`), **0 absent pp. 86–87**, **0 quarantined audio**.

7. **All-24-Lessons E2E Sweep, Web Avatar Preview & Honest Private Preview Audit (`@all-lessons-preview`)**:
   - Added `public/tutor-avatar-preview.html` served over HTTP/HTTPS with strictly web-relative asset paths (zero `file://` links) and real approved audio (`/audio/voz/vocabulario/{abeja,abanico,oso}.mp3`) paired with real Rhubarb viseme JSONs (`/audio/voz/tutor/leccion-1/l1-model-{abeja,abanico,oso}.visemes.json`).
   - Added `tests/e2e/tutor-all-24-lessons.spec.ts` (wired into `playwright.config.ts`) verifying all 24 lessons (`/tutor/1`–`/tutor/24`), invalid URLs (`/tutor/25`, `/tutor/0`, `/tutor/abc`), and `/tutor-avatar-preview.html` over HTTP with scripted `StubEars` fixtures explicitly labeled as scripted.
   - Updated `docs/tutor/PREVIEW-ACCESS.md` documenting that no authorized private HTTPS preview exists yet (`vercel.json` `git.deploymentEnabled: false`, no authenticated `vercel` CLI or HTTPS tunnel binary installed on this machine) along with the local production-preview procedure and full physical-device verification checklist.

## 2. Independent Final Verification Results (`@qa-gate`)

- **Workspace & Repository Invariants:**
  - `/Users/ejn/Desktop/Gretel/cartilla-main`: untouched (`## main...origin/main [ahead 4]`, `?? work/`)
  - `origin` backup branch preserved: `03f09d21490fdf7992a9fdb317d0f56a1426f339 refs/heads/backup/local-main-workbook-polish-20261126`
  - `vercel.json`: `"git": { "deploymentEnabled": false }` unchanged
  - `public/cartilla/images/gretel/layers/manifest.json`: `{"layers": []}` unchanged
  - Hardcoded personal paths check (`grep -rn "/Users/ejn" tests/e2e/`): **0 matches**
- **Typecheck, Validators, Policy & Build:**
  - `pnpm typecheck`: **PASS** (`0` errors repo-wide)
  - `node scripts/validate-tutor-lines.mjs`: **PASS** (`43` approved, `77` pending)
  - `node scripts/validate-tutor-visemes.mjs`: **PASS** (`43/43` valid visemes, shapes in `{A..H, X}`, monotonic cues)
  - `node scripts/validate-tutor-book-fidelity.mjs`: **PASS** (`1,368` v2 lines across `30` batches + `120` legacy lineIds intact — `0` invented sentences, `0` sheet/page numbers read aloud, `0` absent pp. 86–87, `0` quarantined audio)
  - `pnpm verify:policy`: **PASS**
  - `pnpm exec vite build`: **PASS** (production build succeeded; `vite build` inside perf budget `38.08s`)
- **Unit & Budget Test Suite (`pnpm vitest run`):**
  - `tests/performance-budget.test.mjs`
  - `src/lib/__tests__/tutor-memory.test.ts`
  - `src/lib/__tests__/tutor-brain.test.ts`
  - `src/lib/__tests__/tutor-session-log.test.ts`
  - `src/lib/__tests__/tutor-dialogue-manifest.test.ts`
  - `src/lib/__tests__/tutor-no-tts.test.ts`
  - `scripts/__tests__/tutor-intake.test.mjs`
  - `src/components/tutor/__tests__/TutorCallShell.test.tsx`
  - **Result:** **PASS** (`8/8` test files, **130/130** tests passed, Entry CSS under 300 KB)
- **Playwright E2E Suites (`--project=chromium-tutor`, scripted `StubEars` fixtures, ports `5173–5175` clear):**
  - `tests/e2e/tutor-full-lesson.spec.ts` (Lesson 1, Lesson 8, Gitar #11 invalid URLs, Gitar #12 typed answer without mic)
  - `tests/e2e/tutor-teacher-review.spec.ts` (Teacher CRM replay & 8-section Spanish report)
  - `tests/e2e/tutor-all-24-lessons.spec.ts` (All 24 lessons `/tutor/1`–`/tutor/24`, invalid URLs, `/tutor-avatar-preview.html` HTTP + Rhubarb visemes)
  - **Result:** **PASS** (**11/11** passed in `5.2m`)

## 3. Hard-Rule Compliance

- `/Users/ejn/Desktop/Gretel/cartilla-main` working tree untouched.
- Zero runtime/browser TTS (`speechSynthesis`), zero paid voice APIs, zero `nina-sordita.mp3` or rejected 67-clip ZIP references.
- Zero Supabase schema/migration changes.
- `public/cartilla/images/gretel/layers/manifest.json` remains `{"layers": []}` (unapproved face art not activated).
- `OwnerPhotoPencilSvg.tsx`, `PENCIL-CURSOR-SPEC.md`, Workbook `curl=a`, Flip Chart Candidate A, and `vercel.json` `git.deploymentEnabled: false` untouched.
- **Not merged to `main` and not deployed to production** (pushed ONLY to `origin feat/gretel-tutor-l1-3`, awaiting explicit owner approvals).
