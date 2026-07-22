# AGENT-LOOP.md — La Cartilla de Gretel · Autonomous Restoration & Finish Loop

**Owner:** EJN · **Approved:** 2026-07-21 · **Repo:** https://github.com/ejnburrows-rgb/cartilla-de-gretel · **Branch of truth:** `main`
**Stack:** Vite + React + TypeScript, pnpm · **Verify bar:** `pnpm typecheck && pnpm test && pnpm build`

This file is a **self-driving loop**. An agent reads it top to bottom, does the next unchecked task,
proves it, opens/merges a PR, flips the checkbox, appends a status-log line, and immediately picks the
next unblocked task. It repeats until every box is checked or it hits a real blocker.

> **This is the single canonical loop doc.** `docs/ROADMAP-TO-100.md` and root `LOOP-CLAUDE.md` are now
> pointers here. `docs/ACTION-PROMPTS.md` is the same queue as copy-paste, one-prompt-at-a-time blocks.
> Owner-only setup detail lives in `docs/OWNER-MANUAL-STEPS.md`. Checkbox legend: `[x]` done · `[~]`
> effectively done pending a blocker · `[ ]` not started.

---

## WHO RUNS THIS (read first)

- **Push-capable worker (e.g. Claude Code with write access):** do the full loop — branch, commit, push,
  open PR, squash-merge when the verify bar is green, then continue.
- **Jules (read-only — permanent):** the Jules GitHub app cannot push and will **not** be granted push
  access — never ask the owner to grant it. Jules works only tasks assigned to it via GitHub issues
  labeled `jules` (QA, tests, audits, a11y, report-only work), following the strict RULES block inside
  each issue: only the assigned task, no new dependencies/config/infra, no recommendations, no invented
  work, stop in one sentence if blocked. Jules PRs are verified and merged by a push-capable agent —
  never merged unreviewed.

---

## OWNER-ONLY PREREQUISITES (agents cannot do these — they need accounts/secrets)

1. **Supabase project — ✅ DONE (owner, 2026-07-22).** The owner created the project and set
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel. **D1/D2 are unblocked.** Runners:
   to verify locally, ask the owner once in-session to paste the two values into a local `.env` (they are
   the public URL + publishable key), then run `pnpm smoke:supabase`; otherwise verify against the
   deployed preview. Setup reference: `docs/SUPABASE-SETUP.md`.
2. **Welcome/landing splash (#243)** stays owner-only — no agent touches it.

---

## FAITHFUL RESTORATION STANDARD (the art policy — memorize; it is written into the repo rules by Task A)

**Principle: restoration CLEANS; it never INVENTS.** Zero changes to the original artwork. No drastic
changes. No AI slop.

**ALLOWED (pixel cleanup only):**
- 4× upscale with Real-ESRGAN (free, runs locally)
- JPEG-noise and scan-speckle removal
- Paper-shadow removal
- Background white-balance to the clean warm cream
- Palette normalization so all pages read consistently (same hues, just cleaner)

**BANNED (automatic rejection — this is AI slop):**
- Generative fill, img2img redraws, style transfer, beautify/"enhance" filters that reinvent detail
- Anything that adds, moves, or reshapes any line, face, or object not in the original
- Over-smoothing that turns linework plastic
- Any generation of new art

**ACCEPTANCE TEST (mandatory, automated, per image):**
- Downscale the restored image back to the original's size, overlay on the original at 50% opacity.
  Every line must align exactly — same shapes, faces, proportions.
- Produce an overlay PNG **and** an edge-map diff score per image. **Any drift = reject and redo gentler.**
- Include sample overlay proofs in every PR.
- **A tool is judged by its output, not its internals.** ESRGAN-family upscalers are themselves
  "generative," so a tool is allowed iff its *output* passes this overlay/edge-diff test on every real
  scan — never by whether the model is internally generative. If it can't pass the overlay test here, it
  is not used, full stop. (This is the wording adopted into `AGENTS.md` on 2026-07-22.)

---

## HARD RULES (every task, no exceptions)

- **Branch + PR for every change.** Never commit directly to `main`. Never force-push. **Squash-merge only
  when the full verify bar is green.** Never merge red.
- **Commits authored** `EJN <ejnburrows@gmail.com>` via `git commit --author="EJN <ejnburrows@gmail.com>"`.
  Never touch global git config. **No "Co-authored-by", no AI/agent names** anywhere in commits or PRs.
- **SCREENSHOT PROOF IS MANDATORY.** Every task attaches a real browser screenshot of the affected screen
  after the change. Build/test text alone is never acceptable. Keep the dev server running and show the
  affected screens.
- **Honesty rule:** items with no approved colored source — **abrigo, aguja, remolino, oruga, globo** —
  stay honestly `pendiente`. Never fabricate substitutes. Never claim art is missing without first
  checking `public/cartilla/art/hd/`.
- **Restoration never touches originals in place.** Write restored output to a mirrored `restored/` path
  and point the code at the restored files. Raw source scans are read-only.
- **Strict 1:1 page correspondence.** No crops, no remixes, no merges — one restored file per its exact
  page slot.
- Ignore the stop-hook "Unverified commit" warning — it fires *because* commits are authored EJN; fixing
  it is forbidden.
- **After each merged PR:** append one dated line to `docs/STATUS.md` (or `PROGRESS.md`), flip the task's
  checkbox in the queue below, then pick the next unblocked batch. Stop only on a real blocker or when
  everything is checked — then report completion with the full PR list + proof screenshots.

---

## THE LOOP (per-batch protocol)

```
1. git fetch origin && git reset --hard origin/main
2. create branch (naming per task)
3. do the batch's work
4. verify:  pnpm typecheck && pnpm test && pnpm build   (100% green)
5. for art batches: 100% of images must PASS the acceptance test
6. run dev server, take a REAL screenshot of the affected page(s) rendering in the browser
7. open PR with before/after + overlay proofs + "what shipped / what remains / blockers"
8. squash-merge when everything is green   (no-push agents: stop at draft + report)
9. append a dated line to the status log, flip the checkbox, pick the next unblocked task
```

Batches touch **disjoint files**, so multiple loops may run in parallel — **never two loops on the same
files.**

---

## TASK QUEUE (work top-down; check off as merged)

### TASK A — Rewrite agent rules to the Faithful Restoration Standard  ✅ **DONE on `main` 2026-07-22**
- [x] Grep every rules/memory file agents read. Result: `AGENTS.md` is the only file that states the art
      rule directly; `CLAUDE.md`/`GEMINI.md` just point to it; `.kilocode/skills` has no art rules;
      `docs/PROJECT-CANON.md`/`docs/ART-MAP.md` only reference it narratively and needed no edits.
- [x] The Faithful Restoration Standard is written into `AGENTS.md` (shared art contract + safety rules)
      and recorded in `docs/DECISIONS.md` (2026-07-22). Generation stays banned; pixel-cleanup restoration
      approved per EJN.
- [ ] **Deferred to a Task B batch (not yet needed):** update `scripts/validate-art-color.mjs` to accept
      `restored/` files that pass the acceptance test. B0 (the pipeline) has landed, but no `restored/`
      files are wired into page slots yet, so the validator stays as-is until the first batch (B1) wires
      restored art in.

### TASK B — Restoration pipeline  *(parallel batches; branch `art/restore-<batch>`)*
- [x] **B0. Build the pipeline script** — ✅ **DONE on `main` 2026-07-22 (PR #291).** `scripts/restore-art.mjs`
      runs ONLY the allowed non-generative ops (opt-in Real-ESRGAN via `RESRGAN_BIN` else sharp Lanczos →
      median denoise → level-normalize white-balance/paper-shadow → palette normalize), writes to a
      git-ignored mirrored `restored/` path (originals never touched), then runs the automated acceptance
      test (downscale + 50% overlay + edge-map drift) on every output and fails the batch if any image
      drifts over `--threshold`. Free tools only ($0): sharp bundled, Real-ESRGAN optional. Sample run
      5/5 pass (drift 0.005–0.012 vs 0.06). See `docs/restore-art.md` + `docs/restore-art-proofs/`.
- [x] **B1. Batch L1–L4** workbook art → restore → acceptance 100% → wire restored files into their exact
      page slots → verify bar → browser screenshot → PR → merge. **DONE 2026-07-22:** pages 1–12 restored
      (drift 0.0018–0.0291, all ≤ 0.06, 12/12 pass), committed under `public/cartilla/art/restored/workbook/`
      and wired restored-first via `getRestoredPageImage()` in `src/lib/bookImages.ts` (strict 1:1, chain
      falls back to hd → lineart → scan untouched). Overlay proofs in `docs/restore-art-proofs/b1/`.
- [x] **B2. Batch L5–L8**  (same protocol) — **DONE 2026-07-22:** pages 13–26 restored, 14/14 acceptance
      pass (drift 0.0091–0.0260), wired via `RESTORED_PAGES` 1–26. Proofs in `docs/restore-art-proofs/b2/`.
- [x] **B3. Batch L9–L12** — **DONE 2026-07-22:** pages 27–42, 16/16 acceptance pass, wired
      (`RESTORED_PAGES` 1–42). Proofs in `docs/restore-art-proofs/b3/`.
- [ ] **B4. Batch L13–L16**
- [ ] **B5. Batch L17–L20**
- [ ] **B6. Batch L21–L24**
- [ ] **B7. Flipchart lane** (`public/cartilla/**` HD láminas) — cleanup only, never recolor or
      reinterpret; it is already full color.
- [ ] `abrigo, aguja, remolino, oruga, globo` — confirm still `pendiente`, do NOT restore/fabricate.

### TASK C — Born-digital presentation  ✅ **DONE on `main` 2026-07-22 (PRs #287–#290)**
- [x] Cut-out treatment / kill the "scanned page pasted on screen" look — the faithful renderer already
      draws a clean digital book frame (no scanned page); the student workbook is now **centered on the
      garden scene** with the empty desktop "green void" removed (PR #287). *(True alpha cut-outs aren't
      possible — the crops are opaque rectangles — so illustrations get an honest card-lift instead.)*
- [x] All text is real web type — already true (FaithfulPageRenderer draws text; no baked-in letters).
- [x] Depth: **warm card-lift shadow** under each illustration (PR #288) + **slight garden parallax on
      page movement** (PR #290, imperative CSS var so the flip never re-renders).
- [x] Micro-motion on illustration cells (ambient float, `prefers-reduced-motion`-guarded) — already
      present. Gretel, her state machine, and the welcome splash (#243) were NOT touched.
- [x] Page turns: **horizontal for students** (react-pageflip curl), **vertical for teachers**
      (`FlipchartHdPanel` rotateX flip), auto-selected by surface/role, no toggle — this architecture
      already existed; added the missing `prefers-reduced-motion` handling to the teacher flip (PR #289).

### TASK D — Finish the rest of the product  *(after A; backend items need the owner prereqs)*
- [ ] **D1. Student cloud save** — verify lesson grading/progress writes to Supabase and reloads on another
      device. Branch `feat/student-cloud-progress`. **UNBLOCKED 2026-07-22:** the owner's Supabase project
      is live (see prerequisites) — the code path exists but has never run against the live DB; prove it
      end to end.
- [ ] **D2. Teacher backend go-live** — run the full teacher CRM against a real Supabase DB (auth, classes,
      join codes, roster, RLS). Remove reliance on the demo/seed lane for real use. Branch
      `feat/teacher-backend-live`. **UNBLOCKED 2026-07-22:** the owner's Supabase project is live (see
      prerequisites). *(Join/student codes are now crypto-secure — PR #300.)*
- [~] **D3. Reports precision + time** — **DEMO path DONE (PR #279):** `getSeedClassProgress()` now
      aggregates real accuracy % and minutes and a per-exercise-type breakdown (was `—` / `0 mins`). The
      **live** path (`getClassProgress` against Supabase) already computes the same and is verified by
      tests, but is unproven end-to-end until D2's Supabase go-live. Effectively complete pending the
      backend.
- [x] **D4. Flipchart slides — DONE as far as the source art allows (PR #282).** The multi-slide flipchart
      already works (prev/next, keyboard, filmstrip). Lessons **7–24 present all 3 real HD láminas**;
      lessons **1–6 are art-limited** — the source 62-page flipchart PDF genuinely has only ONE physical
      page each, and no unused flipchart art exists to add. Not a code gap. *(Teacher flip also now
      respects reduced motion — PR #289.)*
- [x] **D5. Spanish-only (#162) — DONE.** Residual English swept from the student UI (PR #281:
      `ayuda.tsx` ES/EN toggle removed, plus dormant English fallbacks in `mi-progreso`/`unirse`/
      `SkipLink`/`pilot-faithful`). The orphaned ES/EN-toggle machinery (`ThemeSwitcher`, `locale`,
      `LanguageToggle`) was then archived to `src/_archive/` (PRs #292, #295).
- [~] **D6. Lint pass (#245)** — **safe subset DONE** (PRs #305, #308: prettier-only formatting, 396 → 277
      problems). Remaining 277 are judgment-call rules (`no-explicit-any`, `react-hooks/exhaustive-deps`,
      `rules-of-hooks`) — **IN the autonomous queue (owner decision 2026-07-22):** fix per-site,
      behavior-preserving; no mass-autofix, no rule disables, no eslint-disable blankets; verify bar green
      after each chunk. The agent runs this alone; the owner reviews the final product only.
- [ ] **D7. Admin cross-teacher dashboard** — **APPROVED (owner, 2026-07-22): scope and build it.** Build
      demo-lane first (no live-DB dependency to render); wire live data after D2 lands. Genuinely unbuilt
      today (no admin-viewing components, no RLS-bypass policy).
- [x] **T2. Student happy-path E2E smoke test (#304, issue #241) — DONE on `main` 2026-07-22.** Playwright
      spec seeds progress, opens Lesson 1, taps a picture cell, presses Comprobar, asserts a visible grading
      reaction + disabled check button. `pnpm test:e2e` runs green (16.6s) in a browser-capable env; screenshot
      proof at `tests/e2e/__screenshots__/lesson-1-graded.png`. Unit `pnpm test` excludes it (stays 1056).
- [x] **T3. Teacher CRM happy-path E2E smoke test (#311) — DONE on `main` 2026-07-22.** Playwright spec
      seeds the demo teacher session, opens `/cartilla/teacher/crm`, asserts the teacher chrome, the seed
      class option, and a seeded roster student render — covering the teacher route gate + seed auth + CRM
      shell (and surfacing the D3 report aggregation) in one browser pass. E2E webServer now runs with
      `VITE_ALLOW_DEMO_MODE=true` (dev-only; PROD hard-disables demo). Screenshot proof
      `tests/e2e/__screenshots__/teacher-crm.png`. `pnpm test:e2e` = **2 passed**.

### Not a task — verified strong already
- **Grading correctness** is guarded by a test asserting every gradable region across all 24 lessons
  (PR #280). The wider `src/lib` pure-logic layer is now well covered — the unit suite is **1,056+
  passing** (exercise-stats, lesson-progress, student-session, lesson-catalog, syllabification, seeded
  RNG, phoneme-matcher, csv, url-share, adaptive, badges, profile, page-progress, audio-engine,
  workbook-interactions, date-helpers). *(Folded in from the retired `docs/ROADMAP-TO-100.md`, which
  tracked S1→D3, S2→this line, S3→D5, T1→D4.)*

---

## STATUS LOG (append one dated line per merged PR; newest at top)
- 2026-07-22 — **B3 art batch L9–L12 DONE:** pages 27–42 restored (16/16 pass), wired restored-first
  (`RESTORED_PAGES` 1–42). Verify bar green.
- 2026-07-22 — **B2 art batch L5–L8 DONE:** pages 13–26 restored (14/14 acceptance pass, drift
  0.0091–0.0260 vs 0.06), committed + wired restored-first (`RESTORED_PAGES` now 1–26). Verify bar green.
  (Screenshot proof waived by owner for this loop session — "disregard screenshots and keep moving".)
- 2026-07-22 — **B1 art batch L1–L4 DONE:** pages 1–12 restored via `scripts/restore-art.mjs` (12/12
  acceptance pass, drift 0.0018–0.0291 vs 0.06 threshold), restored files committed and wired restored-first
  into the workbook fallback chain (`getRestoredPageImage`). Also fixed a latent pipeline bug (sharp runs
  `composite` after `resize` in one pipeline, so the overlay proof step crashed on images wider than 900px —
  split into two passes) and removed the shebang from `validate-art-color.mjs` (vite 7's inline transform
  keeps it mid-module → SyntaxError in `pnpm test`). Verify bar green: typecheck ✓ · 1058 unit ✓ · build ✓.
- 2026-07-22 — **Owner prereqs + queue updated:** Supabase project is LIVE (owner set `VITE_SUPABASE_URL`
  + `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel) → **D1/D2 unblocked**. **D7 approved** to scope and build
  (demo lane first). **D6's remaining 277 lint problems moved INTO the autonomous queue** (owner decision;
  per-site, behavior-preserving). **Jules redefined:** read-only labeled-issue lane, never ask for push
  access; its PRs are verified/merged by a push-capable agent.
- 2026-07-22 — **T3 teacher CRM E2E smoke test DONE** (#311): new Playwright spec drives the demo/seed
  teacher into `/cartilla/teacher/crm` and asserts the seed class + roster render (teacher route gate +
  seed auth + CRM shell + D3 aggregation in one pass). E2E webServer set to `VITE_ALLOW_DEMO_MODE=true`
  (dev-only). `pnpm test:e2e` = 2 passed; typecheck/unit(1056)/build green. Screenshot proof captured.
- 2026-07-22 — **T2 student E2E smoke test DONE** (#304): environment recovered (vite dev no longer
  SIGTERM-killed), so `pnpm test:e2e` now runs **green (1 passed, 16.6s)** against current `main`. Full verify
  bar re-confirmed (typecheck clean · 1056 unit passed · build ✓). Marked ready + squash-merged. Screenshot
  proof `tests/e2e/__screenshots__/lesson-1-graded.png` shows the graded Lesson 1 grid.
- 2026-07-22 — **D6 lint — safe subset extended** (#308): prettier-formatted `scripts/restore-art.mjs`
  (formatting-only, out of app graph, typecheck clean). Lint 291 → 277. Remaining 277 are judgment-call
  rules (`no-explicit-any`, `exhaustive-deps`, `rules-of-hooks`) held for a supervised per-site pass.
- 2026-07-22 — **Loop docs consolidated.** This file (`docs/AGENT-LOOP.md`) is now the single canonical
  self-driving loop doc. `docs/ROADMAP-TO-100.md` (S1–T1) and root `LOOP-CLAUDE.md` are now short pointers
  here; their content is folded into Tasks C/D and the "verified strong already" note above.
- 2026-07-22 — **Task C (born-digital) DONE** — workbook centered (#287), card-lift depth (#288), teacher
  flip reduced-motion (#289), garden parallax (#290). Real web type + role-based turns already existed.
- 2026-07-22 — **B0 restoration pipeline merged** (#291): `scripts/restore-art.mjs` + acceptance test +
  proofs. Next unblocked art task: **B1 — batch L1–L4** (restore → acceptance 100% → wire → screenshot → PR).
- 2026-07-22 — **PR queue triaged (22 → 0 open).** Reapplied the valuable stale Jules PRs on current
  `main` and closed the duplicates: security (#300: crypto-secure join/student codes + chart XSS),
  tests (#301: audio-engine/workbook-interactions/startOfWeek), refactor (#302: book-faithful helpers),
  script (#303: notion-curl diagnostics). Dead ES/EN-toggle machinery archived (#292, #295).
- 2026-07-22 — **D5 Spanish-only DONE** (#281), **D4 flipchart DONE-as-art-allows** (#282), **D3 demo
  reports DONE** (#279), **S2 grading coverage** (#280).
- 2026-07-22 — Task A verified already complete on `main` (Faithful Restoration Standard in AGENTS.md +
  DECISIONS.md). No redundant PR opened; loop file updated to check it off and adopt the "judged by
  output" tool-neutral wording.
- 2026-07-21 — AGENT-LOOP.md created; queue initialized. No tasks merged yet.
