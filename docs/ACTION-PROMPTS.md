# ACTION-PROMPTS.md — La Cartilla de Gretel · Copy-paste prompts for coding agents

Ready-to-paste prompts, in priority/dependency order. Each block is one task for one agent. Paste it as-is.
Every prompt assumes: **branch + PR per change, verify bar `pnpm typecheck && pnpm test && pnpm build`,
commits authored `EJN <ejnburrows@gmail.com>` with no AI trailers, and a real browser screenshot in the PR.**

> Prefer the self-driving version? Point the agent at **`docs/AGENT-LOOP.md`** instead and say
> "run the loop." This file is the manual, one-prompt-at-a-time equivalent.

---

## P0 — OWNER MANUAL STEPS (you, not an agent)
1. Create a Supabase project; add `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` to Vercel and a
   local `.env` (see `docs/SUPABASE-SETUP.md`). Confirm with `pnpm smoke:supabase`.
2. If you want Jules working in the background, grant the **Jules GitHub app push/write access** to this
   repo. Until then Jules can only produce draft files + a report (it cannot push).
3. Leave the welcome/landing splash (#243) to yourself — no agent touches it.

---

## 1 — Rewrite art rules to the Faithful Restoration Standard  *(do this first)*
```
Read docs/AGENT-LOOP.md, section "FAITHFUL RESTORATION STANDARD". Grep every agent rules/memory file in
this repo (AGENTS.md, CLAUDE.md, .kilocode/**, .kilo/**, docs/PROJECT-CANON.md, docs/DECISIONS.md,
docs/image-restoration-workflow.md). In each, replace the blanket "no AI-touched art" ban with the
Faithful Restoration Standard (generation stays banned; pixel-cleanup restoration is approved per EJN
2026-07-21). Keep all other rules intact. Update scripts/validate-art-color.mjs to accept files under
restored/ that pass the acceptance test and still reject unfaithful art. One small PR, branch
rules/faithful-restoration. Verify bar green, screenshot the rendered README/diff.
```
**Done when:** every rules file carries the new standard, validator updated, PR merged.

## 2 — Build the restoration pipeline script
```
Create scripts/restore-art.mjs (node, free tools only: Real-ESRGAN local + sharp/ImageMagick/Pillow). It
must run ONLY the allowed ops from the Faithful Restoration Standard (4x upscale, denoise/speckle removal,
paper-shadow removal, white-balance to warm cream, palette normalize), write output to a mirrored
restored/ path (never modify originals), then run an automated acceptance test on every output: downscale
to original size, overlay at 50%, emit an overlay PNG + edge-map diff score, and FAIL the run if any
image drifts. No paid APIs, $0. Branch feat/restore-pipeline. Include overlay proofs + a screenshot.
```
**Done when:** script runs end-to-end on a sample batch with passing overlays.

## 3 — Restore artwork, one batch per PR  *(repeat for L1-L4, L5-L8, L9-L12, L13-L16, L17-L20, L21-L24, flipchart)*
```
Using scripts/restore-art.mjs, restore the <BATCH> workbook art. 100% of images must PASS the acceptance
test. Wire each restored file into its exact page slot (strict 1:1 — no crops/remixes/merges). Do NOT
touch abrigo, aguja, remolino, oruga, globo (stay pendiente). Branch art/restore-<batch>. Run the dev
server and screenshot the affected pages rendering the restored art. PR with before/after + overlay
proofs. Batches are disjoint so this can run in parallel with other batches — never share files.
```
**Done when:** all 7 batches merged, every page shows clean restored art or honest `pendiente`.

## 4 — Born-digital presentation
```
Read docs/AGENT-LOOP.md Task C. Make pages look born-digital WITHOUT altering artwork: cut-out
illustrations on the warm-cream background (no page edges/perforations/spiral/paper texture), all text as
real web type, soft shadow + slight parallax, micro-motion only on animals/objects inside activity
illustrations. Do NOT touch Gretel, her state machine, or the welcome splash (#243). Page turns:
horizontal for students, vertical for teachers, auto by role, respect prefers-reduced-motion. Branch
feat/born-digital, wire per page as restored art lands. Screenshot each affected screen.
```

## 5 — Student cloud progress  *(needs P0 Supabase)*
```
Verify student lesson grading + progress write to Supabase and reload on a second device/session. Fix any
gaps so a joined student's progress persists to the cloud, not just localStorage. Branch
feat/student-cloud-progress. Prove with a screenshot of progress surviving a fresh session.
```

## 6 — Teacher backend go-live  *(needs P0 Supabase)*
```
Run the full teacher CRM against the real Supabase DB: sign-up/sign-in, create class, join codes, roster,
progress, RLS. Make real (non-demo) teacher use work end-to-end; keep the demo/seed lane for previews
only. Branch feat/teacher-backend-live. Screenshot a real logged-in teacher creating a class + seeing a
student's live progress.
```

## 7 — Reports precision + time
```
The teacher Reports panel shows accuracy "—" and time "0 mins". Capture per-exercise accuracy and elapsed
time at grade-time, store them, and surface them in the reports table + CSV export. Branch
feat/reports-metrics. Screenshot the reports panel with real numbers.
```

## 8 — Flipchart coverage for all 24 lessons
```
Only some lessons have real flipchart láminas (lesson 1 shows a single slide). Complete the projector deck
for all 24 lessons using faithful, cleanup-only art. Branch feat/flipchart-coverage. Screenshot several
lessons' slides in the presenter.
```

## 9 — Spanish-only cleanup (#162) & 10 — Lint pass (#245)
```
9: Ensure the student UI is fully Spanish; remove leftover English-toggle strings/mixed screens. Branch
chore/spanish-only. Screenshot the previously-mixed screens now clean.
10: Clear the ~360 eslint problems with no behavior change. Branch chore/lint. Paste before/after
`pnpm lint` counts and confirm the verify bar stays green.
```

---

### Priority order (dependencies)
1 → 2 → 3 (parallel batches) → 4 (per page as art lands). In parallel once P0 done: 5, 6, 7, 8. Anytime: 9, 10.
