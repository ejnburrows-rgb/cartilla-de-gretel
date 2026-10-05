# STUDENT INTERACTION STANDARD — La Cartilla de Gretel

> **Finish contract:** Read PROJECT_FINISH_DEFINITION.md before planning or declaring Cartilla work complete. It is the canonical definition of what must be true for the entire project to be finished. Compare current verified reality against it and close only real remaining gaps.


**Status:** CANONICAL OWNER-APPROVED STUDENT INTERACTION DIRECTION  
**Approved by:** Emilio  
**Approved on:** 2026-10-03

This file is the source of truth for the premium student-facing Workbook interaction language. When an older issue, mockup, implementation note, or active non-archived document conflicts with this file on student interaction behavior, this file wins.

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

Replace the rope/lasso interaction.

1. The child selects the two items using tap/click/keyboard-accessible selection.
2. The classic pencil draws a slightly natural workbook-style line between the items.
3. Correct lines remain.
4. Wrong lines are removed through the same restrained pencil/eraser retry language.

No thrown rope, lasso, spinning coil, or rope physics.

### 4. Handwriting / tracing — Progressive Fade

Use progressive visual support:
- begin with the source-verified tracing/model guidance;
- as the learner succeeds, the guide fades progressively;
- transition toward independent writing on the Workbook's writing line.

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

### 7. Complete-the-word — Pencil Writing

Do not use game-like moving answer tiles as the final presentation.

The learner chooses the answer and the completion appears in the printed blank as a handwriting/pencil-style entry.

Correct completion remains. Incorrect completion is handled with the same gentle retry language.

### 8. Sentence writing — Direct Handwriting

Primary mode is direct handwriting on the Workbook's ruled lines.

- Preserve the source sentence/model.
- Use the Workbook line structure.
- Save and restore writing.
- Use **Listo** to complete.
- Keyboard entry is accessibility fallback only, not the primary interaction.

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
- line matching → Pencil Line;
- tracing/handwriting → Progressive Fade;
- drawing → Premium Simple Pencil Box;
- syllables → Real Pencil Circle;
- complete-word → Pencil Writing;
- sentence writing → Direct Handwriting.

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
