# Cartilla CRM demo plan — without Supabase setup

Date: October 3, 2026. Status: implementation authorized by “Go ahead”; frontend complete and verified, publishing pending.

## Outcome
A teacher can demonstrate a complete classroom workflow using clearly labelled sample data: open the CRM, create a class, add a sample student, assign a lesson, review a student's activity, add notes, and print/export a report. No Supabase schema, migration, policy, backend function or live student data changes.

## Current evidence
The existing application already supports a local example-class mode. Its active CRM route renders TeacherDailyHome, which reads local classes, students, assignments and progress when the example teacher session is active. Creation of classes/students and local progress/report/presenter views exist. Previous verification passed nine browser scenarios, four viewport sizes, 1,489 unit tests, typecheck and build. These results establish the previous frontend baseline; they do not certify every proposed demo action below.

The current anonymous student workbook does not feed new activity into the sample teacher roster. Existing authenticated join-by-code flow was verified with test fixtures, not a live classroom. Do not describe sample statistics as live student reporting.

## Decisions
- Reuse the existing example-class store and UI; no database setup is required for a CRM demonstration.
- Keep sample records, work and events isolated from real identities and existing anonymous student work. Never adopt a child's previous work into a demo identity.
- Clearly label sample activity. If a student-to-teacher update is shown, use an explicitly selected synthetic demo student and the local demo store only. Never claim cross-device synchronization or real authorization.
- A school/location name can be an optional demo label. There is no need for geolocation, maps, a location database or GPS permissions for the proposed classroom workflow. The phrase “location” is treated as optional school/location information; no broader location feature is assumed.
- Preserve existing artwork, handwriting, backgrounds and working page layouts.
- Reuse verification and fix only failures in the demo path. Do not restart a repository-wide audit.

## Ordered tasks

### 1. Establish a repeatable sample classroom
Description: Reuse the existing example mode with one clearly labelled class and a small set of sample students covering started, completed and needs-help states. Provide a safe demo reset if an existing equivalent is not reachable.
Acceptance:
- [x] Opening the demo displays the sample-data label and usable class/student records.
- [x] Refresh preserves intentional demo edits; reset affects demo records only.
- [x] No live Supabase requests are needed for the demonstrated actions.
Verification: Open/refresh/reset in a separate browser profile; inspect requests with network blocked; confirm unrelated student storage is unchanged.
Dependencies: none. Scope: small/medium.
Likely files: src/lib/seed-data.ts, src/lib/demo-roster.ts, src/routes/cartilla/teacher/route.tsx, focused demo tests.

### 2. Finish the interactive teacher demo path
Description: Verify existing class/student actions, teacher notes and lesson assignments through their current interface. Finish missing local actions only where the demo requires them.
Acceptance:
- [x] Create a sample class/student, save teacher notes and assign a lesson from visible controls.
- [x] Changes appear immediately and persist after refresh.
- [x] Invalid input has clear feedback and no duplicate records or silent lost edits.
Verification: Run the existing teacher lifecycle test plus focused checks for notes/assignment persistence; inspect phone and tablet controls.
Dependencies: task 1. Scope: medium; split notes and assignment UI if more than five files are needed.
Likely files: src/features/teacher-crm/TeacherDailyHome.tsx, the active class/student detail component, src/lib/seed-data.ts, tests/e2e/teacher-class-lifecycle.spec.ts.

### Checkpoint
- [x] Class/student/notes/assignment actions work without network connectivity.
- [x] The example-data label remains visible and no real identity is modified.

### 3. Demonstrate activity reaching the CRM safely
Description: Add or finish an explicitly labelled local demo student flow if a live-looking student-to-teacher demonstration is required. Reuse existing activity events and the sample store; do not modify Supabase. Show a sample student doing an activity and the teacher reviewing the resulting local event.
Acceptance:
- [x] The presenter explicitly selects a synthetic demo student; existing anonymous/real work stays separate.
- [x] An actual activity completion updates only that sample student's teacher view in the same browser.
- [x] Leaving/reloading preserves demo work and reports honest completion/assistance; switching sample students keeps work separate.
Verification: Two synthetic students with different writing/drawings; reload/leave/return; check event ownership and prohibit live backend writes. Explain that this is a same-browser simulation, not multi-device synchronization.
Dependencies: tasks 1–2. Scope: medium.
Likely files: src/lib/seed-data.ts, src/lib/student-session.ts, src/lib/learner-storage.ts, the explicit demo entry component, focused demo browser test.

### 4. Verify reporting and presentation as a complete demo
Description: Reuse existing progress, reports, CSV, workbook/guide printing and Flip Chart. Ensure the sample student's new event reaches the displayed/exported report without fabricated learning accuracy.
Acceptance:
- [x] Progress/report/CSV show the correct sample student and activity.
- [x] PDFs contain all relevant content without blank sheets or hidden controls; Flip Chart can advance and exit.
- [x] Laptop, tablet, phone and projector views have reachable controls and readable content.
Verification: Focused end-to-end demo with saved screenshots, exported CSV and inspected PDF; check separation from student-only screens; run relevant tests/typecheck/build after changes.
Dependencies: task 3. Scope: small/medium.
Likely files: tests/e2e/classroom-readiness.spec.ts, src/components/teacher/ReportCard.tsx, src/styles/teacher-print.css, src/routes/cartilla/teacher/reportes.tsx, demo evidence.

### 5. Publish and inspect the visible demo
Description: Use the existing deployment destination after identifying its correct account/project. The connected Vercel deployment action previously returned unavailable, and the connected project did not list the canonical production alias. Resolve deployment access; do not enable automatic deployments or deploy to an unconfirmed project.
Acceptance:
- [ ] The correct demo URL serves the verified version.
- [ ] The complete demonstration works on that URL with sample-data labels intact.
- [ ] Final evidence distinguishes shipped demo functionality from remaining real-classroom capabilities.
Verification: Inspect the deployed URL in fresh student and teacher browser sessions, complete the demo sequence, and capture visible proof.
Dependencies: task 4 and usable deployment access. Scope: small; no backend work.

## Remaining work outside the demo
- Genuine authenticated teacher/student sessions and live classroom reporting are not yet certified.
- Writing/drawing is browser-local. Cross-device recovery and central backup require suitable authorized persistence capability; none will be invented in this demo.
- Approved pronunciation recordings are absent; existing audio policy prohibits TTS. This does not block the CRM demo.
- Complete original guide material is missing, especially lessons 17–24, with partial gaps in earlier lessons. Show available content and its honest pending labels; do not fabricate text.
- Deployment is pending; merged source is not proof that the live site has changed.

## Demo sequence
Open labelled CRM → create sample class/student → assign a lesson → select synthetic demo student → complete/save an activity → return to teacher progress/report → save a note → export CSV/print report → present Flip Chart.

## Completion bar
The entire sequence works with Supabase network access blocked, demo edits survive refresh, real/anonymous work is untouched, and the correct deployed demo URL has been inspected. Until then, call it an available local frontend demo, not a completed live classroom system.
