# Scope: Milestone 4 — Teacher 4-Squares Guide

## Architecture
Register a new teacher subroute `/cartilla/teacher/guia/$n` rendering the 2x2 grid guide dashboard using the static teacher-guide.json content, custom FYI/tip/warning callout blocks, and print styling.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Register Guide Route | Define route cartilla.teacher.guia.$n in route Tree and navigation | None | DONE |
| 2 | Guide Panel Content | Render grid and custom callout blocks (tip, warning, fyi) | M1 | DONE |
| 3 | Print Formatting | CSS rules for print view (hiding headers/sidebars, rendering full text) | M2 | DONE (src/styles/teacher-print.css) |

## Status Note (2026-07-01)
Verified against `main` (`7288043`): route `src/routes/cartilla/teacher/guia.$n.tsx` is registered in `routeTree.gen.ts` and has been through several further real-world iterations (bilingual metadata, master-detail hub, gamified duolingo-style map) beyond this original scope. This SCOPE doc was stale — updated during a branch/status audit.
