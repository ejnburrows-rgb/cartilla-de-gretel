# Project: La Cartilla de Gretel Interactive Features

## Architecture
Spanish literacy app for K-3 early readers using React, TanStack Router, Vite, TypeScript, and AudioContext / Web Speech API.
The student view is located under `/cartilla/student/leccion/$n` and the teacher view under `/cartilla/teacher/`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Mascot Upgrades | Synchronized mouth animations, confetti celebration overlay, local voices boost | None | DONE (Conv: b876fdee-5fbf-499e-bdf4-8f4a89f6afc7) |
| 2 | Voice Piano Pronunciation | AudioContext piano synth, Spanish SpeechRecognition, red/green key feedback | M1 | IN_PROGRESS (Conv: 62b7f65f-b42c-4b54-b0da-011bc87829aa) |
| 3 | Workbook Page Flip | Upward vertical spiral book flip, swipe navigation (horizontal/vertical) | None | DONE |
| 4 | Interactive Consonants | Digitization of Lessons 7-24 with modern layouts, colorful aesthetic, and 3D flip-ups | M3 | DONE |
| 5 | Teacher Lesson Catalog | CRM Integration: minimalist curriculum browser `/cartilla/teacher/lecciones` | None | DONE |
| 6 | Gateway UI Overhaul | CSS-animated garden Splash Screen isolating student/teacher routes | None | DONE |
| - | E2E Testing Track | Requirement-driven test suite & infrastructure (TEST_READY.md) | None | IN_PROGRESS (Conv: f242b944-55cb-4c3d-b012-ba3ef2ea72d8) |

## Interface Contracts
### Gretel Mascot Animation
- SpeechSynthesis triggers `gretel:speak_start` and `gretel:speak_stop` custom events on `window`.
- Live celebration is triggered via custom event `gretel:celebrate` with details `{ text?: string }`.
- Live Avatar Ref:
  ```typescript
  export interface GretelLiveAvatarRef {
    celebrate: (customText?: string) => Promise<void>;
    speakMessage: (text: string) => Promise<void>;
    encourage: () => Promise<void>;
  }
  ```

### Voice Piano Pronunciation
- Component props:
  ```typescript
  interface PianoPronunciationProps {
    syllables: string[];
    lessonId?: string;
    color?: string;
    onComplete?: () => void;
  }
  ```
- Tones are synthesized using standard browser `AudioContext` (sine/triangle oscillator combo).
- Microphones are accessed via Web Speech API `SpeechRecognition`.

### Page Flip
- Swipe actions: `useSwipe` detects gestures (up/down/left/right) on touch/pointer devices.
- `StudentWorkbookFlip`: upward vertical flip with spiral binding, responding to swipe up/down.
- `BookPageFlip`: horizontal layout book page flip, responding to swipe left/right.

### Teacher 4-Squares Guide
- Route: `/cartilla/teacher/guia/$n`.
- Renders `TeacherGuidePanel` containing a 2x2 grid (Objectives, Suggested Procedures, Vocab & Poem, Assessment Criteria).
- Includes tip, FYI, and warning callout blocks.
- Supports print view via CSS `@media print`.

### Drag-and-Drop Activities & ActivityCarousel — REMOVED and ON HOLD, not live
**Correction:** `ActivityCarousel` and the games below were unwired from
every lesson in the July 2026 rewrite (see SPEC.md, "'Ejercicios
Interactivos' step removed from every lesson" and "Lesson-structure canon
change: 2-tab layout retired, book pages ARE the lesson"). The current
lesson route (`leccion.$n.tsx`) renders the book's real pages directly, no
tabs, no carousel. The components below still exist in the repo (per the
never-delete-files rule) but are dead code — not reachable by a student:
- Games implemented using `@dnd-kit/core` with touch and pointer support:
  - `DragMatchPairs`: drag syllables to match illustrations or word-to-word matching.
  - `DragSyllableOrder`: drag syllables in a horizontal tray to order them and form words.
  - `DragLetterTrace`: drag pencil icon or trace letters on a dashed path.
- `ActivityCarousel`: A tabbed slider or carousel wrapper that used to house these activities for a lesson.

## Code Layout
- Mascot: `src/components/gretel/`
- Piano: `src/components/cartilla/PianoPronunciation.tsx`, `src/hooks/useSpeechRecognition.ts`, `src/lib/piano-audio.ts`
- Page Flip: `src/components/StudentBook/StudentWorkbookFlip.tsx`, `src/components/cartilla/BookPageFlip.tsx`, `src/hooks/useSwipe.ts`
- Teacher Guide: `src/routes/cartilla/teacher/guia.$n.tsx`, `src/components/teacher/TeacherGuidePanel.tsx`
- Drag-and-Drop: `src/components/activities/DragMatchPairs.tsx`, `src/components/activities/DragSyllableOrder.tsx`, `src/components/activities/DragLetterTrace.tsx`, `src/components/activities/ActivityCarousel.tsx`
