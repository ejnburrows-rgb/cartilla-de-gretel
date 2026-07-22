# AGENT-LOOP.md — La Cartilla de Gretel · Autonomous Restoration & Finish Loop

**Owner:** EJN · **Approved:** 2026-07-21 · **Repo:** https://github.com/ejnburrows-rgb/cartilla-de-gretel · **Branch of truth:** `main`
**Stack:** Vite + React + TypeScript, pnpm · **Verify bar:** `pnpm typecheck && pnpm test && pnpm build`

This file is a **self-driving loop**. An agent reads it top to bottom, does the next unchecked task,
proves it, opens/merges a PR, flips the checkbox, appends a status-log line, and immediately picks the
next unblocked task. It repeats until every box is checked or it hits a real blocker.

---

## WHO RUNS THIS (read first)

- **Push-capable worker (e.g. Claude Code with write access):** do the full loop — branch, commit, push,
  open PR, squash-merge when the verify bar is green, then continue.
- **Jules, or ANY agent without push access:** as of 2026-07-21 the Jules GitHub app **cannot push to this
  repo**. Do **all the same analysis and work**, but write your output as **draft files under
  `drafts/jules/<task>/` plus a written report** (what you changed, the exact diff, verify output, and
  screenshots). **Never** attempt to push or open a PR. A human copies your draft in once push access is
  granted. **Prerequisite to fix this:** the owner must add the Jules GitHub app with **write/push**
  permission to this repo (GitHub → repo → Settings → Integrations/GitHub Apps) and re-run the task.

---

## OWNER-ONLY PREREQUISITES (agents cannot do these — they need accounts/secrets)

These unblock the teacher/student **cloud** tasks. Agents write and verify the code; only the owner can
create accounts and hold secrets.

1. **Supabase project** — create it, then put `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` into
   Vercel env + a local `.env`. Follow `docs/SUPABASE-SETUP.md`. Verify with `pnpm smoke:supabase`.
2. **Grant Jules push access** (see WHO RUNS THIS) if you want Jules working in the background.
3. **Welcome/landing splash (#243)** stays owner-only — no agent touches it.

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
- [ ] **Deferred to Task B (not yet needed):** update `scripts/validate-art-color.mjs` to accept
      `restored/` files that pass the acceptance test. No restoration pipeline / `restored/` files exist
      yet, so the validator stays as-is until B0 lands.

### TASK B — Restoration pipeline  *(parallel batches; branch `art/restore-<batch>`)*
- [ ] **B0. Build the pipeline script** `scripts/restore-art.mjs` (node) — runs ONLY the allowed ops
      (Real-ESRGAN 4× → denoise/speckle → paper-shadow removal → white-balance → palette normalize),
      writes to a mirrored `restored/` path, then runs the automated acceptance test (downscale+overlay+
      edge-map diff) on every output and fails the batch if any image drifts. **Free tools only**
      (Real-ESRGAN local binary or pip package + sharp/ImageMagick/Pillow). $0 — no paid APIs.
- [ ] **B1. Batch L1–L4** workbook art → restore → acceptance 100% → wire restored files into their exact
      page slots → verify bar → browser screenshot → PR → merge.
- [ ] **B2. Batch L5–L8**  (same protocol)
- [ ] **B3. Batch L9–L12**
- [ ] **B4. Batch L13–L16**
- [ ] **B5. Batch L17–L20**
- [ ] **B6. Batch L21–L24**
- [ ] **B7. Flipchart lane** (`public/cartilla/**` HD láminas) — cleanup only, never recolor or
      reinterpret; it is already full color.
- [ ] `abrigo, aguja, remolino, oruga, globo` — confirm still `pendiente`, do NOT restore/fabricate.

### TASK C — Born-digital presentation  *(own branch `feat/born-digital`; wire per page as its restored art lands)*
- [ ] Cut-out treatment: illustrations sit as individual elements on the clean warm-cream background. Kill
      the "scanned page pasted on screen" look — no visible page edges, perforations, spiral binding, or
      paper texture anywhere.
- [ ] All text is real web type — never letters baked into images.
- [ ] Depth: soft shadow under each illustration; slight parallax on page movement.
- [ ] Micro-motion ONLY on animals/objects inside activity illustrations (pose-frame flutter/float/blink).
      **Do NOT touch Gretel, her animation state machine, or the welcome splash (#243 — owner-only).**
- [ ] Page turns slow, elegant, physical: **horizontal for students, vertical for teachers**, selected
      automatically by role, no orientation toggle, respect `prefers-reduced-motion`.

### TASK D — Finish the rest of the product  *(after A; backend items need the owner prereqs)*
- [ ] **D1. Student cloud save** — verify lesson grading/progress writes to Supabase and reloads on another
      device. Branch `feat/student-cloud-progress`. (Needs Supabase prereq.)
- [ ] **D2. Teacher backend go-live** — run the full teacher CRM against a real Supabase DB (auth, classes,
      join codes, roster, RLS). Remove reliance on the demo/seed lane for real use. Branch
      `feat/teacher-backend-live`. (Needs Supabase prereq.)
- [ ] **D3. Reports precision + time** — the reports panel shows accuracy `—` and time `0 mins`; capture
      per-exercise accuracy and elapsed time at grade-time and surface them. Branch `feat/reports-metrics`.
- [ ] **D4. Flipchart slides for all 24 lessons** — only some lessons have real láminas; complete the deck
      (cleanup-only art, faithful). Branch `feat/flipchart-coverage`.
- [ ] **D5. English-toggle remnants (#162)** — ensure student UI is Spanish-only; remove leftover mixed
      strings. Branch `chore/spanish-only`.
- [ ] **D6. Lint pass (#245)** — clear the ~360 lint problems without behavior change. Branch `chore/lint`.

---

## STATUS LOG (append one dated line per merged PR; newest at top)
- 2026-07-22 — Task A verified already complete on `main` (Faithful Restoration Standard in AGENTS.md +
  DECISIONS.md). No redundant PR opened; loop file updated to check it off and adopt the "judged by
  output" tool-neutral wording. Next unblocked task: **B0 — build `scripts/restore-art.mjs`.**
- 2026-07-21 — AGENT-LOOP.md created; queue initialized. No tasks merged yet.
