# Lesson 3 assembled-build verification — October 29, 2026

## WORKS

- Material revision bad786217425d98a5c9ea98a2fd167c63b376287 reconciles independently reviewed b30d3cc648070441931a0b3d14ba1a2e758a6a2e with protected main a0f29db335e427b09f31cf5c9e46c40003a09007. All seven delivered application modules remain byte-equivalent to that reviewed Lesson 3 candidate.
- 43 focused checks across seven suites pass: drawing undo/eraser, matching, multi-stroke tracing/mode persistence, isolated preview state, learner work storage and completion gates. Six suites/31 checks passed initially; the seventh worker timed out before startup, then its 12 checks passed in isolation. Original raw logs retained; this is not a claim that the failed startup passed.
- TypeScript and Vite production build pass on Node 24.22.1.
- Reused existing proof scripts against the actual built preview at http://127.0.0.1:5179. Workbook matching/retry and trace/reset/reload/learner A→B→A pass at 375, 768 and 1280 widths. All three page-9 drawing regions also pass at all three widths: nine journeys, blank/undo/eraser completion rules, interrupted reload, saved work, route return and learner separation, with no page errors. See workbook/ and drawing-0/, drawing-1/, drawing-2/ screenshots, results and recorded journeys.
- Session fixtures select existing synthetic CRM students through the same sessionStorage identity fields as the public demo API; resume pointers select pages 8/9. No activity answers or completion are seeded. The scripts now accept a supplied built-app URL and do not require importing /src modules from a development server.
- Prototype proof utility now uses a workspace-owned output directory and the current absolute Node executable, addressing the two existing Sonar security threads without product changes.

## DOES NOT WORK

- One initial test worker timed out before executing its file; see initial-focused.txt. Its isolated retry passes. No student-facing failure was observed in the twelve recorded built-route journeys.

## NOT VERIFIED

- This is not real authentication, real child data, a touch-only/physical-phone claim, all-24-lesson completion or production deployment. Drawing inputs use mouse pointer in touch-capable Chromium contexts, explicitly identified in each result.
- Existing branch advanced to 7f1de9a during these checks with additional delivered vowel/syllable/accessibility work. This evidence applies to bad7862; the additional material must be reconciled and independently reviewed before integration.
