# Lesson 22 (Cc) — browser proof, 2026-10-18

Branch `muse/lesson-22-wide-20261018`, base `main` @ c99ab4e.

Screenshots captured from the real running app (local `vite dev`, headless
Chromium via Playwright) at 1440x900. The page-turn completion gate was
verified working first (locked nav control on unfinished page 79 shows
"¡Casi! Antes de seguir, termina el trazo de la letra C..."); captures for
pages 80–82 used a localStorage resume seed in the test browser only to
bypass the gate during capture.

## Captures

| File | Proof |
| --- | --- |
| `page1-1440.png` | Page 79: writing/tracing C c + drawing, wide desktop |
| `page2-1440.png` | Page 80: syllable circling ca/co/cu, wide desktop |
| `page3-1440.png` | Page 81: letter/reading Cc page, wide desktop |
| `page4-1440.png` | Page 82: complete-the-word + sentence writing, wide desktop |

## Verified in captures

- Cream paper background, slimmer teal spine on the page edge.
- Garden-palette instruction letters (multicolor, content unchanged).
- Teal glow around work/picture boxes (boxes kept).
- Big uncramped layouts; no overlap or crowding at 1440px.
- `lc-lesson-22` scoping class present; no owner art replaced.
- Shared-file edits strictly gated on `lessonNumber === 22`.
