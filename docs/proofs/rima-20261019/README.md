# Vamos a rimar draft, revised

Base ba4e6ff3. No merge or deploy.

## Current implementation

- Full viewport. Tablet retains approved scene. Phones use one undistorted approved scene background with real HTML title, four word cards, four drop fields and rhyme lines. No stitched mother/background crops. Portrait stacks the panel below; landscape retains left cards, central mother, right cards, bottom panel.
- Source-only flood-masked bee cutout. Select a card: bee follows a gentle rigid path to it, shows the word it carries. Select an empty field: bee delivers the word; correct drops bounce/glow, wrong drops carry the word back. Completion has small stars/hearts. Reduced motion uses instant travel, no wave filters.
- Original Mm poem retained. Next round preserves main's P syllable-pair algorithm, scoring and session completion events. Reset works. No other letter poems invented.
- Existing piano-audio UI functions supply pickup, drop, right/wrong and finish sounds. The originally requested public/audio/feel tap/chime files were inspected and are 19-byte text stubs, not audio. They are not used.
- Music: Meadow Thoughts, CC0, https://opengameart.org/content/meadow-thoughts . File supplied by coordinator. Soft 0.12 volume, loops after first action, mute/unmute control. Voice slots stay empty; no voice substitution.

## Proof

390x844, 844x390, 1280x800 actual Chromium screenshots and source/build comparisons. Each has wrong/right/complete/next/P-round/reset recording. The portrait-with-live-sound.mp4 captures actual browser Web Audio and music output using MediaRecorder, combined with the browser screen recording; approximate synchronization (audio starts at first sound, video starts at page load). It is not a post-added replacement soundtrack.

57 focused game/content tests pass. Typecheck and Vite production build pass. Asset verification previously passed (582 checked, no errors). Full-suite attempt was interrupted at the execution time limit before summary, not a pass. Exact logs included. Browser instrumentation counted 188 oscillator starts in each viewport workflow. Physical device touch drag is not verified; tap-and-place was tested.

## Remaining visual limitations

Phone HTML title/cards deliberately replace baked-in source lettering, so typography is not an exact visual match. The mother remains source art without seams or distortion. Landscape side areas are masked by opaque cream UI plates to hide baked-in reference words; this changes the garden balance. Tablet moving-bee start location needs a small cream background plate over the baked-in bee. No clean mother/child, wing, leaf and background layers exist in this lane, so breathing/wing motion is still missing. This is not an exact-match or motion-complete release. Keep draft for visual review.
