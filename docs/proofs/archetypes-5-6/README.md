# Archetype Proofs 5 & 6 — Handwriting / Tracing / Open Drawing & Syllable Recognition / Circle

## Overview

This directory documents the current-main rendered verification proof for Workbook Archetypes 5 and 6:
- **Archetype 5:** Handwriting / tracing / open drawing (e.g., printed Page 19 / Lesson 7).
- **Archetype 6:** Syllable recognition / circle (e.g., printed Page 20 / Lesson 7).

## Verification Findings

### Archetype 5: Handwriting / Tracing + Open Drawing
- **Handwriting & Tracing Controls:** Verified tracing guide rows (`.fp-trace`), mode toggle button (`.fp-trace__mode-toggle`), and dot-based stroke interaction.
- **Freehand Canvas:** Verified the open drawing canvas (`.am-dibuja`), which accepts mouse/touch drawing strokes.
- **Progressive Fade & Shared Pencil:** Mode toggle switches between ordered dot guides and freehand tracing mode.
- **Persistence:** Drawing and tracing states persist across page reloads via learner storage.
- **Responsive Fit:** Tested across Phone (390x844), Tablet (820x1180), and Laptop (1280x800). 0 broken images and 0 horizontal clipping/overflow detected.
- **Reduced Motion:** Verified clean static rendering with `prefers-reduced-motion: reduce`.

### Archetype 6: Syllable Recognition / Circle
- **Syllable Circle Behavior:** Verified `SyllableWordCircle` rendering syllable anchors (`ma`, `me`, `mi`, `mo`, `mu`) and source-ordered word choices (`mami`, `ama`, `mamá`, `mima`, `Coloma`, `Manolo`, etc.).
- **Circle Selection:** Tapping words places a `WorkbookPencilMark` circle overlay around target syllables.
- **Save/Reload Persistence:** Selections persist in `localStorage` under `cartilla-circle-${region.id}`.
- **Responsive Fit:** Tested across Phone (390x844), Tablet (820x1180), and Laptop (1280x800). 0 broken images and 0 horizontal clipping/overflow detected.
- **Reduced Motion:** Verified under `prefers-reduced-motion: reduce`.

## Screenshot Evidence

- `archetype-5-laptop.png` — Archetype 5 on Laptop (1280x800). Regenerate by running the spec: the original committed capture was taken before the page rendered (blank canvas) and was removed; the spec now waits for the Workbook surface first.
- `archetype-5-tracing-drawn.png` — Archetype 5 with tracing and drawn canvas strokes
- `archetype-5-tablet.png` — Archetype 5 on Tablet (820x1180)
- `archetype-5-phone.png` — Archetype 5 on Phone (390x844)
- `archetype-5-reduced-motion.png` — Archetype 5 with reduced-motion media query. Regenerate by running the spec: the original capture was byte-identical to the phone shot (taken pre-resize) and was removed.
- `archetype-6-laptop.png` — Archetype 6 on Laptop (1280x800)
- `archetype-6-syllable-selected.png` — Archetype 6 with selected syllable circle overlay
- `archetype-6-tablet.png` — Archetype 6 on Tablet (820x1180)
- `archetype-6-phone.png` — Archetype 6 on Phone (390x844)
- `archetype-6-reduced-motion.png` — Archetype 6 with reduced-motion media query. Regenerate by running the spec: the original capture was byte-identical to the phone shot (taken pre-resize) and was removed.

## Exact Defects / Observations Report

1. **Pointer Event Interception on Tracing Mode Toggle:**
   In `WorkbookLetterTrace.tsx`, the status hint element (`.fp-trace__hint`) spans across the footer area and can intercept pointer events intended for `.fp-trace__mode-toggle` depending on font scaling / layout alignment.
2. **Page Completion Gate Navigation:**
   In `NativeLessonViewer`, navigating from Page 19 (Archetype 5) to Page 20 (Archetype 6) in `/cartilla/leccion/7` is gated until all tracing and drawing activities on Page 19 are marked complete. Direct route `/cartilla/pilot-faithful/20` allows isolated rendering and verification of Archetype 6.
