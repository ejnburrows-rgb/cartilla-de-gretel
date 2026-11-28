# Gretel Tutor Lección 1 — Phone-Width Walkthrough Proof (390×844)

**Target Head**: `2e8c73ee74c73600bc72f303ac477f4b8c4996ef` (Branch: `feat/gretel-tutor-l1-3`)  
**Date**: October 29, 2026  
**Viewport**: 390×844 px (Mobile Portrait)  
**Execution Mode**: Automated Browser Run (Playwright Chromium) with StubEars on-device simulation (`VITE_TUTOR_EARS=stub`)

---

## 1. Requirement Checklist & Verification Results

| # | Requirement | Status | Evidence Artifact |
|---|-------------|--------|-------------------|
| 1 | Entering Tutor through app navigation | **WORKS** | `01_nav_entry_splash_phone.png`, `07_nav_from_lecciones_phone.png` |
| 2 | Opening Lección 1 with authentic book content (24 items) | **WORKS** | `02_tutor_picker_phone.png`, `03_stage_initial_phone.png`, `verification-metadata.json` |
| 3 | Presenting learning activity with Gretel puppet | **WORKS** | `03_stage_initial_phone.png` (Gretel puppet, word card, 96×96px mic button) |
| 4 | Handling correct answer (green wooden pencil circle) | **WORKS** | `04_correct_green_circle_phone.png` (`WorkbookPencilMark` green circle) |
| 5 | Handling wrong answer & retry (red mark erased with pink eraser) | **WORKS** | `05_wrong_mark_eraser_phone.png`, `06_retry_success_advance_phone.png` |
| 6 | Saving progress to localStorage | **WORKS** | `verification-metadata.json` (`cartilla.tutor.progress.v1`, `cartilla.tutor.memory.v1`) |
| 7 | Leaving and returning to resume progress | **WORKS** | `07_nav_from_lecciones_phone.png`, `08_return_resume_phone.png` |
| 8 | Gracefully handling unavailable microphone without crash | **WORKS** | `09_unavailable_mic_phone.png` (`TutorUnavailable` banner) |

---

## 2. Visual Proof Inventory

1. **`01_nav_entry_splash_phone.png`**: Main landing splash (`/`) displaying the prominent, accessible "Tutor Gretel" action button alongside "Comenzar" and "Soy maestro".
2. **`02_tutor_picker_phone.png`**: Tutor lesson picker screen (`/tutor`) showing Lección 1 ("Las vocales: A E I O U", 24 items derived from original book transcription), anonymous session code (`clase`) and seat slot picker.
3. **`03_stage_initial_phone.png`**: Tutor stage (`/tutor/1?code=clase&slot=1`) at 390×844 phone width. Renders approved intact Gretel master puppet, target vowel card "a", sound controls, and centered 96×96px microphone button.
4. **`04_correct_green_circle_phone.png`**: Authentic green pencil circle rendered by `WorkbookPencilMark` upon correct answer.
5. **`05_wrong_mark_eraser_phone.png`**: Red pencil mark erased by pink eraser animation (`markWrongErase`) when incorrect answer is given on item "e". Replay pronunciation button and guidance rendered.
6. **`06_retry_success_advance_phone.png`**: Correct answer on second attempt advances session to item 3 ("i").
7. **`07_nav_from_lecciones_phone.png`**: Student curriculum screen (`/cartilla/lecciones`) showing prominent "Practicar con Gretel (Tutor)" button.
8. **`08_return_resume_phone.png`**: Returning to the session restores anonymous progress and session state.
9. **`09_unavailable_mic_phone.png`**: `TutorUnavailable` component rendering polite, child-friendly Spanish reassurance when microphone permission is denied, maintaining full lesson visual access without crashing.
10. **`walkthrough-grid.png`**: 3×3 visual montage showing the complete 9-step journey.
11. **`walkthrough-animated.gif`**: Animated walkthrough recording of the complete interaction.

---

## 3. Disclosures & Boundaries (AGENTS.md Compliance)

- **Simulated Test Harness (StubEars)**: Test speech transcripts were provided via the offline `StubEars` testing engine (`VITE_TUTOR_EARS=stub`) to deterministically exercise the complete state machine. **Real physical acoustic microphone capture with child speakers in classroom ambient noise is NOT VERIFIED.**
- **Audio Playback**: 19 Lección 1 vocabulary words use owner-approved recordings from `public/audio/voz/vocabulario/*.mp3`. 71 conversational/praise lines operate in gentle silence mode with visual captions pending owner auditory generation.
- **Privacy Assurance**: All data is stored locally in device `localStorage` with anonymous UUIDv5 session identifiers (`ba99b57d-...`). Zero network telemetry, zero cloud speech, zero LLM, and zero PII.
