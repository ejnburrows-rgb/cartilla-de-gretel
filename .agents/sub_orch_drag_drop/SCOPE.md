# Scope: Milestone 5 — Drag-and-Drop Activities

## Architecture
Implement DragMatchPairs, DragSyllableOrder, and DragLetterTrace games under @dnd-kit/core, place them into an ActivityCarousel wrapper, and integrate them into the student lesson views.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Interactive Games | Implement DragMatchPairs, DragSyllableOrder, DragLetterTrace components | None | DONE |
| 2 | Carousel Wrapper | Combine games into ActivityCarousel tabbed slider | M1 | DONE |
| 3 | Lesson Integration | Embed ActivityCarousel into student leccion.$n.tsx route | M2 | DONE |

## Status Note (2026-07-01)
Verified against `main` (`7288043`): `DragMatchPairs.tsx`, `DragSyllableOrder.tsx`, `DragLetterTrace.tsx`, and `ActivityCarousel.tsx` all exist under `src/components/cartilla/`, and `ActivityCarousel` is integrated into `src/routes/cartilla/leccion.$n.tsx` (3 call sites). This SCOPE doc was stale — updated during a branch/status audit.
