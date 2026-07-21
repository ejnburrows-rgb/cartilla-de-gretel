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
