# Vamos a rimar draft

Base: ba4e6ff3 (main at checkout). No main mutation, merge or deploy.

Implemented: isolated full-viewport Rima scene, original approved image/crops only, tap-and-place and HTML drag/drop poem fields, correct/wrong feedback, next P matching rounds, reset, existing pair/scoring semantics, session completion event. GameShell chrome is covered by a body portal. Only the RhymeGame function and its import changed in CoreGames.tsx.

## Evidence

- portrait: 390x844; landscape: 844x390; tablet: 1280x800.
- Each has reference/build comparison, initial/wrong/complete/P-round screenshots and play recording.
- Gameplay automation exercised wrong choice, correct poem, next round, wrong/right P pairs, reset and empty audio at all sizes. No page errors or horizontal overflow.
- Typecheck passed. 57 focused game/content tests passed. Asset verification passed (582 checked, no errors). Vite production build passed with existing large-chunk warning.
- Full Vitest suite was attempted but interrupted by the execution time limit before a summary. This is NOT a full-suite pass.

## Not exact-match / remaining gaps

- Tablet retains the complete approved scene; its source 4:3 image is scaled into 1280x800.
- Portrait uses only cropped source elements and CSS fields to keep all controls readable; crop/feather edges remain around the mother/title. The bee and source butterflies are retained where the crop allows, not independently animated.
- Wide phone uses side-by-side scene and rhyme panel to avoid clipping or distorted people. This is a responsive adaptation, not the reference's exact arrangement.
- No clean independent mother/child, bee wing, butterfly wing, leaf or background layers were available in this lane. No breathing/wing motion has been fabricated. No ripple, displacement or generated art.
- Audio slots are empty in public/cartilla/games/rima/gaps.json. Audio button reports the missing approved recording and never substitutes speech.
- Only the approved Mm poem and main's P pair data exist. No other letter poems were invented. The initial Mm scene is shared for this route; the existing content parameter controls next-round P pair data. A broader letter picker requires authentic content and separate integration.
- Phone landscape source cards are about 80px tall and fields about 50px; tablet fields are smaller. Physical-device touch drag was not tested; tap-and-place was exercised in desktop Chromium at all sizes.

Do not merge as an exact-match or motion-complete result. The branch preserves functional progress and visible proof for the remaining asset work.
