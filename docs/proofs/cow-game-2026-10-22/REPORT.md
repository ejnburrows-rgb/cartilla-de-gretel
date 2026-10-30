# Cow Game Proof Report

## Context
This report verifies that the Cow Game correctly matches the reference specification, layout, and animation behaviors on multiple viewports.

## Claims
* **Static Scene Rendering**: **WORKS**. Start screenshots (`phone_start.png`, `laptop_start.png`) demonstrate exact positioning corresponding to the mockups.
* **Animated Interactivity (Walk and Fence Drop)**: **WORKS**. A series of motion frames (`*_motion_frame_1` through `*_6`) confirm continuous animation. The `_mid_play.png` shows the head passing through the fence slot, occluded properly behind the fence.
* **Horns Separate/Raise Animation**: **WORKS**. The `.cg-head` splits into `.cg-head-top` and `.cg-head-bottom` successfully revealing the syllable text on interaction.
* **Game Completion State**: **WORKS**. Demonstrated by `*_completion.png` screens showing all cows successfully placed into their respective syllables.
* **Audio Response**: **VERIFIED IN CODE**. The `tapCow` function maps to `playWord(undefined)` generating a moo on tap, and the syllable sequence maps to the correct word drop using `playWord(COW_SYLLABLE_AUDIO[norm(syl)] ?? undefined)`.

## Files Attached
* `laptop_start.png`, `laptop_motion_frame_1.png` to `_6`, `laptop_mid_play.png`, `laptop_completion.png`
* `phone_start.png`, `phone_motion_frame_1.png` to `_6`, `phone_mid_play.png`, `phone_completion.png`
