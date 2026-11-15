# Page flip handoff — pencil/eraser dependency
Owner request: November 14, 2026. Repository: ejnburrows-rgb/cartilla-de-gretel.
Scope: finish the existing physical-paper page turn safely around the existing pencil/eraser interaction. This is a handoff, not evidence that implementation is finished.

## Read once, then continue
Read AGENTS.md, PROJECT_SOURCE_OF_TRUTH.md, PROJECT_FINISH_DEFINITION.md, STUDENT_INTERACTION_STANDARD.md, DESIGN.md and UX-CONTRACT.md. Use issue #877 as the existing queue. Read handoff/SESSION-CONTINUITY-2026-11-14.md; reuse its audit evidence. Check only relevant newer changes and current overlapping work. Do not restart a repository audit or rebuild completed page-turn work.

## Permanent owner correction
Workbook pages 86–87 DO NOT EXIST. Do not ask Emilio to supply, scan, upload, recover or approve them. Do not invent them. Preserve SOURCE_BLOCKED only as the existing technical representation of a permanent documented exception, not an actionable request or release blocker. Preserve navigation 85 → 88 and reverse, original printed numbering and the 88 available pages. This correction supersedes FIND-007 and TASK-007 in the earlier audit.

## Visible result
- Student Workbook: gentle, deliberate, nostalgic 1960s/1970s physical-paper turn across the side spine, with a bottom-right corner curl for forward turns.
- Warm cream paper on both faces, convincing restrained paper curvature/shadow, no white flash, mirrored text, stretched art, accidental blank frame or jumping layout.
- Teacher Flip Chart: sheet lifts upward over the top binding. Do not apply the Workbook's side-bound motion to it.
- Use the existing approved paper-rustle asset and synchronize one sound to a committed turn. Respect mute, playback restrictions and reduced motion. If the appropriate sound is missing, document that exact asset gap; do not substitute synthetic Gretel speech.
- Preserve approved artwork, page content, pencil/eraser design and existing completion/navigation rules.

## Dependency: pencil/eraser comes first
Inspect the shared interaction kernel before changing turn timing. Existing pointer-release logic alone is not proof that animated drawing/erasure and persistence have settled.
1. While a stroke, mark, erasure or required feedback animation is active, do not detach its page or start a turn.
2. Let the current action finish and commit its result through the existing persistence mechanism. Wrong answers must not grant completion.
3. Only after the interaction is idle, all pointers are released and required work is complete may existing automatic advancement begin its quiet-time delay.
4. Every forward trigger—button, corner drag, swipe, keyboard and automatic advance—must respect the same guards. Backward navigation preserves existing permission but must not lose an active stroke or saved work.
5. A canceled drag, canceled pointer, rapid repeat tap or interrupted transition must never double-advance, double-save, lose marks, strand an overlay, leave a ghost cursor or replay sound twice.
6. The existing pencil must remain consistent: large close-up tip pointing up-left; no clipping or duplicate cursor. Eraser temporarily replaces it, completes its approved rubbing/crumbs sequence, then returns control cleanly. Do not redesign either tool as part of page flipping.
7. Reuse the shared kernel's state/events when available. If a dependable busy/idle or action-committed signal is absent, add the smallest integration necessary with focused tests. Do not build a second kernel or duplicate timers across activity families.
8. Do not implement around an unverified pencil candidate. Identify its actual current state and isolate only the genuine dependency. Finish independent page-rendering work where safe.

## Existing source starting points
These paths were inspected at audit commit 0cc93c0b2b8059749d6182bb35474beee458c5d3; resolve their current mounted use before editing:
- src/components/StudentBook/NativeLessonViewer.tsx — current turn triggers, pointer guards, completion and quiet-time logic (AUTO_TURN_IDLE_MS was 1600).
- src/components/StudentBook/PageCurl.tsx and src/styles/native-lesson.css — Workbook paper presentation.
- src/components/StudentBook/__tests__/NativeLessonViewer.turn.test.tsx and NativeLessonViewer.autoturn.test.tsx.
- src/components/cartilla/WorkbookPencilMark.tsx and src/cartilla/interactions/PencilConnector.tsx — existing marks/eraser behavior.
- src/components/cartilla/FlipchartHdPanel.tsx and src/styles/flipchart-turn.css — teacher top-binding motion.
- src/lib/living-motion.ts, src/lib/page-completion.ts, src/lib/gretel-bus.ts, src/lib/audio-engine.ts and src/components/audio/PageTurnSound.tsx.
- src/hooks/usePageFlip.ts exists; do not assume it is the mounted canonical implementation.
Issue #877 records #1197 as already merged, including page-gap navigation proof. Reuse valid evidence; do not reimplement that change. Historical PR numbers and claims are leads, not current activity or current-head certification.

## Acceptance and proof
Use real mounted student and teacher routes at 390×844 and 1366×768, plus relevant tablet/projector checks.
- Correct last answer → feedback/persistence complete → quiet pause → exactly one turn.
- Wrong answer → eraser finishes → retry remains on same page; no false completion.
- Hold mouse, pen or finger through completion: no turn while held or while the action animation remains active.
- Test each existing activity family that uses the kernel, especially circle/X, matching/connecting and tracing.
- Test buttons, keys, corner drag/cancel and swipe; incomplete page, rapid repeats, first/last pages, already-completed page, backward navigation, reload/resume, 85↔88 and 88→89→90.
- Test mute, one sound per successful turn, reduced motion, blur, cancellation, unmount and unavailable audio.
- Confirm no image distortion, clipping, flash, duplicate cursor or leaked overlay.
Run relevant existing tests, typecheck and authorized worker checks. Record actual commands and outcomes. Capture continuous before/during/after clips for motion and audible playback; stills do not prove motion or audio. If recording/device tooling is unavailable, label the gap rather than claiming a pass.

## Delivery boundaries
Make the smallest reliable change only after implementation is authorized. This owner request authorizes the handoff and repository documentation, not an app release. Preserve protected work, original assets, disabled automatic deployment and existing approval rules. Do not add paid services, generate book art/voice, dispatch workers or deploy.
Update the existing #877 record with exact commit, changed files, proof, dependency status and remaining work when authorized to post there. Do not create a second controller.
Definition of done: approved physical turn is verified on the mounted routes, pencil/eraser and save/completion semantics remain correct, required checks pass and limitations are explicit. Source completion, integration and live publication must remain separate claims.
