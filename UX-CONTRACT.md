# UX CONTRACT — La Cartilla de Gretel

**Status:** CANONICAL OBSERVABLE INTERACTION CONTRACT  
**Owner direction locked:** 2026-10-03

This file defines shared state/interaction behavior across the Student Workbook and teacher Flip Chart. It complements `STUDENT_INTERACTION_STANDARD.md` and `DESIGN.md`.

## 1. Student interaction kernel

One shared interaction kernel owns cross-activity behavior.

Canonical observable states:
1. **idle** — learner can act; Gretel quiet.
2. **marking** — pencil/handwriting action is being rendered.
3. **neutral-hold** — where required, completed graphite mark remains neutral before judgment.
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
- Matching → Pencil Line.
- Tracing/handwriting → Progressive Fade.
- Drawing → Premium Simple Pencil Box.
- Syllables → Real Pencil Circle.
- Complete-word → Pencil Writing.
- Sentence writing → Direct Handwriting.

Adapters must not duplicate kernel behavior.

## 3. Gretel event contract

Activities do not own a second Gretel instance.

- active work → Gretel quiet;
- wrong answer → kernel emits retry; Gretel says “Inténtalo otra vez”;
- correct selection after required neutral hold → kernel emits success; Gretel says “Buen trabajo”;
- page/activity completion → one restrained completion reaction, then settle.

Final voice/TTS provider remains deferred.

## 4. Workbook navigation/page turn

**Precondition:** `Siguiente` may activate only when the existing page completion rule allows it.

Advance sequence:
1. save/commit current learner state;
2. disable duplicate navigation;
3. render/prepare destination page underneath;
4. animate current right-hand page from its outer edge across the spine, right-to-left;
5. show restrained paper curl/underside/moving shadow;
6. settle destination page;
7. restore focus/interaction and unlock navigation.

Target duration: 0.75–0.85 s.

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
