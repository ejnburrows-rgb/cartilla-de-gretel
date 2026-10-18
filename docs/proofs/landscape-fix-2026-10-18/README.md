# Shared 844x390 landscape grid-collapse fix — proof (2026-10-18)

Branch: `fix/shared-landscape-844x390-20261018` (from main `99f378ff`).
ONE shared fix in `src/styles/lesson-fit.css`. No per-lesson changes.
Draft only, do not merge.

## Root cause

`.fp-ix-cell` is sized with `flex: 0 1 114cqh` + `height: auto` +
`aspect-ratio: 1` inside a centered flex row that carries
`container-type: size` (src/styles/lesson-fit.css ~line 282).

At short viewport heights (844x390 landscape phone) the `cqh` unit resolves
against a container with no definite height, `max-height: 100%` clamps
against an ~0-height row, and `aspect-ratio` cannot recover — tiles collapse
to ~10px. Verified reproducing on unmodified main (Lesson 5, page 13):
measured cell geometry `10x10` for all 8 cells before the fix.

## The fix

Appended a landscape guard at the end of `src/styles/lesson-fit.css`:

```css
@media (max-height: 500px) {
  .lc-lesson-shell--fit .native-lesson-viewer__content .fp-ix-grid .fp-ix-cell,
  .lc-lesson-shell--fit .native-lesson-viewer__content .fp-ix-pick__cells .fp-ix-cell {
    flex: 0 0 auto;
    width: 18vh;
    min-width: 18vh;
    height: 18vh;
    min-height: 18vh;
    max-height: none;
  }
}
```

Why this shape: `vh` is always definite (unlike `cqh` here); `min-height`
beats the clamping `max-height: 100%` per CSS spec; `flex: 0 0 auto` stops
the shrink that crushed the tiles. The `max-height: 500px` query means
desktop (900px) and portrait phone (844px) render exactly as before.

## Proof (all opened and visually verified)

| File | Viewport | Status |
|---|---|---|
| `before-844x390.png` | 844x390, main HEAD | BUG REPRODUCED — grid collapsed to dots, page empty |
| `after-844x390.png` | 844x390, with fix | VERIFIED — tiles 70x70 with real pictures, tappable |
| `after-390x844.png` | 390x844 portrait | VERIFIED — full 16-picture grid, no change from main |
| `after-1366x900.png` | 1366x900 desktop | VERIFIED — full grid, no change from main |

Measured cell geometry after fix: 844x390 → `70x70` (was `10x10`);
390x844 → `64x64` (unchanged); 1366x900 → `173x152` (unchanged).

No art touched, no voice, Lesson 3 untouched (its route was not modified;
the guard is additive CSS only).
