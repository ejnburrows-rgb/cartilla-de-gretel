# Cow Game Defect Resolution

## Removed Scratch Files
The following leftover scratch files and invalid screenshots were deleted from the branch:
- `fix_final.cjs`
- `proof_script.cjs`
- `test_audio.cjs`
- `test_fail.cjs`
- `test_fail2.cjs`
- `test_fail3.cjs`
- `test_fail4.cjs`
- `public/proof_cowgame_static.png`

## Resolved Defects
* **Destination labels behind opaque doors**: **WORKS**. The `cg-slot-text` elements were modified to use `z-index: 4` making them visible in front of the door (which uses `z-index: 3`). Duplicate labels introduced in a previous pass were removed.
* **Syllable card lean synchronization**: **WORKS**. The `.cg-card` class now dynamically receives the `.cg-card-lean` class when `moving && active.phase === "lean"`, mapping the card's `transform: translate` down by precisely `16cqw`, maintaining perfect sync with the `cg-bob` translation over the 0.5s transition.
* **Flipped backward text**: **WORKS**. Applied a counter `scaleX(${flip})` transformation natively on the `.cg-revealed-text` container to ensure text remains readable left-to-right when the parent cow sprite is flipped.
* **False Moo audio**: **WORKS**. The `playWord(undefined)` call assigned to the cow selection click was removed. The silent fallback is preserved while acknowledging no approved moo recording exists.

## Evidence Attached
* **Gameplay Video**: Added `docs/proofs/cow-game-2026-10-22/cow_gameplay.webm` capturing an end-to-end walk cycle, drop animation displaying the "horns separate" and accurate card lean, and test completion.
* **All E2E Games**: `npx playwright test tests/e2e/all-games.spec.ts` yields 15 passes.
* **Recovery Activities**: Yields 5 passes.
