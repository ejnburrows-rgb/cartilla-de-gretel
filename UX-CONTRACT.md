# UX CONTRACT — La Cartilla de Gretel

> **Finish contract:** Read PROJECT_FINISH_DEFINITION.md before planning or declaring Cartilla work complete. It is the canonical definition of what must be true for the entire project to be finished. Compare current verified reality against it and close only real remaining gaps.


**Status:** CANONICAL OBSERVABLE INTERACTION CONTRACT  
**Owner direction locked:** 2026-10-03

This file defines shared state/interaction behavior across the Student Workbook and teacher Flip Chart. It complements `STUDENT_INTERACTION_STANDARD.md` and `DESIGN.md`.

## 1. Student interaction kernel

One shared interaction kernel owns cross-activity behavior.

Canonical observable states:
1. **idle** — learner can act; Gretel quiet.
2. **marking** — pencil/handwriting action is being rendered.
3. **neutral-hold** — short internal pause after the mark is drawn, before the result event. Owner 2026-10-06: Real Workbook Mark circles are already green (right) or red (wrong) from the first line; no gray waiting period is shown.
4. **success** — correct work persists; correct-selection mark may turn green; Gretel receives the approved positive event.
5. **retry-erase** — wrong work is visibly erased with the physical eraser language; Gretel receives the approved retry event.
6. **complete** — activity/page completion is recorded and navigation eligibility updates.

The kernel owns:
- pencil/eraser visual primitives;
- shared motion/timing tokens;
- retry/success feedback state;
- Gretel event bridge;
- reduced-motion behavior;
- save/restore and completion hooks.

Activity adapters own only the source-faithful gesture/layout needed by that activity family.

## 2. Student activity adapters

- Selection → Real Workbook Mark.
- Line matching → Direct Pencil Connector with click/tap/keyboard fallback.
- Matching/placement → existing drag/drop with click/tap fallback.
- Letter tracing → Checkpoint / Stroke-Order default with optional freehand.
- Drawing → Premium Simple Pencil Box.
- Syllables → Real Pencil Circle.
- Complete-word → Draggable Syllable Placement with click/tap fallback.
- Sentence writing → Typed Handwriting-Line default with optional freehand.

Adapters must not duplicate kernel behavior.

## 2A. Workbook visual archetype boundary

`WORKBOOK_ARCHETYPE_STANDARD.md` owns the recurring visual/source-layout family. This UX contract owns behavior/state. Do not collapse different visual archetypes merely because they reuse one interaction adapter.

- Archetype 3 = genuine multi-source / multi-target matching/connect composition.
- Archetype 4 = one central target with surrounding pictures.
- Both may consume shared Pencil Line mechanics where the printed source requires drawn connections.
- Printed page 17 / Lección 6 / Uu is Archetype 4, not Archetype 3.
- Pages 5, 8, 11, 14, and 17 preserve their exact central-target surrounding-picture source composition.
- The numbered teal title bars on the owner reference board are annotations only and are never production UI.
- Pages 86–87 remain SOURCE_BLOCKED with no inferred layout, content, artwork, or interaction metadata.

## 3. Gretel event contract

Activities do not own a second Gretel instance.

- active work → Gretel quiet;
- wrong answer → kernel emits retry; Gretel says “Inténtalo otra vez”;
- correct selection after the pencil finishes drawing → kernel emits success; Gretel says “Buen trabajo”;
- page/activity completion → one restrained completion reaction, then settle.

Final voice/TTS provider remains deferred.

## 4. Workbook navigation/page turn

**Precondition:** Forward page turns (via Siguiente button, bottom-right corner tap/drag, or ArrowRight key) may activate only when the existing page completion rule allows it. Bottom-right corner gives the "Termina la actividad de esta página para seguir" hint when incomplete. Back navigation (via Anterior button, bottom-left corner tap/drag, or ArrowLeft key) is always allowed.

Lesson screen (`/cartilla/leccion/$n`) sequence (owner decision 2026-10-09):
1. save/commit current learner state;
2. disable duplicate navigation;
3. play soft paper sound (`audioEngine.playPageTurn(true)`, respecting mute);
4. render/prepare destination page underneath;
5. perform small cinematic zoom toward the turning corner (~0.3 s);
6. perform elegant slow HD 3D page curl (2.0 s duration, `LESSON_PAGE_TURN_MS = 2000`) with real moving shadow and paper underside;
7. settle destination page;
8. restore focus/interaction and unlock navigation.

Two-page reader (`/cartilla/cuaderno`) retains 0.75–0.85 s target (`STUDENT_PAGE_TURN_MS = 800`).

Back navigation reverses the physical direction.

Do not:
- use cube/card flips;
- introduce elastic waves or dramatic 3D spins;
- alter source page assets;
- fire duplicate completion/Gretel events;
- allow double-navigation during the turn.

Reduced motion: immediate or very short non-3D page replacement, preserving focus/state.

## 5. Teacher Flip Chart navigation/page turn

The Flip Chart behaves like a real top-bound classroom flip chart.

Advance sequence:
1. prepare the destination sheet behind the current sheet;
2. disable duplicate navigation;
3. lift the current sheet from the lower edge;
4. turn it upward over the top binding/rings;
5. reveal the paper underside and restrained moving shadow;
6. settle on the destination sheet;
7. restore teacher controls/focus.

Target duration: 0.9–1.05 s.

Previous reverses naturally.

The effect is presentation-only and may not change lesson mapping, page order, art placement, text, teacher progress, or printing/report behavior.

## 6. Input and interruption

- navigation works by pointer/touch and keyboard;
- swiping may be additive but is never required;
- while a physical turn is active, additional next/previous input is ignored or queued as one safe action—never multiplied;
- browser history/routes and saved state reflect the settled destination, not an intermediate visual frame.

## 7. Performance

Animate compositor-friendly transform/opacity properties. Avoid layout-thrashing page geometry during the active turn. Preload/render the next page sufficiently to avoid blank flashes.

## 8. Verification/proof

Visible lanes publish milestone screenshots before final completion.

For the page-turn system, proof must include:
- Workbook before/mid-turn/settled next page;
- Workbook reverse;
- Flip Chart before/mid-turn/settled next sheet;
- Flip Chart reverse;
- reduced-motion behavior;
- keyboard navigation;
- rapid/double navigation safety;
- representative tablet/phone/projector views.

Final regression remains responsible for end-to-end confirmation across the assembled product.


## 9. Issue ownership

- #445 owns the shared student interaction kernel reference implementation plus p1/p2.
- #446–#449 own activity-family adapters only.
- #455 owns Gretel behavior as a consumer of shared kernel events.
- #470 owns the physical Workbook + Flip Chart page-turn implementation.
- #450 verifies the assembled Workbook including #470 integration.
- #457 verifies the assembled teacher/Flip Chart experience including #470 integration.
