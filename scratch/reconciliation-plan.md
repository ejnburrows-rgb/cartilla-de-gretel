# Branch reconciliation plan — `claude/paperback-to-crm-digitization-0vaqwi` → `main`

> Working/process note (scratch — not production docs). Snapshot taken
> 2026-06-19. `main` is actively moving (Antigravity commits), so treat the
> per-file specifics as a snapshot; the **strategy** below is robust to main
> advancing further.

## Snapshot

- Fork point (merge-base): `51a7dea`
- `main` at snapshot: `cd79724` — 26 commits ahead of fork
- This branch: 29 commits ahead of fork
- Files changed by this branch: **421**
- Files changed by main: **249**
- Files changed by **both** (naive overlap): **7**

## The real hazard is a directory rename, not the 7 overlaps

This branch **renamed** `src/routes/cartilla/teacher/` → `.../recursos/`
(8 files moved; 0 `teacher/` route files remain here). Meanwhile main kept
**building under `teacher/`** (14 route files changed/added there, plus a
whole "Drive UI" dashboard overhaul).

A straight `git merge` therefore pits "this branch deleted `teacher/`" against
"main heavily edited `teacher/`" — the rename/modify conflict class — on top of
421 vs 249 changed files. That's a large, error-prone merge.

## Recommended strategy: replay additive systems onto main (do NOT bulk-merge)

Almost all of this branch's *value* is in **additive, non-colliding** files
(new modules, tests, docs). The cleanest path:

1. Branch fresh off **current `main`**.
2. Bring over the additive systems below (copy/cherry-pick — they don't exist
   on main, so no conflicts).
3. Resolve the **7 overlap files** individually (table below).
4. **Drop** the two superseded pieces from this branch:
   - the **landing redesign** (`src/routes/index.tsx`) — main has its own
     newer landing; main wins.
   - the **`teacher/` → `recursos/` rename** — keep main's `teacher/`
     structure; do not re-apply the rename.
5. Regenerate `src/routeTree.gen.ts` (never hand-merge it).
6. `pnpm typecheck && pnpm exec vitest run && pnpm build` green, then PR.

This converts a 421-file merge into porting ~a dozen additive files plus 5
real 3-way resolutions.

## Additive value to preserve (mine-only — clean to port)

| System | Key files |
|---|---|
| Offline progress-sync queue | `src/lib/progress-queue.ts` (+ wiring in `src/lib/student-session.ts`) |
| Offline state UI | `src/components/cartilla/OfflineBadge.tsx`, `src/hooks/useOnlineStatus.ts` |
| Cache versioning + SW hardening | `src/lib/cache-version.ts`, `public/sw.js` (cache:"reload" HTML fetch, version bump) — *main hasn't touched `public/sw.js` since fork, so this ports clean* |
| Self-hosted fonts | `public/fonts/*.woff2` (clean add); plus the `@font-face` edits in `index.html`/`src/styles.css` (see overlaps) |
| In-lesson polish | `src/components/cartilla/KenBurnsSlideshow.tsx`, `BookArtFigure` fade-in |
| Test suite (+71 tests) | all of `src/lib/__tests__/*.test.ts` |
| Docs | `ARCHITECTURE.md`, `docs/deployment.md`, `docs/guia-de-uso.md` |

## The 7 overlap files — resolution

| File | This branch | main | Resolution |
|---|---|---|---|
| `src/routeTree.gen.ts` | rename-driven regen | route additions | **Regenerate** after merge (never hand-edit) |
| `src/routes/index.tsx` | minimal gateway landing | newer landing / Drive viewer | **Take main** (drop mine) |
| `src/routes/cartilla/leccion.$n.tsx` | cloud-progress hydration | unify workbook + games | **Take main**; re-apply cloud-progress hydration only if absent (student-path = Antigravity's lane) |
| `index.html` | self-host fonts (drop Google links) | restore workbook styles + TS fixes | **3-way**: keep main's fixes **and** the font self-hosting |
| `src/styles.css` | `@font-face` + book-art styles | restore workbook styles | **3-way merge** (both additive) |
| `src/components/gretel/GretelStage.tsx` | render children fix | workbook-style / TS fixes | **3-way** (both small; verify children render + main's fix coexist) |
| `src/lib/speak.ts` | praise-on-correct | mascot celebration | **3-way** (prefer main's richer feature; fold in praise if missing) |

## Notes

- `public/sw.js` is **not** in the overlap set — main hasn't modified it since
  the fork — so the service-worker cache fix is a clean, conflict-free port and
  is worth doing on its own even before a full reconciliation (it stops the
  stale-cache class of bug for every student).
- Numbers above are a snapshot; re-run to refresh:
  ```
  git fetch origin main
  BASE=$(git merge-base HEAD origin/main)
  comm -12 <(git diff --name-only $BASE..HEAD|sort) \
           <(git diff --name-only $BASE..origin/main|sort)
  ```
