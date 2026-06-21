# Project: La Cartilla Binders and Flow

## Architecture
- Teacher CRM Dashboard: Replace screenshot references with 3D-rendered binders (Blue, Red, Purple) using CSS transforms/shadows.
- Student Lesson Flow: Enforce 4-step sequence (Learn -> Read -> Play -> Assess).
- Local Data Source: Static hardcoded local data driving lesson flow.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Explore | Locate teacher CRM and student flow components, data seed, and current screenshots. | None | DONE |
| 2 | Design & Implement | Implement 3D binders, sequential flow logic, and local data drive. | M1 | DONE |
| 3 | Review & Verify | Run typechecks, unit tests, verify visual requirements, and audit. | M2 | DONE |

## Interface Contracts
### Student Flow Transition
- Next step routing logic.
- Progress storage (local / in-memory).

### Binders Design
- Pure CSS 3D styling without white dead-cutter backgrounds.
