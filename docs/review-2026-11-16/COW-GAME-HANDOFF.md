# Cow game — evidence and handoff

## Entry point and what it does

- Route in the draft: `/cartilla/juego/cow-game-m` (a hosted review is not established).
- The real game starts immediately. Select a cow and its matching slot, in either order. A correct cow delivers its syllable card and returns; a wrong attempt returns without placing it. Five placements show “¡Muy bien!” and a replay control.
- Desktop 1366×768 and mobile 390×844 **emulation**: tested one wrong attempt, five correct placements, completion and replay reset. These are local, fictional-data tests; they are not evidence of a physical phone test. Screenshots and recordings were captured locally in the test output. See `tests/e2e/review-cow-game.spec.ts` for the repeatable journey.

## Confirmed defect and fix to verify

- Resetting during a delivery previously let old timers complete afterward, placing a card into the restarted game. The regression test failed before the fix. The draft fix cancels pending timers and clears the displayed feedback at reset; repeat the reset tests during the outgoing walk, wrong-answer feedback and correct-return phase.

## Open problems

1. **P1 — misleading duplicate visual slots:** on a wide desktop viewport, the repeated side copies of the scene show partial lettered slots outside the playable board. They look selectable but are not part of the game. Use the existing authorized scene and remove that ambiguity; do not replace or invent artwork.
2. **P1 — mobile legibility:** the completion replay label and settings text are small at 390×844. Make text readable without obscuring the existing art; preserve at least 44×44px controls.
3. **P1 — sound is not wired:** `src/content/games/cow-game-audio-gaps.ts` maps the instruction and all five syllables to null, and `CowGame.tsx` invokes silence for wrong feedback. The speaker control therefore does not demonstrate spoken instruction. This confirms missing runtime mappings, not that no matching recording exists anywhere. Existing recordings have **not** been listened to or transcript-matched in this review. Use only the authorized Gretel original after listening and transcript verification; otherwise silence. No TTS or synthetic voice.
4. **P2 — interaction and accessibility:** test keyboard-only selection and completion, visible focus, screen reader announcements, replay focus, reduced motion, zoom and orientation changes on real devices. These are not yet verified. Visually inspect all animation states and asset loads, not just the initial screenshot.

## Premium direction — proposed, not owner-approved

- **Visual:** keep the current authorized farm, cow layers and physical syllable cards; clarify where the playable board ends and keep text legible across sizes.
- **Interaction:** make the selected cow and matching target unmistakable without implying a correct choice; retain both selection orders and retry without punitive feedback. Reset must cancel every pending action and restore a clean board.
- **Motion:** keep the card visibly attached until delivery, animate cow body parts plausibly, and make arrival/return smooth and restrained. Respect reduced motion without losing feedback.
- **Audio:** use silence until the actual authorized line is listened to, transcript-matched and mapped. A visible sound control must not imply that a missing recording is playing.
- **Acceptance:** repeat wrong → retry → five correct → completion → replay; reset at every active phase; keyboard, touch and screen-reader operation; 390×844 and 1366×768 captures plus a physical phone; no clipped, ambiguous or false controls; no missing runtime assets. Review both proposed alternatives before any approval.

**Two distinct cow-game alternatives have not been built.** Existing game screenshots or a replay of the same game do not count as two prototypes.
