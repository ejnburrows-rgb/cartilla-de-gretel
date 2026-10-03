# CRM demonstration without Supabase setup

Verified October 3, 2026 against the current frontend changes. The exact committed tree identifies this implementation; these captures are local browser evidence, not a deployed-site claim.

## Result

The existing example CRM now supports creating additional classes, adding students, saving notes, assigning/removing lessons, searching the current roster, opening an explicitly selected demo student, and reviewing that student's actual activity in reports and CSV. A labelled reset clears only synthetic records/work. Existing artwork and Supabase backend files are unchanged.

Demo identity is tab-local. Work and teacher records remain in the same browser. Real identities and anonymous work are neither adopted nor overwritten. Returning to the CRM ends the sample student session; reopening that student restores their separate saved work.

## Verified sequence

1. Create a class and two sample students through visible controls.
2. Assign lesson 2, refresh, save a teacher note, refresh again, and search for a student.
3. Select Demo Ana with **Probar como alumno**. Complete the actual vowel activity and refresh.
4. Return to the CRM. Ana's event has 8 correct answers out of 8; Beto has no copied activity or answers.
5. Display the individual report, export `reporte_demo_ana.csv` with the 8/8 event, and produce a one-page PDF.
6. Draw handwriting and a picture under one sample identity, draw different handwriting under another, leave, reopen the first student and refresh. Exact canvas images are preserved.
7. Confirm the reset through its visible UI and verify ordinary/real work is unchanged.

The four CRM sequence runs block `/rest/v1/**` and `/auth/v1/**` and assert zero attempted requests.

## Screens and regression checks

Screenshots cover laptop 1366×768, tablet 768×1024, phone 390×844, and projector 1920×1080. The phone dashboard now uses document scrolling; its header and class actions are reachable, and assignment inputs wrap at useful widths. Horizontal content/control geometry is checked automatically and screenshots inspected.

The classroom regression suite additionally checks anonymous writing/drawing/typed-response persistence, separate teacher/student browser contexts, a mocked gated student identity, guides, progress, CSV, Flip Chart advance/exit, and workbook printing. The gated scenario proves frontend behavior with fixtures; it is not live authentication certification.

Verification commands:

```sh
node scripts/verify-classroom-readiness.mjs
node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit
node node_modules/vite/bin/vite.js build
```

Results: 14 Chromium scenarios; 1,492 passing unit tests plus 2 existing expected failures; typecheck and production build pass. Existing build bundle-size warnings remain. Report PDF inspected: one page, Demo Ana, lesson 2, 8/8.

## Remaining limits

- This is a same-browser demo, with no cross-device synchronization or central backup. Browser data removal removes local work.
- Live authenticated classroom sessions and live progress reporting require separate certification using existing/authorized backend capability. No Supabase migrations, table/policy/function changes or backend work were performed.
- Approved audio recordings and missing original lesson-guide material remain content dependencies. Nothing was fabricated.
- Publishing has not been completed. The connected Vercel project lists `cartilla-de-gretel-psi.vercel.app` and EJN aliases, but not the canonical `cartilla-de-gretel.vercel.app`; its latest listed deployment is an error. The deployment action previously returned unavailable. Correct project/account access must be resolved before deployment. Automatic Git deployment was disabled at the original proof checkpoint. A subsequent approved release enabled it in main; the owner explicitly authorized pushing and publishing this demo on October 3. Live verification remains pending.

## Captures

`dashboard-{size}.png`, `student-{size}.png`, `teacher-{size}.png`, `report-{size}.png`, `demo-handwriting-resumed.png`, and `report.pdf`. Existing classroom regression evidence remains under `../classroom-readiness/`.
