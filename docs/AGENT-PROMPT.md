# Autonomous Agent Prompt — La Cartilla de Gretel

**How to use:** open your coding agent in this repo and say: "Read docs/AGENT-PROMPT.md and execute it."

---

Repo: github.com/ejnburrows-rgb/cartilla-de-gretel — owner ejnburrows-rgb. Vite + React + TS, TanStack Router, Tailwind, pnpm, Supabase, deployed on Vercel. Live: https://cartilla-de-gretel.vercel.app

This is a children's literacy workbook app with a teacher dashboard. It is NOT a CRM. The correct name is "La Cartilla de Gretel" — never write "Gretchen". Deadline: August 4, 2026.

Read first: AGENTS.md, docs/PROJECT-CANON.md, docs/STATUS.md, docs/SPEC.md, docs/DECISIONS.md.

## RULES

- Never commit to main. Branch + PR only. The owner merges.
- Lesson order, pedagogy, and artwork are the owner's alone. You may report problems with them. You may not change them. Never edit the illustrations.
- Keep the "ilustración pendiente" placeholder behavior exactly as it is.
- Proof required: file:line, test output, or a screenshot.
- Run the existing Playwright suite before every PR.

## PHASE 1 — FIX THE TAUGHT-ORDER VIOLATION (issue #359)

Branch fix/decoy-syllable-order. In src/content/games/syllable-builder-pilot.ts, the word-builder offers decoy tiles built from syllables the child has not been taught yet. The clear violation is silabas-o (words oso, ola, oveja) offering decoys "sa" and "lo" — s and l are not taught at the vowel stage. Fix that one.

Two are defensible and you should leave them unless the canon says otherwise: silabas-m (mi, me) and silabas-p (pe, pi, po) draw from the same syllable family the book introduces together.

Separately: the p lesson (lesson 8) uses the word "sopa", which needs "so", but s is lesson 9 — and its image is borrowed from leccion-9-s/sopa.webp. Do NOT change the word list. Report it to the owner as a content decision with the file:line.

The 19 existing tests do not catch order violations. Add a test that walks every lesson and fails if any tile uses a syllable from a later lesson. That test is the real deliverable.

## PHASE 2 — SECRETS AND MINORS' DATA AUDIT

Branch chore/minors-data-and-secrets-audit. This app holds data about children, so this matters more than usual.
- Confirm only VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY reach the browser bundle. Any service-role key in client code is a Blocker — report immediately, do not "fix and move on."
- Check Supabase row-level security on every table holding student data. Report exactly which tables are unprotected. Do not loosen any policy.
- Report what student personal data is stored, where, and for how long. Report only — retention policy is the owner's decision.

Output: docs/DATA-AUDIT.md, findings tiered Blocker / High / Cleanup.

## PHASE 3 — TEST THE TWO FLOWS THAT ACTUALLY MATTER

Branch test/teacher-and-student-flows. Extend the existing Playwright config, don't build a new harness. Cover end to end:
- teacher: create class → get join code → student joins → assign a lesson → see progress
- student: open assignment → complete a lesson → progress saves and survives a page reload

Done when both run green in CI and you've listed any step you could not automate and why.

## PHASE 4 — ONE HONEST LIST OF MISSING ART

Branch docs/art-reconciliation. docs/MISSING_ASSETS.md and docs/ART_BACKLOG.md (54KB) overlap and contradict each other. Reconcile them into a single list titled "Ilustraciones que faltan": every image the app expects but does not have, with the lesson it belongs to and the exact file path expected. No commentary on style. This becomes the owner's art to-do list.

## DO NOT TOUCH

Issue #356 (the garbled generated sign text in the welcome splash — HARAMIDJA / BJAARIAMRAGE / HENDL). That needs regenerated art and it is the owner's decision. Skip it entirely.

## STOP AND ASK

Lesson order, word lists, art, deadlines, anything client-facing in Spanish.

Then stop and write docs/SCRUB-REPORT.md on branch docs/scrub-report.

PR body format: What changed · Why · What the owner should check · What is still not done · Proof.
