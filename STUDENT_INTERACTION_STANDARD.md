# STUDENT INTERACTION STANDARD — La Cartilla de Gretel

> **Finish contract:** Read PROJECT_FINISH_DEFINITION.md before planning or declaring Cartilla work complete. It is the canonical definition of what must be true for the entire project to be finished. Compare current verified reality against it and close only real remaining gaps.


**Status:** CANONICAL OWNER-APPROVED STUDENT INTERACTION DIRECTION  
**Approved by:** Emilio  
**Approved on:** 2026-10-03; archetype relationship clarified 2026-10-06

This file is the source of truth for the premium student-facing Workbook interaction language. `WORKBOOK_ARCHETYPE_STANDARD.md` separately owns the recurring visual/source-layout family. When an older issue, mockup, implementation note, or active non-archived document conflicts with this file on student interaction behavior, this file wins.

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

Motion must be polished and seamless: one purposeful action, then settle. Avoid constant decorative motion while the child is thinking, answering, tracing, writing, or drawing.

## Canonical interaction decisions

### 1. Wrong answer — Pencil Retry

When a learner makes an incorrect mark/selection:
1. The learner's mark is visible.
2. The same classic wooden pencil appears.
3. The pencil smoothly rotates to its eraser end.
4. The eraser visibly removes the incorrect mark.
5. Gretel says: **“Inténtalo otra vez.”**
6. The activity returns to a calm retry-ready state.

No red X. No punitive buzzer. No arcade failure animation.

### 2. Picture / vowel selection — Real Workbook Mark

Use the same classic wooden pencil.

1. The learner taps the picture/answer.
2. The pencil visibly draws the required workbook mark/circle around the selection.
3. Hold the completed mark in its neutral pencil color for approximately **3 seconds**.
4. If correct, the mark changes to green and Gretel says: **“Buen trabajo.”**
5. If incorrect, use the Pencil Retry behavior above: pencil rotates to eraser, erases the mark, and Gretel says “Inténtalo otra vez.”

The pencil, mark, and feedback must feel like a premium animated workbook action, not a button-state change.

### 3. Line matching — Pencil Line

Replace the rope/lasso interaction. This behavior can serve more than one visual archetype: page 3 is the multi-pair matching visual archetype, while pages 5/8/11/14/17 are the single-central-target + surrounding-pictures visual archetype. Do not confuse visual archetype classification with interaction-adapter ownership.

1. Mouse/touch default: press-and-hold the source letter/endpoint and drag a teal pencil line toward the target.
2. Candidate targets highlight on approach.
3. Correct release snaps the line into place and preserves it.
4. Incorrect release gently retracts/erases and returns immediately to retry-ready state.
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
- clean, natural movement;
- restrained easing;
- no excessive bounce;
- no repeated looping;
- no dramatic spin;
- no long blocking animation except the owner-approved ~3 second correct-selection hold;
- reduced-motion mode must replace decorative motion with immediate/static state changes while preserving clarity.

The pencil/eraser motion may be implemented with vector/CSS/canvas animation as appropriate, but it must look like one premium physical tool interacting with the Workbook, not unrelated UI effects.

Outside drawing mode, treat the pencil as an action actor rather than permanent chrome: appear near the learner's mark, perform the one purposeful action, then settle/disappear from the active work area. Do not leave it floating or moving while the learner is thinking. In drawing mode it may remain available as the selected physical tool.

## Gretel relationship

Only the approved Gretel system may provide spoken/visual feedback.

Do not add duplicate Gretels inside individual activities.

During active handwriting/drawing/answering, Gretel should remain visually quiet except when feedback is required.

## Voice/TTS status

The final Gretel voice/TTS direction is **NOT YET LOCKED**.

Do not treat the older real-recording-only policy, browser TTS voice selection, or any particular provider as the final owner decision.

Until the owner explicitly finalizes the voice direction:
- do not create a new paid voice dependency;
- do not generate a final voice library;
- do not replace the current voice system merely to satisfy this interaction standard.

The owner has stated that the eventual target is a premium natural little-girl voice that matches Gretel and does not sound robotic or corny. Final implementation is deferred pending explicit owner approval.

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

When the learner activates **Siguiente** after the page's completion gate is satisfied:

1. Commit/save the current learner state first.
2. Lock repeated page navigation for the duration of the transition.
3. Keep the destination page rendered/ready underneath.
4. Turn the current right-hand page from the outer edge across the spine, right-to-left, with a restrained paper curl, visible paper underside, and moving shadow.
5. Settle cleanly on the destination page and restore normal interaction.

Previous-page navigation uses the natural reverse direction.

Target duration: approximately **0.75–0.85 seconds**. The turn should read as real paper with mass, not a card flip, cube rotation, elastic wave, or theatrical 3D effect.

The page turn is presentation only:
- it never bypasses completion gating;
- it never changes saved learner work;
- it never changes Workbook source layout/content/artwork;
- it never triggers duplicate Gretel feedback;
- it stays silent unless the owner later approves a page sound;
- reduced-motion mode uses an immediate or very short non-3D transition.
