# Gretel — pencil, eraser, page flip, audio and image completion

Owner: Emilio. Prepared November 14, 2026. Repo: ejnburrows-rgb/cartilla-de-gretel. Source inspected: 0cc93c0b2b8059749d6182bb35474beee458c5d3. Existing documentation PR: #1306; current task queue: #877. No production release performed.

## Immediate task
Show Emilio both supplied runnable prototypes and preserve his selection before integrating the presentation. A uses the source-derived wooden pencil tip at the wide close-up scale; B uses exactly the same geometry 28% larger, including a proportionately larger eraser. These are two sizing/presentation candidates, not two unrelated replacement illustrations. Both point up-left and preserve warm yellow wood, graphite and pink rubber. Do not claim either is approved yet.

Open Gretel-Two-Prototypes.html: this single file has its source artwork, pencil SVG, paper sound and script embedded and needs no package installation. The dist folder is the editable version. The mobile.html view uses 390×844 iframes: useful responsive evidence, not physical-phone acceptance.

## What was actually built and tested
Two isolated interactive previews: one pencil actor, source-derived SVG tip, mouse hover cursor, charcoal X, 400ms charcoal hold, green/red feedback, pink eraser and 12 crumbs; local synthetic result persistence; no advance after a wrong result; save-before-turn after a simulated final correct result; Workbook side turn and Flip Chart top turn; reset, previous/next, keyboard/swipe handlers and reduced-motion mode. Source paper-rustle MP3 is supplied, opt-in and mute-aware; audible playback was not listened to in this run. No Gretel voice was synthesized.

Browser-observed: A and B wrong-mark/eraser/retry sequences stay on page7; A correct action and an attempted Next during the active sequence then reach page8; B teacher sequence reaches sample sheet7 from5; reset interrupts an in-flight return without leaving a stuck overlay; reduced-motion teacher turn reaches sheet7. At390×844 iframe dimensions, A error stays on7 and B correct sequence reaches8. Source syntax check passed. Captured video frames and strips show these prototypes, not the production app.

Important limits: test buttons simulate a final answer; they are not full lesson evaluation. Scanned source pages are used to assess motion, not to replace the approved native production rendering. The prototype has its own minimal local state machine for comparison and is NOT the production shared kernel. Do not transplant it as a second runtime kernel. No production lifecycle integration, complete reload/resume, physical touch/stylus, microphone, real students, full browser matrix or exhaustive clipping test is claimed. Mouse styling exists; actual hardware pen/touch cursor behavior remains to test. The 2D screenshots alone are not motion proof; the frame-capture MP4s are silent, variable-rate browser captures.

## Integrate into existing work, do not rebuild
Read AGENTS.md, PROJECT_SOURCE_OF_TRUTH.md, PROJECT_FINISH_DEFINITION.md, STUDENT_INTERACTION_STANDARD.md, ASSET_FIDELITY_POLICY.md and issue #877. Reuse the page-flip handoff in PR1306 and already merged #1197. Verify only relevant current changes; do not repeat the completed repository audit.

Start with NativeLessonViewer.tsx, PageCurl.tsx, living-motion.ts, page-completion.ts, WorkbookPencilMark.tsx, PencilConnector.tsx, shared activity events, FlipchartHdPanel.tsx and page-turn audio. Preserve source page content and approved native art. Match the selected prototype's presentation through the existing kernel.

Required dependency contract: drawing → 400ms charcoal hold → outcome → wrong erasure/retry OR correct persistence → idle/pointers released → quiet delay → one page turn. Wrong answers never complete a page. Button/corner/drag/swipe/keyboard/automatic forward paths must share the same busy/completion/save guards. Previous navigation must not lose active work. Canceled gestures and rapid taps must never double-save or double-turn. No stranded cursor, eraser, crumbs, timer or sound after reset/unmount. Workbook turns over side spine; teacher sheet lifts over top binding; paper is cream on both faces. Preserve reduced motion and mute. Verify at390×844 and1366×768 on mounted real product routes before approval; source/runtime tests alone are insufficient for design approval.

## Audio scripts and recordings
- AUDIO-SCRIPTS-WORKBOOK.csv contains109 verbatim current repository instruction regions, stable page/region IDs and source references. These are script texts, not109 newly verified recordings. Compare original source before cutting a mismatched phrase.
- AUDIO-VOCABULARY-EXISTING.csv contains161 existing manifest-approved picture-name recording paths and their original approval provenance. Reuse and listen to them; do not re-record everything or silently treat historical Candidate B provenance as permission for newly wired narrator speech.
- AUDIO-SCRIPTS-INTERFACE.csv contains selected feedback text and proposed navigation wording, explicitly distinguished by approval basis.
- Only the authorized original Gretel source, Gretel_558674_Original.m4a, with verified transcript/timecode match may supply NEW narrator wiring under current repo rules. Otherwise silence. No browser TTS, cloned voice, invented recording or robot voice.
- Recover existing original audio before requesting new material. Listen, transcribe, match exact words, cut nondestructively, record source hash/start/end time/event mapping, then test mute/stop/overlap/offline/device playback. A written script does not prove the approved speaker actually said it.
- Teacher guide17–24 and remaining game narratives require their own source-based scripts. This package does not invent those missing texts and does not claim full teacher/game script completion.

## Images needed and quality work
Read IMAGES-NEEDED-HANDOFF.md and IMAGE-QUALITY-REVIEW-QUEUE.csv. They provide129 distinct current references from the source layout and production inventory, source mappings, known dimensions, existing hashes and a2× display-size budget where calculable. They are a review queue, NOT129 proven missing/low-quality images and NOT a complete visual audit of all330 historical placements.

Check mounted currentSrc and actual CSS/device scale; compare against approved highest-quality master. Populate specific failure evidence before replacing anything. Recover original approved files, never redraw book art, invent colors or replace with older derivatives. Retain correct assets. Deliver one final defects-only file of genuinely absent/wrong-source/degraded/cropped/blurry items, each with exact page/route/file, original-versus-current visual proof and remediation. Unknown items stay NOT VERIFIED, not missing. Existing unreferenced entries are not automatically defects.

## Permanent resolved exception
Workbook pages86–87 DO NOT EXIST. Never ask Emilio to upload, scan, supply, recover or approve them again. Do not invent them. Preserve SOURCE_BLOCKED internally as the already allowed permanent exception and navigation85↔88. They are excluded from the audio/image work and do not block completion. The earlier audit's FIND-007/TASK-007 acquisition request is withdrawn.

## Delivery and approval
No production code was changed in this preview run. Keep preview selection, integration, merge and deployment as separate claims. Preserve PR1306 and queue877; do not add controllers. No paid services, new book art, cloned voice, destructive cleanup or release without the applicable owner approval. First useful next result: selected pencil/eraser appearance working through the shared production lifecycle on one real representative page, with correct/wrong/retry/save/turn proof, then extend across the existing activity families.
