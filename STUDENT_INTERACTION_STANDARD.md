# STUDENT INTERACTION STANDARD — La Cartilla de Gretel

> **Execution policy:** [AGENTS.md](AGENTS.md). **Current assignments/status:** [GitHub #877](https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877). Historical directives below are context, not independent controller instructions.

## Historical October 13 Jules dispatch policy — superseded by current AGENTS.md

**Historical record only for capacity/dispatch.** The current October 28 AGENTS.md continuation rule takes precedence. Original-book fidelity, accepted visuals, accessibility and safety requirements below remain active.

1. **Continue existing assignments per current `AGENTS.md` and #877; no new dispatch in this continuation.** The October 13 capacity permission is historical. Verify current main, exact task ownership, dependencies, real provider capacity, and acceptance evidence first. Owner-only visual/design/creative/security/spending/release gates and holds remain binding. A label is not a running session.
2. **Only the LATEST expressly approved visuals and mechanics may be worked on or shown.** Compare the newest owner's instructions with current `main`, the original physical book and the canonical `WORKBOOK_ARCHETYPE_STANDARD.md` and `STUDENT_INTERACTION_STANDARD.md`. Stale branches, mockups, dev-only shapes, prior screenshots, old PRs and previous memories cannot override current approval. Never implement, display as current, dispatch or revive superseded/rejected visuals. Read historical files privately only to diagnose a current fault.
3. **NO ROPE/LASSO — final explicit owner rejection (2026-10-11).** Use the approved source-faithful wooden pencil/green-or-red marks/physical pink eraser and correct line-matching mechanics. PR #692 removed the obsolete `LassoConnect.tsx` and rope CSS; PR #694 preserves legacy completed syllable selections under the new pencil circle. These are merged; DO NOT restore a rope, lasso, reel, arcade, fake red-X or unapproved alternative. Current components: `PencilConnector.tsx`, `WorkbookPencilMark.tsx`, `SyllableWordCircle.tsx`; these still require real screen validation.
4. **No stale or fake approval evidence.** A merge, code review, unit test, Jules receipt or local dev fake does NOT prove visual approval. Fresh proof must depict the REAL source-faithful Student Workbook or Teacher/Flip Chart page at the exact verified commit/deployment, with the latest approved pencil/eraser, on the stated viewport/device; screenshots from `/dev-*`, old Vercel previews or synthetic demos are prohibited as owner approval evidence. Missing actual proof means **NOT APPROVAL-READY**; no historical substitution or unapproved release.
5. **Precedence:** latest explicit owner decision > current `AGENTS.md` execution/safety policy > this document's owner-locked domain specifications > older tasks, PRs, memories and evidence. Do not create a rival dispatcher, restart disabled observers/controllers, invoke Antigravity, or use unauthorized paid services.


> **Finish contract:** Read PROJECT_FINISH_DEFINITION.md before planning or declaring Cartilla work complete. It is the canonical definition of what must be true for the entire project to be finished. Compare current verified reality against it and close only real remaining gaps.


**Status:** CANONICAL OWNER-APPROVED STUDENT INTERACTION DIRECTION  
**Approved by:** Emilio  
**Approved on:** 2026-10-03; archetype relationship clarified 2026-10-06; pencil look, close-up zoom, eraser crumbs and realistic living-picture motion updated by owner decision 2026-10-11

This file is the source of truth for the premium student-facing Workbook interaction language. `WORKBOOK_ARCHETYPE_STANDARD.md` separately owns the recurring visual/source-layout family. When an older issue, mockup, implementation note, or active non-archived document conflicts with this file on student interaction behavior, this file wins.

## Latest pencil and mark contract — 2026-11-01

The owner's November 1 direction supersedes the older pencil entry/exit and immediate-color choreography below. This is a required behavior contract, not evidence that the current runtime implements it.

- Only ONE Large Realistic Wooden Pencil-Tip Cursor ("Inside the PC") may appear. Its viewport host is anchored at `(0,0)`; the graphite point is the cursor hotspot. Hovering and writing use the same appearance, size and angle. Never spawn a second autonomous miniature flying pencil sprite.
- Circles, source-required X marks and connecting lines in `WorkbookPencilMark.tsx`, `PencilConnector.tsx` and `SyllableWordCircle.tsx` draw first in velocity-modulated Charcoal Gray (`#3a3a38`, `3.3px–6.4px`). Use the SVG `<feTurbulence>` plus `<feDisplacementMap>` paper-grain filter (`#charcoal-paper-grain`; the connector uses `#connector-charcoal-paper-grain`).
- Hold the completed charcoal mark for `400ms`, then transition to Forest Green (`#258351`, stays) or Crimson Red (`#c4320a`, erased by the physical pink school eraser with 12 small pink SVG crumbs using `<animate>` tags).
- Preserve existing exercise logic, source geometry, saved work and reduced-motion accessibility. A source-required X is a workbook mark, not an added punitive failure icon.

## Product principle

The digital Workbook should feel like the physical Cartilla has gently come alive.

Use one coherent nostalgic school-tool language:
- one classic wooden pencil;
- one matching classic school eraser;
- real workbook marks and handwriting;
- smooth restrained motion;
- no arcade/game metaphors;
- no rope/lasso gimmicks;
- no punitive red X;
- no cheap bounce/spin/sticker animation;
- no generic flat undo/eraser icons when a physical pencil/eraser treatment is appropriate.

Pencil, eraser and feedback motion must be polished and seamless: one purposeful action, then settle. Per owner decision of 2026-10-09, living pictures move continuously, gently, and smoothly with no stutter, jumps, pops, or visible loop restart seams while the learner works. Motion must be realistic for what each thing is (owner decision 2026-10-11). Animals move like the real animal — for example, the cow blinks, breathes, and flicks its ears or tail — and only the parts that really move do so. Whole pictures must never wave, ripple, bob or float like a flag; only something that really travels as a whole, such as a flying airplane, may move gently as a whole (owner decision 2026-10-11). Motion is built using the original workbook art as the template; owner-approved image snippets follow the same rule.

## Piano Hablador — latest microphone-only owner decision (2026-10-14)

**The piano is a voice-responsive display, NOT an instrument played by the child's fingers or keyboard shortcuts.** The child speaks or sings a Spanish vowel/syllable into the microphone; the corresponding visual piano key illuminates automatically. No touch/click/keyboard piano playing, manual progress, or "Tocar sin micrófono" fallback is permitted. Microphone, replay, and interface controls remain keyboard-accessible.

- **Acoustic truth:** Vocal pitch (fundamental frequency) corresponds to musical note, but does **not** identify vowel phonemes by itself; distinguish `a/e/i/o/u` with on-device vowel/speech recognition or adequate formant analysis. Accurate pitch-responsive key indication and correct vowel confirmation are **both** part of the intended finished behavior. Never falsely credit a random sound, wrong vowel, background noise, or a touched piano key.
- Process voice on-device only; no recording or uploaded raw child audio. Handle mic permission, unsupported devices, silence/noise, session cancellation, navigation, privacy, keyboard-accessible mic controls, and reduced motion.
- This supersedes original #733's touch/keyboard piano-playing fallback, even though #733's approved visual designs and voice-based syllable behavior remain useful. Closed PR #678 must not be revived. [PR #758](https://github.com/ejnburrows-rgb/cartilla-de-gretel/pull/758) removes old touch-play controls; an acoustic pitch/formant implementation and live microphone proof **remain necessary**. Reuse the existing issue #665 for targeted follow-up. Do not represent removal of buttons or transcript matching alone as complete pitch-to-vowel behavior.

## Canonical interaction decisions

### 1. Wrong answer — Pencil Retry

When a learner makes an incorrect mark/selection:
1. The learner's mark is visible.
2. The single cursor draws the charcoal mark and holds it for 400ms before it becomes Crimson Red, following the latest pencil and mark contract.
3. The physical pink school eraser rubs away the incorrect mark while scattering 12 small pink animated SVG crumbs. Keep the single-pencil invariant; no second pencil actor is introduced.
4. The eraser visibly removes the incorrect mark completely.
5. Gretel says: **“Inténtalo otra vez.”**
6. The activity returns to a calm retry-ready state.

No added punitive red X. No punitive buzzer. No arcade failure animation.

### 2. Picture / vowel selection — Real Workbook Mark

Use the same classic wooden pencil.

The November 1 pencil and mark contract supersedes the older October 6/8 color and entry/exit sequence:

1. The learner taps the picture/answer.
2. The existing realistic wooden pencil-tip cursor moves continuously from hovering into drawing, with the graphite point as its hotspot. Preserve its appearance, size and angle; never introduce a full off-screen entrant or a second pencil. Draw the circle in about **2 seconds**, without hiding the picture or clipping the tip.
   **Close-up zoom (owner decision 2026-10-08, softened by owner decision 2026-10-11):** when the learner taps, the page eases in slowly and subtly (about 1 second) toward the tapped picture, at most about 1.5×, just enough that the pencil, the line and the eraser are clearly visible. The page zooms back out after a right answer's green circle has been seen for about a second, or once the eraser has left after a wrong answer. Reduced motion never zooms.
3. Draw in velocity-modulated Charcoal Gray with paper grain, hold for 400ms, then turn Forest Green for correct or Crimson Red for incorrect, using the latest contract values.
4. The same cursor returns to hovering without a replacement graphic, duplicate pencil or size change.
5. If correct, the green circle stays and Gretel says: **“Buen trabajo.”**
6. If incorrect, use the Pencil Retry behavior above: the eraser erases the red circle and Gretel says “Inténtalo otra vez.”

The pencil, mark, and feedback must feel like a premium animated workbook action, not a button-state change.

### 3. Line matching — Pencil Line

Replace the rope/lasso interaction. This behavior can serve more than one visual archetype: page 3 is the multi-pair matching visual archetype, while pages 5/8/11/14/17 are the single-central-target + surrounding-pictures visual archetype. Do not confuse visual archetype classification with interaction-adapter ownership.

1. Mouse/touch default: press-and-hold the source letter/endpoint and drag a charcoal-first pencil line toward the target, using the latest pencil and mark contract.
2. Candidate targets highlight on approach.
3. Correct release snaps the line into place and preserves it.
4. Incorrect release follows the shared charcoal hold/result/erase sequence and returns to retry-ready state.
5. Click/tap and keyboard-accessible selection remain as fallback paths over the same underlying state.
6. Correct lines remain; wrong lines use the same restrained Pencil Retry language.

No thrown rope, lasso, spinning coil, or rope physics.

### 4. Letter tracing — Checkpoint / stroke-order default

On desktop/mouse, the default is large checkpoint/stroke-order interaction:
- the child clicks points in order;
- the letter progressively draws between checkpoints;
- reuse existing tracing templates, persistence, scoring, and reset behavior.

Keep optional freehand click-drag tracing for learners/devices that benefit from it.

Never invent stroke geometry for letters/paths that are not source-verified.

### 5. Drawing — Premium Simple Pencil Box

Drawing remains a drawing activity.

Use:
- classic wooden pencil;
- nostalgic school eraser;
- undo/clear only when needed, designed as physical/narratively consistent school tools rather than generic app icons;
- **Listo** for completion;
- saved work restores after navigation/reload.

Keep the tool treatment simple, premium, nostalgic, and child-appropriate. Do not turn it into a coloring-game interface.

### 6. Syllable circling — Real Pencil Circle

The learner taps the actual syllable occurrence in the printed word.

The classic pencil draws a real workbook-style ellipse around that syllable.

Correct circles remain. Incorrect circles use Pencil Retry and are erased.

### 7. Complete-the-word — Draggable syllable placement

Use the existing syllable choices as draggable pieces:
- drag the selected syllable into the original printed blank;
- snap the correct syllable into place;
- keep click/tap-to-place as a full fallback;
- preserve the source word layout and exact choices;
- reuse existing persistence/completion state.

Incorrect placement returns gently to retry without punitive feedback.

### 8. Sentence writing — Typed handwriting-line default + optional freehand

Desktop default is typing directly on large digital handwriting lines.

- Preserve the source sentence/model.
- Use the Workbook line structure.
- Save and restore writing.
- Keep optional freehand handwriting mode.
- Use **Listo** to complete where the existing page flow requires it.
- Do not discard previously typed or drawn learner work.

## Shared visual and motion language

The same pencil/eraser family must be reused across applicable activities so the product feels coherent.

Required qualities:
- classic wooden school pencil;
- nostalgic but polished;
- no cartoon face or mascot on the pencil;
- no printed stamp, grade mark, serial number or brand name on the pencil (owner decision 2026-10-11);
- clean, natural movement;
- restrained easing;
- no excessive bounce;
- no repeated looping;
- no dramatic spin;
- no long blocking animation beyond the owner-approved ~2 second pencil draw and ~3.5 second erase;
- reduced-motion mode must replace decorative motion with immediate/static state changes while preserving clarity.

The pencil/eraser motion may be implemented with vector/CSS/canvas animation as appropriate, but it must look like one premium physical tool interacting with the Workbook, not unrelated UI effects.

Keep the one realistic pencil-tip cursor visible while the pointer moves through the Workbook. Its hover-to-write sequence uses the same tool continuously; do not restore the superseded appear/disappear actor or a second flying pencil.

## Gretel relationship

> **Owner decision — 2026-10-14 (option C):** Lesson pages and the complete Cuaderno show **no Gretel guide** — no on-page hints, cues, demonstrations, “Ayuda” button, idle nudges or “Terminaste la actividad.” message. Students get feedback from the shared pencil marks (green circle stays; wrong mark is erased) and picture-name audio only. This keeps the owner's earlier direction that lesson pages have no Gretel column (#538, #739). The Gretel guide browser tests (`tests/e2e/gretel-behavior.spec.ts`) were retired for this reason. The “Gretel says …” lines in this standard apply only where the approved Gretel system is present; they are not a requirement for lesson pages. The authentic recording decision in Voice/TTS status below governs any permitted audio.

Only the approved Gretel system may provide spoken/visual feedback.

Do not add duplicate Gretels inside individual activities.

During active handwriting/drawing/answering, Gretel should remain visually quiet except when feedback is required.

## Voice/TTS status

The owner has selected recovery and mapping of the **already supplied authentic Gretel recordings**. Continue existing #769: recover original `Gretel_558674_Original.m4a` or verified original-source segments, listen, transcribe and map heard phrases to actual page/event instructions; test audible output and cleanup. The rejected 67 music/stutter clips must never play. Do not choose/generate/clone another provider or ask for a default rerecording. Keep unavailable/unverified phrases silent; source availability and formal review/integration remain distinct gates. This audio work is active, not a pending voice-provider decision.

## Scope protection

These interaction decisions change presentation/interaction only.

They do not authorize:
- changing curriculum;
- changing answer content;
- changing page order;
- changing educational objectives;
- inventing artwork;
- changing Workbook drawing geometry;
- bypassing completion/persistence rules.


## Shared interaction kernel — canonical implementation architecture

The interaction standard above must be implemented as one shared Workbook system, not as separate mini-app behavior on each activity page.

The shared kernel owns:
- the classic wooden pencil and matching eraser visual family;
- pencil draw/mark/erase choreography and shared motion tokens;
- retry, neutral-hold, success, and completion feedback states;
- Gretel feedback events;
- reduced-motion equivalents;
- persistence/completion integration hooks.

Activity families are adapters over this kernel:
- picture/vowel selection → Real Workbook Mark;
- line matching → Direct Pencil Connector with click/tap/keyboard fallback;
- matching/placement → existing drag/drop with click/tap fallback;
- letter tracing → Checkpoint / Stroke-Order default with optional freehand;
- drawing → Premium Simple Pencil Box;
- syllables → Real Pencil Circle;
- complete-word → Draggable Syllable Placement with click/tap fallback;
- sentence writing → Typed Handwriting-Line default with optional freehand.

An activity issue must not invent a second pencil, eraser, success color, retry animation, timing system, Gretel feedback path, or persistence model. Fix shared behavior at the kernel owner, then let adapters consume it.

### Reference implementation and freeze rule

The p1/p2 work is the reference implementation for the shared kernel. Once its shared API/behavior is verified, later activity-family work should treat that contract as stable and add only the gesture/layout adapter needed for that source activity unless a proven kernel defect requires a central fix.

## Workbook page advancement — physical page turn

When the learner advances to the next page or returns to a previous page:

1. Commit/save the current learner state first.
2. Lock repeated page navigation for the duration of the transition.
3. Play soft paper sound (`audioEngine.playPageTurn(true)`, respecting mute) on every turn (owner decision 2026-10-09).
4. Keep the destination page rendered/ready underneath.
5. On the Student Workbook lesson screen (`/cartilla/leccion/$n`), perform a 0.3 s cinematic zoom toward the turning corner, followed by an elegant 2.0 s HD 3D page curl (`LESSON_PAGE_TURN_MS = 2000`) showing the paper underside and moving shadow as the destination page reveals underneath.
6. Corner interaction: bottom-right corner tap/drag turns to next page (blocked when incomplete with the "Termina la actividad de esta página para seguir" hint); bottom-left corner tap/drag turns to previous page (always allowed). Dragging follows the finger/cursor and completes if released past 50%; otherwise springs back. Keyboard shortcuts `ArrowRight` and `ArrowLeft` and navigation buttons (`Siguiente` / `Anterior`) trigger the same page turn.
7. Settle cleanly on the destination page and restore normal interaction.

Previous-page navigation uses the natural reverse direction.

Target duration: **2.0 seconds** page curl (plus ~0.3 s corner zoom) on the lesson screen (owner decision 2026-10-09); the complete book (`/cartilla/cuaderno`) uses the same single-page lesson viewer and timing (owner decision 2026-10-13).

The page turn is presentation only:
- it never bypasses completion gating;
- it never changes saved learner work;
- it never changes Workbook source layout/content/artwork;
- it never triggers duplicate Gretel feedback;
- plays soft paper sound on every turn respecting mute;
- reduced-motion mode uses an immediate or very short non-3D transition.
