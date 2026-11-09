# Delivered vowel/syllable/accessibility work on assembled main — October 29, 2026

## WORKS

- Application material f27615312df4e5c132befcbae99c6511c3c36c14 reconciles existing delivered 7f1de9a with protected main a0f29db335e427b09f31cf5c9e46c40003a09007 and the previously tested Lesson 3 candidate. No replacement implementation or original artwork/audio changes.
- Two newly delivered rollout suites / 22 checks pass; TypeScript and the Vite production build pass on Node 24.22.1. Raw results: unit.txt, typecheck.txt, build.txt.
- Reused check-vowels-curriculum.mjs against the actual built preview on port 5179 at 375/768/1280 widths. Source vowel matching/retry, uppercase tracing and lowercase writing, reload and synthetic learner A→B→A restore/isolation pass; see vowels/results.json and videos/screenshots. Resume/session pointers only are fixtures; answers and completion come from actual input.
- Reused check-syllables-curriculum.mjs against the same built preview at all three widths. Five consonant groups at printed pages 20, 24, 28, 32 and 40 render and accept correct syllable circles without clipping; marks survive reload and preserve synthetic learner separation. See syllables/results.json and recorded journeys. Printed-page numbers identify actual tested coverage; no broader all-lesson claim.
- All 14 existing workbook-a11y browser cases pass on that same built preview: overflow at 375/390/768/1280, actual >=44px toolbar/tracing/navigation targets, reduced-motion state transitions and keyboard activation/navigation. This suite intentionally initializes completion to inspect layout and navigation; it does not prove completion of those activities. a11y/browser.txt, screenshots, recorded viewport journeys and fixture video-map.txt retain the real evidence.
- Proof utilities accept output paths/built preview session fixtures, without importing development-only /src APIs. Vowel helper starts its optional existing Vite process with absolute process.execPath instead of PATH-resolved npx/cmd. No product dependency or assertion relaxation.

## DOES NOT WORK

- SonarCloud still reports advisory duplication. Earlier startup failure logs remain in the separate assembled-2026-10-29 proof. Do not describe every remote check as passing.

## NOT VERIFIED

- Independent review of f276153 was requested and must be resolved before integration. The final proof-only commit retains identical product source to that reviewed candidate.
- Physical touch-only phone/Safari, original Gretel master alignment, remaining authentic artwork and every required activity across all 24 lessons are not established. This is not deployed and does not authorize full-main release.
