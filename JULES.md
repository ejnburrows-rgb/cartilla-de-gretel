# JULES.md — La Cartilla de Gretel · Documentation Lane

> **2026-07-21 — Autonomous finish loop.** The full self-driving task queue for finishing this product
> (art restoration, born-digital presentation, backend go-live, reports, flipchart) now lives in
> **`docs/AGENT-LOOP.md`**, with one-prompt-at-a-time versions in **`docs/ACTION-PROMPTS.md`**.
> **Jules still cannot push to this repo** (its GitHub app lacks write access), so for any task in that
> loop Jules must output **draft files under `drafts/jules/<task>/` plus a written report** (diff, verify
> output, screenshots) and **never push or open a PR**. The owner must grant the Jules GitHub app
> push/write access before Jules work can land. Your safe docs-only lane below still applies to
> documentation tasks.

You are Jules. Your lane in this repo is DOCUMENTATION ONLY. Another agent is executing PLAN.md app work on main at the same time — you must NEVER touch app code, so there are zero conflicts.

## Hard rules
- You may create/edit ONLY these files: docs/ART-MAP.md, docs/TESTING-GUIDE.md, docs/CONTENT-STATUS.md, docs/TEACHER-HOWTO.md, docs/SECURITY-AUDIT.md. Never touch src/, public/, supabase/, configs, PLAN.md, PROGRESS.md, or any other file.
- Reading the whole repo is allowed and required. Writing outside your five files is forbidden.
- One task = one branch created from the LATEST origin/main = one PR. If you can merge your own PR after checks pass, merge it; if your environment cannot merge, leave the PR open and continue.
- Commit author: ejnburrows-rgb <ejnburrows@gmail.com>. No AI names, no "Co-authored-by" trailers.
- Honesty rule: never invent content. Student pages 78/82/86/90 and Teacher's Guide past mid-Lección 15 have no source — mark them AWAITING-SOURCE. Never claim art is missing without checking public/cartilla/art/hd/ first.
- Every PR: include a screenshot of the rendered document, plus: what shipped / what remains / blockers. No day labels like "tonight/tomorrow".

## Task queue (work in order, continuously)
1. docs/ART-MAP.md — For every workbook page slot (all 90), map: page → lesson → art file actually used in the manifest (HD / lineart / source scan) → status (HD-faithful done vs still scan-fallback). End with a short list of slots still lacking HD faithful art.
2. docs/TESTING-GUIDE.md — Plain-language guide: how to install cleanly, run the build, run the test suite, run the e2e scripts (including scripts/e2e-login-test.mjs), and what green output looks like. Written for a non-technical operator.
3. docs/CONTENT-STATUS.md — Per lesson 1–24: text status (verbatim vs pending), exercises status, art status, teacher-guide status. Honest AWAITING-SOURCE flags only where the source truly doesn't exist in-repo.
4. docs/TEACHER-HOWTO.md — Teacher-facing how-to built ONLY from existing in-repo sources: using the CRM, the flipchart presenter, the student workbook, class join codes, progress review, Escuchar and Imprimir. Never invent printed Teacher's Guide text.
5. docs/SECURITY-AUDIT.md — READ-ONLY security review (no code changes): auth gates on teacher routes, RLS assumptions, secrets handling, anything exposed. Findings + severity + recommended fix, as a report only.
