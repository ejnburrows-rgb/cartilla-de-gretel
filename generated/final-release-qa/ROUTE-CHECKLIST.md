# Final Release QA — Route Checklist (PREP)

**Status:** checklist only — cells left unchecked until post-integration run.  
**Base:** `main` @ `079aec9`  
**File-route source:** `src/routes/**` (authoritative).  
**Do not use** aspirational `/cartilla/maestro/*` or `/cartilla/familia/*` from `cartilla-routes.ts` as primary smoke targets.

Mark: `[ ]` pending · `[x]` pass · `[F]` fail · `[S]` skip (with reason) · `[A]` auth required

---

## A. Public entry & auth

| ID | Path | What to verify | Mobile 390×844 | Desktop 1440×900 | Notes |
|---|---|---|---|---|---|
| R01 | `/` | Landing loads; links to cartilla / login | [ ] | [ ] | Homepage alone ≠ app health |
| R02 | `/cartilla` | Splash / hub renders | [ ] | [ ] | |
| R03 | `/cartilla/` | Same as hub (trailing slash) | [ ] | [ ] | |
| R04 | `/login` | Teacher login form; no English student UI | [ ] | [ ] | Needs Supabase for real auth |
| R05 | `/cartilla/unirse` | Student join-by-code | [ ] | [ ] | Cloud |
| R06 | `/cartilla/student-login` | Student login path (or redirect) | [ ] | [ ] | |
| R07 | `/cartilla/ayuda` | Help page content usable | [ ] | [ ] | |

---

## B. Student book & lessons

| ID | Path | What to verify | Mobile | Desktop | Notes |
|---|---|---|---|---|---|
| R10 | `/cartilla/lecciones` | Lesson list 1–24 | [ ] | [ ] | |
| R11 | `/cartilla/leccion/1` | Lesson shell + workbook + activities region | [ ] | [ ] | Primary activity surface |
| R12 | `/cartilla/leccion/7` | Consonant lesson sample | [ ] | [ ] | Spot-check |
| R13 | `/cartilla/student/libro` | Student book view | [ ] | [ ] | |
| R14 | `/cartilla/student/libro-vivo` | Living workbook engine route | [ ] | [ ] | Integration-critical |
| R15 | `/cartilla/student/lecciones` | Student lesson list | [ ] | [ ] | |
| R16 | `/cartilla/libro` | Legacy/alias book route behavior | [ ] | [ ] | May redirect |
| R17 | `/cartilla/pilot-faithful/1` | Faithful pilot (if still exposed) | [ ] | [ ] | Dev/pilot — note if gated |

---

## C. Activities & practice

| ID | Path | What to verify | Mobile | Desktop | Notes |
|---|---|---|---|---|---|
| R20 | `/cartilla/leccion/1` activities strip | Games/carousel/exercises interactive | [ ] | [ ] | In-lesson, not only `/activities` |
| R21 | `/activities` | Top-level activities index if used | [ ] | [ ] | |
| R22 | `/cartilla/practica` | Practice surface | [ ] | [ ] | |
| R23 | `/cartilla/student/practica` | Student practice | [ ] | [ ] | |
| R24 | `/cartilla/repaso` | Review | [ ] | [ ] | |
| R25 | `/cartilla/student/repaso` | Student review | [ ] | [ ] | |

---

## D. Progress

| ID | Path | What to verify | Mobile | Desktop | Notes |
|---|---|---|---|---|---|
| R30 | `/cartilla/student/mi-progreso` | Student progress UI | [ ] | [ ] | Cloud or local fallback |
| R31 | `/cartilla/mi-progreso` | Alias / redirect | [ ] | [ ] | |

---

## E. Teacher CRM

| ID | Path | What to verify | Mobile | Desktop | Notes |
|---|---|---|---|---|---|
| R40 | `/cartilla/teacher` | Teacher shell / auth gate | [ ] [A] | [ ] [A] | |
| R41 | `/cartilla/teacher/` | Dashboard | [ ] [A] | [ ] [A] | |
| R42 | `/cartilla/teacher/crm` | CRM root | [ ] [A] | [ ] [A] | |
| R43 | `/cartilla/teacher/crm/` | CRM index | [ ] [A] | [ ] [A] | |
| R44 | `/cartilla/teacher/crm/$classId` | Class overview tiles | [ ] [A] | [ ] [A] | Needs class id |
| R45 | `/cartilla/teacher/crm/$classId/$studentId` | Student drill-down | [ ] [A] | [ ] [A] | |
| R46 | `/cartilla/teacher/crm/$classId/$studentId/$lessonId` | Lesson detail | [ ] [A] | [ ] [A] | |
| R47 | `/cartilla/teacher/roster` | Roster | [ ] [A] | [ ] [A] | |
| R48 | `/cartilla/teacher/progreso` | Class progress | [ ] [A] | [ ] [A] | |
| R49 | `/cartilla/teacher/reportes` | Reports page | [ ] [A] | [ ] [A] | CSV entry point |
| R50 | `/cartilla/teacher/lecciones` | Teacher lesson list | [ ] [A] | [ ] [A] | |
| R51 | `/cartilla/teacher/guia/` | Teacher guide index | [ ] [A] | [ ] [A] | |
| R52 | `/cartilla/teacher/guia/1` | Guide lesson 1 | [ ] [A] | [ ] [A] | |
| R53 | `/cartilla/teacher/paginas/1` | Teacher pages preview | [ ] [A] | [ ] [A] | Read-only |

---

## F. Family report & CSV

| ID | Path / action | What to verify | Mobile | Desktop | Notes |
|---|---|---|---|---|---|
| R60 | `/cartilla/teacher/crm/$classId/$studentId/reporte` | **Reporte para familias** content | [ ] [A] | [ ] [A] | Not `/cartilla/familia/*` |
| R61 | UI: Exportar CSV on reportes | Download `reporte_clase_*.csv` | [ ] [A] | [ ] [A] | `src/lib/csv-export.ts` |
| R62 | UI: Exportar CSV student | Download `reporte_*.csv` | [ ] [A] | [ ] [A] | Same helper |

---

## G. Flipchart / presentation

| ID | Path | What to verify | Mobile | Desktop | Notes |
|---|---|---|---|---|---|
| R70 | `/cartilla/presentar/1` | Teacher flipchart L1 | [ ] | [ ] | Prefer desktop projection |
| R71 | `/cartilla/presentar/7` | Flipchart sample consonant | [ ] | [ ] | Spot-check |
| R72 | `/classroom` | Alternate classroom entry if linked | [ ] | [ ] | |

---

## H. Print / binder (secondary)

| ID | Path | What to verify | Mobile | Desktop | Notes |
|---|---|---|---|---|---|
| R80 | `/cartilla/binder` | Binder hub | [ ] | [ ] | Secondary |
| R81 | `/cartilla/imprimir/1` | Print lesson | [ ] | [ ] | Secondary |
| R82 | `/cartilla/teacher/print` | Teacher print | [ ] [A] | [ ] [A] | |

---

## I. Dev-only (must not be required for release; note exposure)

| ID | Path | Expected | Mobile | Desktop | Notes |
|---|---|---|---|---|---|
| R90 | `/dev-workbook-manifest` | Dev/manifest sandbox | [ ] | [ ] | Flag if public on prod |
| R91 | `/dev-living-workbook` | Dev engine | [ ] | [ ] | |
| R92 | `/dev-gretel` | Dev Gretel | [ ] | [ ] | |

---

## Smoke minimum (must pass both viewports before release claim)

1. R02 `/cartilla`
2. R04 `/login`
3. R07 `/cartilla/ayuda`
4. R10 `/cartilla/lecciones`
5. R11 `/cartilla/leccion/1` (activity visible)
6. R13 or R14 student book
7. R30 progress
8. R42 teacher CRM (auth path honest)
9. R49 reportes + R61 CSV when data exists
10. R60 family reporte when data exists
11. R70 flipchart `/cartilla/presentar/1`

---

## Record after run

| Field | Value |
|---|---|
| QA_BASE_URL | _(fill)_ |
| Commit SHA | _(fill)_ |
| Runner | _(fill)_ |
| Date | _(fill)_ |
| Blockers | _(fill)_ |
