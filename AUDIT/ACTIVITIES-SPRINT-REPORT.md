# ACTIVITIES SPRINT REPORT — Worker C

**Branch:** `grok-swarm/activities`  
**Base:** `main` `079aec9`  
**Date:** 2026-07-12  
**Terminal:** `ACTIVITIES_WORKER_PARTIAL`

## Summary

| Metric | Count |
|--------|------:|
| Lessons complete (exercise pack `studentFacingStatus=ready`) | **17** |
| Lessons incomplete (pending + NEEDS_CONTENT_REVIEW) | **7** |
| Faithful layouts with graded interactive regions | **24 / 24** |
| Workbook pages covered | **90** |

### Exact incomplete lesson numbers

**17, 19, 20, 21, 22, 23, 24**

These remain `studentFacingStatus: "pending"` with `[NEEDS_CONTENT_REVIEW]` markers because source pack / alignment flags them as `AWAITING-SOURCE-SCAN`, `missing-source`, or `teacher-distributed`. No book text was invented to force them ready.

**Note:** Even incomplete packs still have **working on-page interactions** in `page-layouts.json` via `FaithfulPageRenderer` (syllable-match, fill-in-blank, writing-line, draw-box, reading-sentences). The incomplete flag is specifically about the secondary `lesson-exercises/*` pack status, not a blank student route.

## Inventory (all 24)

| Lesson | Pages | Focus (`lesson-meta`) | Prod exercise kinds | Status | Student path (page-layouts) |
|-------:|-------|------------------------|---------------------|--------|-----------------------------|
| 1 | 1–3 | Intro vowels | listen-and-tap, drag-syllable-to-slot | ready | picture-grid, vowel-pick-one, vowel-match-all |
| 2 | 4–6 | O | drag-syllable-to-slot, letter-tracing, listen-and-tap | ready | picture-grid, vowel-line-match, writing-line, draw-box |
| 3 | 7–9 | A | letter-tracing, listen-and-tap, drag-syllable-to-slot | ready | same vowel pattern |
| 4 | 10–12 | E | listen-and-tap, drag-syllable-to-slot, letter-tracing | ready | same vowel pattern |
| 5 | 13–15 | I | drag-syllable-to-slot, letter-tracing | ready | same vowel pattern |
| 6 | 16–18 | U | listen-and-tap, drag-syllable-to-slot, letter-tracing | **ready (promoted)** | same vowel pattern |
| 7 | 19–22 | Mm | letter-tracing, drag-syllable-to-slot, read-aloud, listen-and-tap, mini-story | ready | writing-line, draw-box, syllable-match, fill-in-blank, reading-sentences |
| 8 | 23–26 | Pp | same consonant set | **ready (promoted)** | same consonant pattern |
| 9 | 27–30 | Ss | same | ready | same |
| 10 | 31–34 | Tt | same | **ready (promoted)** | same |
| 11 | 35–38 | Dd | same | **ready (promoted)** | same |
| 12 | 39–42 | Ll | same | **ready (promoted)** | same |
| 13 | 43–46 | Nn | same | **ready (promoted)** | same |
| 14 | 47–50 | Ññ | same | **ready (promoted)** | same |
| 15 | 51–54 | Bb | same | **ready (promoted)** | same |
| 16 | 55–58 | Vv | same | **ready (promoted)** | same |
| 17 | 59–62 | Rr | same | **pending / NEEDS_CONTENT_REVIEW** | layouts interactive (student path works) |
| 18 | 63–66 | rr | same | **ready (promoted)** | same |
| 19 | 67–70 | Gg | same | **pending / NEEDS_CONTENT_REVIEW** | layouts interactive |
| 20 | 71–74 | Ff | same | **pending / NEEDS_CONTENT_REVIEW** | layouts interactive |
| 21 | 75–78 | Jj | same | **pending / NEEDS_CONTENT_REVIEW** | layouts interactive |
| 22 | 79–82 | Cc | same | **pending / NEEDS_CONTENT_REVIEW** | layouts interactive |
| 23 | 83–86 | Yy | same | **pending / NEEDS_CONTENT_REVIEW** | layouts interactive |
| 24 | 87–90 | Zz | same | **pending / NEEDS_CONTENT_REVIEW** | layouts interactive |

Sources used for promotion (not invention):

- `src/data/page-layouts.json` — all graded region types carry `"correct"` flags (121 graded regions verified)
- `src/data/workbook-interactions.json` — book-derived transcription notes (e.g. L8 P pages)
- `src/content/consonants.json` — syllables / sentences for L7–24
- Read-only pack: `cartilla_24_lesson_alignment.csv`, `cartilla_interaction_content.json`

## Progress save path

| Surface | Path |
|---------|------|
| On-page faithful exercises | `InteractivePageExercises.tsx` → `recordEvent({ kind: "exercise", ... })` → `student-session` → `logProgress` / `log_student_progress` RPC when session exists; always mirrors to local `exercise-stats` |
| Writing-line / draw-box | `WorkbookLetterTrace`, `DrawBoxCanvas` → same `recordEvent` |
| Reading sentences (new) | `InteractiveReadingSentences` → `recordEvent` on full mark-as-read |
| Living workbook engine | `LivingWorkbookPage` → `emitProgressEvent` → `progress-events` queue → `logProgress` |
| Lesson complete / time | `leccion.$n.tsx` → `recordEvent` lesson_completed + time |
| Last page resume | `saveLastPage` via student session |

## Changes shipped this sprint

1. **Promoted** lesson-exercise packs **6, 8, 10–16, 18** to `studentFacingStatus: "ready"` / `sourceStatus: "verified"` where book-derived sources support them (`scripts/activities-sprint-promote.mjs`).
2. **Marked** packs **17, 19–24** with `[NEEDS_CONTENT_REVIEW]` (kept pending — no invented mini-stories / word banks).
3. **Interactive reading-sentences** on student workbook (`InteractiveReadingSentences` + CSS + FaithfulPageRenderer wiring) — tap book sentences to mark read; progress via existing `recordEvent` (no stock TTS expansion).
4. **Regression tests** `src/components/cartilla/__tests__/activities-24-lessons.test.tsx` — 24 lessons packs, layouts, graded flags, incomplete list, reading progress.
5. **Inventory refresh** → `generated/release-integration-qa/activities-inventory.{json,md}`.
6. **Browser QA screenshots** → `generated/activities-qa/`.

## Screenshot paths

```
generated/activities-qa/lesson-01.png
generated/activities-qa/lesson-02.png
generated/activities-qa/lesson-06.png
generated/activities-qa/lesson-07.png
generated/activities-qa/lesson-08.png
generated/activities-qa/lesson-09.png
generated/activities-qa/lesson-16.png
generated/activities-qa/lesson-17.png
generated/activities-qa/lesson-18.png
generated/activities-qa/lesson-24.png
generated/activities-qa/lecciones-index.png
generated/activities-qa/browser-qa.json
```

All sampled routes returned `status: ok` (no crash UI).

## Test / build output

| Check | Result |
|-------|--------|
| `vitest` activities-24 + lessons-audit | **177 passed** |
| `tsc --noEmit` | **pass** |
| `pnpm build` (sanity + validate:content + vite) | **pass** |
| Browser QA sample lessons | **ok** |

## Activity types in production student path

- `picture-grid` (tap / mark)
- `vowel-pick-one` (drag/tap match)
- `vowel-match-all`
- `vowel-line-match`
- `syllable-match`
- `fill-in-blank`
- `writing-line` → letter tracing templates
- `draw-box` → free draw canvas
- `reading-sentences` → tap-to-mark-read (**new progress wiring**)

Secondary packs / carousel (not rebuilt): `listen-and-tap`, `drag-syllable-to-slot`, `letter-tracing`, `read-aloud`, `mini-story` in `lesson-exercises/*` + generic ActivityCarousel framework left as-is.

## Remaining work (for complete terminal)

1. Source-verify L17, L19–L24 exercise-pack mini-stories/word banks against physical book / teacher guide scans; then flip `studentFacingStatus` to ready.
2. Align lesson-exercise `pageNumber` fields with workbook 1–90 vs PDF offset if teacher guide consumers need it (left unchanged to avoid breaking `getBookPageImage` refs).
3. Optional: promote matching `workbook-interactions.json` pending entries once coordinates verified.

## Decision log

- Did **not** invent content for L17/19–24 packs despite functional page-layouts.
- Did **not** touch `lesson-meta.ts` letter assignments or `page-layouts.json` content (only consumer code for reading-sentences).
- Did **not** expand stock TTS.
