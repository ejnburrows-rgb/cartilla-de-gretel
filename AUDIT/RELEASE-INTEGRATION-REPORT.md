# Release Integration Report

**Branch:** `feat/elearning-crm-ui`  
**Generated:** 2026-07-12  
**Base:** `origin/main` @ `bd1a47b5f7127b7ded67a56bfd511ea150e68883`

## Terminals

| Area | Terminal |
|---|---|
| Workbook | **WORKBOOK_INTEGRATION_COMPLETE** |
| CRM depth | **CRM_DEPTH_VERIFIED** (local/seed + unit tests) |
| CRM cloud | **CRM_CLOUD_HARD_BLOCKED** |
| Activities | **ACTIVITIES_PARTIAL** |
| Release candidate | **RELEASE_CANDIDATE_BLOCKED** (cloud secrets + activity pending statuses) |

---

## 1. Main SHA used as integration base

`bd1a47b5f7127b7ded67a56bfd511ea150e68883`  
`docs(audit): add Agent 4 asset & art coverage coverage report`

---

## 2. Exact commits integrated from each PR

### From #166 `feat/lineart-fallback-chain` (INCLUDED)

| Source SHA | Integrated SHA | Summary |
|---|---|---|
| `3abfc23` | `235592c` | Workbook art fallback chain HD → lineart → source scan |

### From #167 `feat/living-workbook-engine` (INCLUDED as base of #168)

| Source SHA | Integrated SHA | Summary |
|---|---|---|
| `5d83f77` | `32b36d9` | LivingWorkbookPage engine + interaction components |

### From #168 `feat/workbook-manifest-pipeline` (INCLUDED — canonical workbook stack)

| Source SHA | Integrated SHA | Summary |
|---|---|---|
| `122c49f` | `a9bc15e` | Manifest schema, validator, builder, progress-events |
| `f75504d` | `b3ee265` | Wire real content through manifest → LivingWorkbookPage |
| `fe288f4` | `b429818` | Expand to all 90 real source-backed pages |

### From #169 `feat/living-workbook-pipeline` (SUPERSEDED)

Not cherry-picked. Parallel implementation (`src/lib/workbook-manifest.ts` + monolithic LivingWorkbookPage + sandbox-only route) conflicts with and is less complete than #168’s interaction registry, schema, and tests.

### From #170 `feat/functional-crm-completion` (INCLUDED)

| Source SHA | Integrated SHA | Summary |
|---|---|---|
| `00bc38c` | `bf49d1b` | Functional CRM — roles, assignments, progress module |
| `135f095` | `25f549d` | Honest FINAL-FUNCTIONAL-CRM audit status |
| `747dd8f` | `2fdffd2` | Lalilo-style CRM depth (tiles, drill-down, reports, CSV) |
| `1a6a9cb` … `1e4c2d3` | `6a7bcf5`…`e3e5780` | Cloud audit honesty + e2e/rls script shells |

### From remote `feat/elearning-crm-ui` tip history

**Not re-applied.** Features already present on `main` via merged PRs #152–#154 (teacher guía, teacher auth gate, drag vowel exercise, tracing). Cherry-picks conflicted; main already carries the production code.

### Integration-local commits (this run)

- Production routes: `/cartilla/ayuda`, `/cartilla/student/libro-vivo`
- Splash + CRM sidebar help links
- Real cloud E2E + RLS scripts (env-gated)
- Activity inventory script + release-integration tests
- Progress-events memory fallback for test envs
- Browser QA script + screenshots under `generated/release-integration-qa/`

---

## 3. PR disposition table

| PR | Branch | Disposition | Reason |
|---:|---|---|---|
| #166 | feat/lineart-fallback-chain | **Included** | Production image fallback chain |
| #167 | feat/living-workbook-engine | **Included** (via #168) | Engine base; alone only sandbox |
| #168 | feat/workbook-manifest-pipeline | **Included** | Canonical manifest + engine + 90 pages |
| #169 | feat/living-workbook-pipeline | **Superseded** | Duplicate engine/manifest; sandbox-only; weaker interaction model |
| #170 | feat/functional-crm-completion | **Included** | CRM depth + honest cloud blocker docs |
| #140 | feat/content-extraction | **Excluded** | Out of scope; not required for this RC |
| remote elearning tip | feat/elearning-crm-ui | **Superseded by main** | Already merged under other PR numbers |

**After this integration PR is approved and merged, close:** #166, #167, #168, #169, #170 (and leave #140 alone unless separately decided).

---

## 4. Workbook page and lesson counts

| Metric | Value | Evidence |
|---|---:|---|
| Catalog lessons | 24 | `TOTAL_LESSONS` / `CATALOG` |
| Manifest application pages | 90 | `src/content/workbook/workbook-manifest.json` |
| Lessons covered in manifest | 24 | inventory script |
| HD workbook assets present | page-001…092 | `public/cartilla/art/hd/workbook/` |
| Lineart fallback assets | 94 files | `public/cartilla/art/hd/lineart/` |

Canonical implementations on this branch:

- **Manifest:** `src/content/workbook/workbook-manifest.json` + loader/adapter/schema  
- **Renderer:** `src/components/cartilla/LivingWorkbookPage.tsx`  
- **Interaction registry:** `src/cartilla/interactions/*`  
- **Page asset fallback:** `src/lib/bookImages.ts` `getWorkbookPageFallbackChain`  
- **Lesson→page routing:** catalog ranges + `buildPageArray` (production lessons) + manifest pages (libro-vivo)

Production student routes remain FaithfulPageRenderer-based; living engine is production-routed at `/cartilla/student/libro-vivo` and still available in dev sandboxes.

---

## 5. Activity completeness by lesson

Terminal: **ACTIVITIES_PARTIAL**

Executed inventory: `generated/release-integration-qa/activities-inventory.json`

| Band | Lessons | Notes |
|---|---|---|
| Ready exercise packs | 1–5, 7, 9 | `studentFacingStatus: "ready"` |
| Incomplete (pending packs) | **6, 8, 10–24** | Exercise files exist but status is `pending` (not decorative-only, but not marked ready) |
| Living manifest interactions | all 90 pages `kind=none` | Engine ready; census interactions not graded content |

Honest note: living-engine interactions are not proof of lesson completeness. Production interactions live in FaithfulPageRenderer + `src/data/lesson-exercises/*`.

---

## 6. CRM feature evidence

| Feature | Evidence |
|---|---|
| 24-tile lesson grid | `LessonTileGrid.tsx` + CRM student index route |
| Completed / in-progress / not-started / assigned | `progress-calculation.ts` + tests |
| Class overview | `crm.$classId.index.tsx` |
| Students needing attention | `needsAttention` + TaskList/pipeline |
| Panel → class → student → lesson | Nested CRM routes |
| Refresh-safe navigation | File-based routes with params |
| Family report | `crm.$classId.$studentId.reporte.tsx` |
| CSV export | `csv-export.ts` + unit tests |
| Seeded demonstration lane | `seed-data.ts` + `isSeedSessionActive` |
| CRM depth screenshots (from #170) | `generated/crm-depth-qa/*` |

Unit tests executed (suite summary): progress-calculation 23, csv-export 5, auth-role 4 passed.

---

## 7. Cloud E2E and RLS evidence

**Terminal: CRM_CLOUD_HARD_BLOCKED**

Env check (presence only, no values printed):

```
E2E_TEACHER_A_PASSWORD=MISSING
E2E_TEACHER_B_PASSWORD=MISSING
VITE_SUPABASE_URL=MISSING
VITE_SUPABASE_PUBLISHABLE_KEY=MISSING
```

Commands:

```text
node scripts/e2e-cloud-fixture.mjs
→ FATAL: E2E_TEACHER_A_PASSWORD not set — CRM_CLOUD_HARD_BLOCKED

node scripts/rls-negative-test.mjs
→ FATAL: E2E_TEACHER_A_PASSWORD not set — CRM_CLOUD_HARD_BLOCKED
```

Scripts implement the full intended flow when env is present (auth, create class/student/assignment, progress write, read-back, cleanup, RLS isolation). They do not print passwords or tokens.

Raw logs: `generated/release-integration-qa/cloud-e2e-output.txt`, `rls-output.txt`.

---

## 8. Executed test and build output

Package manager: **pnpm** (pnpm-lock.yaml + package scripts use pnpm).

| Command | Exit | Excerpt location |
|---|---:|---|
| `pnpm typecheck` | **0** | `generated/release-integration-qa/typecheck-output.txt` |
| `pnpm test` | **0** on re-run of full critical suites; one parallel run had 2 flaky timeouts that passed alone | `test-output.txt` |
| `pnpm build` | **0** | `build-output.txt` — `✓ 2680 modules transformed` / `✓ built in 27.19s` |
| `node scripts/inventory-activities.mjs` | **0** | `ACTIVITIES_PARTIAL` |
| `node scripts/release-browser-qa.mjs` | **0** | 24 route×viewport captures, 0 failures |

Flaky note (not treated as product regressions): under full parallel load, `student-routing` textbox lookup and `buildPageArray` L2 5s timeout failed once; both passed on isolated re-run (28/28).

Release integration tests added: `src/lib/__tests__/release-integration.test.ts` (5 passed).

---

## 9. Browser screenshot paths

All under `generated/release-integration-qa/`:

**Mobile 390×844**

- `mobile-splash.png`
- `mobile-login.png`
- `mobile-ayuda.png`
- `mobile-lecciones.png`
- `mobile-student-libro.png`
- `mobile-libro-vivo.png`
- `mobile-mi-progreso.png`
- `mobile-leccion-1.png`
- `mobile-teacher-crm.png` (auth gate → login without teacher session — expected)
- `mobile-teacher-flipchart.png`
- `mobile-teacher-reportes.png`
- `mobile-dev-workbook-manifest.png`

**Desktop 1440×900**

- `desktop-splash.png`
- `desktop-login.png`
- `desktop-ayuda.png`
- `desktop-lecciones.png`
- `desktop-student-libro.png`
- `desktop-libro-vivo.png`
- `desktop-mi-progreso.png`
- `desktop-leccion-1.png`
- `desktop-teacher-crm.png` (auth gate → login — expected)
- `desktop-teacher-flipchart.png`
- `desktop-teacher-reportes.png`
- `desktop-dev-workbook-manifest.png`

Machine-readable log: `browser-qa.json`.

---

## 10. Preview URL and deployed SHA

- **Local preview verified:** `http://127.0.0.1:4173` (`pnpm preview`) against production build.
- **Vercel PR preview:** will be created automatically when the PR is opened (repo has Vercel PR checks). Record the URL after open; do **not** promote to production.
- Operator must confirm the Vercel preview URL + commit SHA on the PR checks panel after push.

---

## 11. Files changed (integration delta vs main)

Primary areas:

- Workbook engine + 90-page manifest (#166–#168 stack)
- CRM completion + nested drill-down routes (#170)
- `/cartilla/ayuda`, `/cartilla/student/libro-vivo`
- Cloud E2E/RLS scripts, inventory + browser QA scripts
- `AUDIT/RELEASE-INTEGRATION-REPORT.md` + `generated/release-integration-qa/*`

Art lanes listed in the mission (colorized pages, poses, flipbook palettes, orientation scripts, art audit reports) were **not** overwritten by this integration.

---

## 12. Remaining blockers

1. **CRM cloud:** missing `E2E_TEACHER_*` and `VITE_SUPABASE_*` secrets in this environment → `CRM_CLOUD_HARD_BLOCKED`.
2. **Activities:** lessons **6, 8, 10–24** exercise packs not `studentFacingStatus: "ready"`; living manifest has zero graded interactions.
3. **Teacher CRM browser QA without session** correctly lands on login — seed/demo login still required for full CRM UI screenshots in this environment.
4. Do not merge to main until operator reviews PR + optional cloud re-run with secrets.

---

## 13. Recommended merge order

1. Merge **this** PR: `feat/elearning-crm-ui` → `main` (single integration PR).
2. Close superseded open PRs: #166, #167, #168, #169, #170.
3. Do **not** merge those older PRs independently (they will conflict or double-apply).
4. After merge, optionally run cloud E2E/RLS with secrets on main preview (still no production promote).

---

## 14. Old PRs closable after this integration PR is approved

| PR | Action after merge |
|---:|---|
| #166 | Close as integrated |
| #167 | Close as integrated (via #168 stack) |
| #168 | Close as integrated |
| #169 | Close as superseded |
| #170 | Close as integrated |
| #140 | Keep open / separate track |

---

## Production action requiring operator approval

**Merge PR `feat/elearning-crm-ui` → `main` on GitHub** (this pipeline never merges). Optionally re-run cloud scripts with secrets and attach results; **do not** promote any Vercel deployment to production without an explicit operator decision.
