# LOOP-CLAUDE.md — self-driving worker loop (Claude Code on the web)

This file turns the backlog in `docs/ROADMAP-TO-100.md` into a hands-off loop.
Point a **push-capable** agent (Claude Code on the web) at this file and it will
drive the queue on its own, one task at a time, until every task is DONE or
BLOCKED.

> Why Claude Code and not Jules: Jules currently **cannot push** to this repo
> (its GitHub app lacks push access), so any branch it makes never lands. Until
> the owner grants that access (see `docs/OWNER-MANUAL-STEPS.md`), Jules is
> draft-only and this loop runs on Claude Code.

---

## The loop (repeat until no NOT STARTED tasks remain)

1. `git fetch origin && git reset --hard origin/main` — never build on a stale base.
2. Open `docs/ROADMAP-TO-100.md`. Pick the **FIRST** task with
   `Status: NOT STARTED`. Skip any task marked `Status: BLOCKED (owner)` — those
   are not yours (they live in `docs/OWNER-MANUAL-STEPS.md`).
3. Restate that task's **Done when** in one line before touching code.
4. Create a branch off `main`: `claude/<task-slug>`. Do only this one task —
   do not touch code belonging to any other task. Obey `AGENTS.md` at all times
   (author `EJN <ejnburrows@gmail.com>` via `git commit --author=`, never global
   config; no "Co-authored-by"/AI names; commit `type: short description`; never
   force-push; never hardcode secrets; never touch `src/routeTree.gen.ts`, the
   Gretel animation state machine, or invent art).
5. **Verify for real** — the bar is `pnpm typecheck && pnpm test && pnpm build`
   all green, PLUS the task's own `Proof` (a real screenshot from the running
   app for any UI change, never a description).
6. Open a PR into `main`. **Auto-merge policy:** if the verify bar is green,
   squash-merge it yourself. If red, fix and re-verify; do not merge red.
7. Flip the task's `Status:` to `DONE` in `docs/ROADMAP-TO-100.md` and append
   one line to `REPORT.md` (task name + what changed + PR number).
8. Do the Documentation Duty (`AGENTS.md`): update `docs/STATUS.md`, add one
   dated line to `docs/DECISIONS.md`.
9. Loop back to step 1.

## If stuck (after 3 attempts at the same error)

Set the task's `Status:` to `BLOCKED` in `docs/ROADMAP-TO-100.md`, write a short
block to `BLOCKED.md` (task, what you tried, exact error, best guess), then
**move on to the next NOT STARTED task** — never idle (`AGENTS.md`: "Never
stall").

## Guardrails specific to this repo

- The `pnpm build` step runs the content + art-color validators as gates
  (`scripts/validate-content.mjs`, `scripts/validate-art-color.mjs`). A red
  validator is a real failure, not a flake — fix the data, don't bypass the gate.
- Anything requiring a live Supabase project, new art coloring, or owner
  creative sign-off is **not** in this loop — it is in
  `docs/OWNER-MANUAL-STEPS.md`. Do not attempt those autonomously.
- Convention this loop mirrors: `.kilocode/skills/work/SKILL.md` (Worker
  Protocol). The only differences are: queue lives in `docs/ROADMAP-TO-100.md`,
  and this loop **continues** to the next task instead of stopping after one.
