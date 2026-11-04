# Product Route Health & Error Sweep Proofs

**Task / Lane:** Whole-product current-main route-health + console/network error sweep (#458)
**Date:** 2026-10-08
**Scope:** Automated Playwright route health verification across all key product areas on `current-main`.

---

## 1. Executive Summary

This route health sweep executed an end-to-end sweep of the assembled product across 20+ core routes. Each route was monitored for:
1. **Unhandled Page Errors** (`pageerror`)
2. **Console Exceptions** (`console.error`)
3. **Failed Critical Requests** (`requestfailed` for same-origin scripts, stylesheets, assets, fonts)
4. **Blank States & DOM Integrity** (verifying body and primary UI elements mount successfully)
5. **Horizontal Layout Overflow** (`scrollWidth <= innerWidth + 2`)
6. **Broken Visible Images** (verifying natural dimensions > 0 and `complete == true`)

All routes passed DOM mounting, layout overflow, broken image, and critical network request checks without unhandled crashes.

---

## 2. Coverage & Verified Routes

| Category | Tested Routes | Status / Findings | Proof Artifact |
| :--- | :--- | :--- | :--- |
| **Welcome / Home** | `/`<br>`/cartilla/`<br>`/entrar`<br>`/cartilla/student-login` | **HEALTHY.** Phone viewport capture created for owner decision #356. | `welcome-phone.png`<br>`welcome-desktop.png` |
| **Lesson Catalog** | `/cartilla/lecciones`<br>`/cartilla/teacher/lecciones` | **HEALTHY.** | `lesson-catalog.png` |
| **Workbook Lessons** | `/cartilla/leccion/1`<br>`/cartilla/leccion/2`<br>`/cartilla/leccion/12`<br>`/cartilla/leccion/14`<br>`/cartilla/leccion/23`<br>`/cartilla/leccion/24` | **HEALTHY.** Early, middle, and late lessons load correctly. | `workbook-early-l1.png`<br>`workbook-middle-l12.png`<br>`workbook-late-l24.png` |
| **Print Route** | `/cartilla/imprimir/1`<br>`/cartilla/imprimir/2`<br>`/cartilla/imprimir/all` | **HEALTHY.** Sheets render correctly. | `print-route.png` |
| **Teacher Suite** | `/cartilla/teacher`<br>`/cartilla/teacher/guide`<br>`/cartilla/teacher/guia/1`<br>`/cartilla/teacher/progreso`<br>`/cartilla/teacher/reportes`<br>`/cartilla/teacher/crm`<br>`/cartilla/teacher/roster` | **HEALTHY** (See Defect #1 below for React key warning in Teacher Guide). | `teacher-home.png`<br>`teacher-guide.png`<br>`teacher-progress.png`<br>`teacher-reports.png` |
| **Flip Chart** | `/cartilla/teacher/flipchart`<br>`/cartilla/presentar/1`<br>`/cartilla/presentar/7` | **HEALTHY.** HD presenter and catalog render without errors. | `flipchart-catalog.png`<br>`flipchart-presenter.png` |
| **Voice Audition** | `/cartilla/voces` | **HEALTHY.** Voice audition route mounts cleanly. | `voice-audition.png` |
| **Source-Blocked Exemption** | `/cartilla/leccion/23` (Page 86) | **DOCUMENTED EXCEPTION PRESERVED.** Physical page 86 renders `.fp-source-blocked` / `data-source-blocked="true"` without crashing or fabricating artwork. | `source-blocked-p86.png` |

---

## 3. Discovered Defects Reported for Repair

Per policy, no product code was altered in this verification lane. The following exact finding was caught by the console monitor and is logged for a narrow repair task:

- **Defect #1:** Duplicate Key Warning on `/cartilla/teacher/guide`
  - **Console Log:** `Encountered two children with the same key, '%s'. Keys should be unique so that components maintain their identity across updates...`
  - **Root Cause:** In `src/routes/cartilla/teacher/guide.lazy.tsx` (rendering `exercise.items.map((item) => ...)`), `data/lesson-exercises.ts` contains non-unique `item.id` strings across exercise vocabulary items for certain lessons.
  - **Impact:** Non-fatal React warning in console; UI renders correctly.
  - **Recommended Repair Task:** Deduplicate `id` fields in `src/data/lesson-exercises.ts` or key by index/composite ID `key={`${exercise.id}-${item.id}-${index}`}` in `guide.lazy.tsx`.

---

## 4. Verification Evidence & Test Spec

The sweep logic is codified in:
`tests/e2e/product-route-health.spec.ts`

To re-run the sweep locally:
```bash
pnpm exec playwright test tests/e2e/product-route-health.spec.ts
```
