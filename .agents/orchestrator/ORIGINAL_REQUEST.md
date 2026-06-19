# Original User Request

## 2026-06-17T18:42:20Z

Implement a set of interactive features for *La Cartilla de Gretel*, a Spanish literacy application for early readers, including animated speaking Gretel mascot, Speech Recognition-enabled piano pronunciation lesson, vertical and horizontal workbook flipbooks, teacher 4-squares guide panel, and new drag-and-drop games.

Working directory: `C:/Users/EJN/Desktop/La Cartilla/cartilla-de-gretel`
Integrity mode: development

## Requirements

### R1. Gretel mascot upgrades
- Add speaking state mouth animations synced with SpeechSynthesis TTS events.
- Create celebration overlay with confetti and speech.
- Prioritize local SpeechSynthesis voices when offline.

### R2. Voice Piano Pronunciation
- Create microphone speech recognition in Spanish.
- Synthesize piano notes with AudioContext.
- Light keys red/green for pronunciation feedback.

### R3. Vertical/Horizontal Page Flip
- Upward vertical flip workbook page turns with top spiral binding.
- Swipe gesture navigation (left/right and up/down).

### R4. Teacher 4-Squares Guide
- 2x2 grid guide dashboard under `/cartilla/teacher/guia/$n`.
- Print view and custom FYI, tip, and warning blocks.

### R5. Drag-and-Drop Activities
- DragMatchPairs, DragSyllableOrder, DragLetterTrace games.
- Combined ActivityCarousel tabbed wrapper in student lesson views.

### R6. Branch Constraints
- Maintain extremely clean git branch usage.
- Create at most 1 or 2 branches for this work. Delete any temporary/unused branches.

## Acceptance Criteria

### Functionality
- [ ] SpeechRecognition listens to microphone input in Spanish.
- [ ] AudioContext oscillator generates pleasant tones and chords.
- [ ] Workbook transitions animate vertically with 3D transform.
- [ ] Drag-and-drop components function on both mouse and touch devices.
- [ ] Teacher layout successfully routes to the guide pages.

### Verification
- [ ] Code builds without TypeScript typecheck errors.
- [ ] Sanity checking scripts run successfully.
