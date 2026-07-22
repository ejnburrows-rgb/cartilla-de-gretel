# DECISIONS — La Cartilla de Gretel

A dated, plain-language log of technical decisions. One line each: what was
decided and why. Newest at the bottom. This is a duty, not optional (see the
DOCUMENTATION DUTY section of `AGENTS.md`).

- **2026-07-21 — Wave 2 mechanical items completed directly (owner chose "B").**
  Since Jules still can't push, the four non-creative Wave 2 issues were built
  and merged directly: #163 (theme-toggle a11y, PR #250), #244 (remove English
  toggle → Spanish-only, PR #251), #164 (dark-mode contrast on `unirse` +
  `.dark` card tokens, PR #252), #165 (homepage theme toggle, PR #253). Suite
  at 546 passing. The landing redo (#243) is intentionally NOT built yet — it
  is the previously-rejected creative splash and needs the owner's eyes before
  merge. For #164, the "styles.css only" constraint was relaxed to also edit
  `unirse.tsx` (the collision reason had cleared once #244 merged, and a
  CSS-only override of hardcoded colors would have been a fragile hack).
- **2026-07-21 — Wave 1 completed directly (Jules push was broken).** The
  background agent could not push its generated branches to GitHub, so both
  Wave 1 tasks were implemented and merged directly: #239 Supabase go-live kit
  (PR #247) and #240 teacher-CRM test coverage (PR #248, +12 tests, suite 545).
  `jules` was deliberately NOT applied to the Wave 2 issues: the Jules pipeline
  still cannot push, and the landing redo (#243) needs the owner's creative
  sign-off before any auto-build. Wave 2 stays staged for either direct
  completion or Jules once its GitHub push access is fixed.
- **2026-07-21 — Wave 1 review + owner decisions applied; Wave 2 staged.**
  - **Landing screen:** approved direction is Gretel alone using existing
    approved art — no animal crowd, no newly commissioned painting. Filed as
    Wave 2 issue #243.
  - **English toggle:** removed entirely so the interface is Spanish-only
    (matches the "no English in student UI" rule), instead of finishing the
    half-done translation. QA issue #162 closed as resolved-by-removal; the
    removal is Wave 2 issue #244.
  - **QA bugs #163 (theme-toggle accessibility), #164 (dark-mode contrast),
    #165 (homepage theme control)** folded into Wave 2 with full self-contained
    prompts, each scoped to a different file so they never collide.
  - **Admin cross-teacher dashboard:** deferred post-launch. Not scoped, not
    filed.
  - **Lint cleanup (~362 problems):** deferred to Wave 3 as a single careful,
    behavior-preserving pass (issue #245). No auto-fixing done now.
  - **Stray pull requests:** #233 (empty wrong-repo placeholder) closed;
    #232 (README + teacher guide, built on a stale `main`) closed without
    merging because it would have reverted recent docs work — its accurate
    teacher guide was salvaged to `docs/GUIA-RAPIDA-DOCENTE.md` and its
    `npm`→`pnpm` README fixes re-applied on current `main`.
  - **Wave 2 launch gating:** NOT launched. Wave 1 (#239, #240) is not yet
    complete — the background agent generated the code but could not push its
    branches to GitHub, so no Wave 1 PR exists. Wave 2 issues stay labeled
    `wave-2` (and `wave-3` for lint); none were promoted to `jules`.
- **2026-07-21 — Full sweep completed; execution plan created.** Reviewed the
  whole project, wrote the analysis into `docs/STATUS.md`, and filed the
  agent-doable remaining work as GitHub issues (Wave 1 = label `jules`,
  #239 Supabase go-live kit and #240 teacher-CRM test coverage; Wave 2 =
  label `wave-2`, #241 student end-to-end smoke test). Owner-decision items
  (live Supabase credentials, landing-screen direction, admin dashboard,
  ghost CI workflow, lint pass, the i18n/theme QA bugs #162–#165) were kept
  out of the auto-run list on purpose. To honor both "each issue updates
  STATUS" and "same-wave tasks never touch the same file," each issue writes
  its done-note to its own `docs/status-updates/<slug>.md` fragment, which is
  consolidated afterward.
- **2026-07-21 — Adopted the AGENTS.md documentation standard.** `AGENTS.md`
  is now the single source of truth every agent reads; `CLAUDE.md` and
  `GEMINI.md` are one-line pointers to it. The owner's full accumulated rules
  (previously the whole of `CLAUDE.md`) were preserved word-for-word in
  `docs/PROJECT-CANON.md` so nothing was lost — this was a relocation, not a
  deletion.
- **2026-07-21 — Standardized the commit author to `EJN
  <ejnburrows@gmail.com>`.** An older doc listed `ejnrcg@yahoo.com`; recent
  history and the owner's instruction both use the gmail address, so the docs
  now say gmail to remove the conflict.
- **2026-07-21 — Added MCP (Model Context Protocol) server config.** Created
  `.mcp.json` (Claude Code format) and `.vscode/mcp.json` (VS Code format)
  declaring playwright, memory, filesystem, and fetch servers so agent tools
  can drive a browser, remember project facts, read/write files, and load web
  pages. ("MCP" = a standard way to give an AI assistant extra tools.) The
  fetch server is declared as `uvx mcp-server-fetch` because the npm package
  the original toolkit note named does not exist.
- **Earlier (visible in the codebase) — File-based routing via TanStack
  Router.** Screens live as files under `src/routes/`; `src/routeTree.gen.ts`
  is generated automatically and is never hand-edited.
- **Earlier — All database access goes through `src/services/` and Supabase,
  with row-level-security migrations in `supabase/migrations/`.** Keeps every
  data call in one place and enforces per-user access rules in the database.
- **Earlier — Faithful page rendering.** Book pages are described as data in
  `src/data/page-layouts.json` and drawn by `FaithfulPageRenderer`, so the
  student workbook and teacher flipbook stay page-faithful from one source.
- **Earlier — Real book art only, never invented art.** Illustrations are
  tight color crops from the authentic book scans; when no real crop exists,
  the cell honestly shows "pendiente" rather than a fake. A build-time
  validator (`scripts/validate-art-color.mjs`) guards this.
- **Earlier — Gretel is a fixed-corner, event-driven guide.**
  `GretelLiveAvatar` places her in a screen corner so she never covers
  content, and she only speaks in reaction to real student events.
- **2026-07-21 — Self-driving worker loop adopted (`LOOP-CLAUDE.md` +
  `docs/ROADMAP-TO-100.md`).** Jules can't push to this repo, so the
  autonomous queue runs on Claude Code instead; it auto-merges a task's PR
  once the verify bar (`pnpm typecheck && pnpm test && pnpm build`) is
  green. Backend provisioning and creative sign-offs are kept out of the
  loop in `docs/OWNER-MANUAL-STEPS.md`; the ~362-item lint cleanup (#245)
  is deliberately excluded from the autonomous queue too.
- **2026-07-21 — Fixed seed-mode teacher reports showing "—" / "0 mins".**
  `getSeedClassProgress()` now aggregates score/total/time from seed events
  the same way the live `getClassProgress()` does, instead of hardcoding
  null/zero — the first task completed by the new worker loop.
- **2026-07-21 — Added grading regression coverage for all 24 lessons (S2).**
  Chose to drive the test off the real content data
  (`page-layouts.json` via `getWorkbookPagesForLesson`/`getPageLayout`) rather
  than mounting each `Interactive*`/`Lasso*` React component per exercise:
  the actual risk this task targets is a broken answer key in the content,
  not drift in the (small, stable, already-covered-elsewhere) grading
  components, and a data-level test runs all 385 assertions in about a
  second. Also added explicit "answer key is structurally valid" assertions
  (exactly one correct choice per `vowel-pick-one` row / `fill-in-blank`
  item, at least one correct entry per `picture-grid`/`vowel-line-match`/
  `syllable-match` group) after finding that flipping a `correct: true` flag
  to `false` without an accompanying structural check silently made that row
  "ungraded" instead of failing.
- **2026-07-21 — Removed `ayuda.tsx`'s standalone ES/EN toggle (S3), left
  `ThemeSwitcher.tsx`/`lib/locale.ts` alone.** The audit found `ayuda.tsx`
  running its own local language switch that the earlier #162/#251 English
  removal never touched (it predates/parallels the app-wide
  `LanguageContext`, not gated by it) — deleted the `en` copy branch and
  toggle UI rather than keep dead-weight bilingual data around. By contrast,
  `ThemeSwitcher.tsx` and `lib/locale.ts` also contain leftover ES/EN-toggle
  code but have zero importers anywhere in `src`, so no student screen can
  render them; left them in place as a follow-up cleanup item rather than
  widen this task's diff to files with no reachable user impact.
- **2026-07-21 — Closed T1 (flipchart multi-slide decks) with no code
  change; documented art-limited lessons instead.** Investigation showed
  `FlipchartHdPanel.tsx` already correctly renders and navigates multi-page
  decks for any lesson with more than one flipchart page — lessons 7–24
  already had this working. Lessons 1–6 show only one page because the
  source 62-page flipchart PDF genuinely has only one physical page for
  each of them, not because of a bug or a hardcoded slice; there is no
  additional flipchart art anywhere in the repo to add. Rather than force a
  change onto working code, recorded the art-limited lessons (1–6) in
  `REPORT.md` per the task's own "if a lesson genuinely has only one
  faithful slide available, leave it and note which lessons are
  art-limited" instruction.
- **2026-07-22 — Adopted the Faithful Restoration Standard; kept a stricter
  gate on generative upscalers than the request literally described.**
  Owner confirmed (in chat, after being challenged directly) approval for
  pixel-cleanup restoration on top of already-faithful crops: upscaling,
  noise/speckle/shadow removal, white-balance, palette normalization — all
  gated by a mandatory per-image overlay/edge-diff acceptance test against
  the original. Wrote this into `AGENTS.md` (the shared art contract +
  safety rules), the only file in the repo that states the art rule
  directly (`CLAUDE.md`/`GEMINI.md` just point to it; `.kilocode/skills`
  has no art rules; `docs/PROJECT-CANON.md`/`docs/ART-MAP.md` only
  reference the rule narratively and needed no edits). One deliberate
  divergence from the literal request: the requested wording listed
  Real-ESRGAN under "allowed" while banning "generative fill" in the same
  breath — Real-ESRGAN is itself a generative model, so that framing was
  self-contradictory. The rule as written instead judges any tool
  (ESRGAN-family included) strictly by whether its *output* passes the
  overlay/edge-diff test on every image, not by whether it's internally
  generative — a stricter, more honest, still-compliant version of the
  same standard. No restoration pipeline exists yet (that's a separate,
  much larger follow-up); this change only updates the governing rule
  text, verified with the full `pnpm typecheck && pnpm test && pnpm build`
  bar before merging.
