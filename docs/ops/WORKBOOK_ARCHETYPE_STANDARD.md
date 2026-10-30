# Workbook Archetype Standard

This document records the owner-selected official archetypes and their required formats.

## Student Workbook Official Archetypes

### Archetype #1 — `OfficialWorkbookPageView.tsx`

Official Page Canvas on Faithful Cream Page (`#FBF7EE`) with:

- `Fraunces` and `Plus Jakarta Sans`
- Diamond page footer
- `PencilConnector`
- `HandwritingLine`
- Touch targets of at least 44px
- Strict completion gating through `isCurrentStepComplete`

### Archetype #2 — `LivingArtSplitView`

Living-Art Split Prototype with Guided Cards: a `Paso 1–3` stepper and a living-art stage with a reduced-motion toggle.

### Coexistence Mode

Mount a `Vista Página Oficial` / `Vista Guiada Interactiva` switcher in `/cartilla/leccion/$lessonNumber` so students and teachers can use both official archetypes across all 24 lessons.

## Teacher Flip Chart Official Archetypes

### Archetype #1 — `FlipChartSheetView.tsx`

Native Top-Bound Sheet Presenter across all 62 sheets, with:

- A 2.0-second vertical page turn (`data-page-turn-axis="vertical"`)
- Top binding rings
- Bottom teacher dock: `Puntero`, `Lápiz`, `Cortina`, `Ficha`, `Sonido`

### Archetype #2 — `InteractiveFlipchartOverlay.tsx`

Mount `InteractiveFlipchartOverlay.tsx` directly inside `FlipChartSheetView.tsx`. Tapping any picture or tilted syllable on a sheet highlights the target and plays the verified Gretel recording. Audio policy is `allowTts: false`.

## Official Games, Activities & Piano Formats

### Piano Hablador & Cancionero

Provide a dedicated `Cancionero / Piano` lesson tab on every lesson with a songbook page, and support `/cartilla/practica?modo=piano` using the Steinway samples from #1174 and #1180.

### All 7 Practice Modes

Enable all seven modes on `/cartilla/practica`:

`silabas`, `palabras`, `armar`, `trazar`, `piano`, `sonido`, `espejo`.

### Curriculum Phonics & Flagship Games

Preserve the live `mariposas-p` game and its original assets. The target flagship game set includes `cow-game-m` and `payaso-chano-ss`, with reduced-motion behavior. Verify:

- `silabas-o`
- `silabas-m`
- `silabas-p`
- `vocal-a`
- `fonetica-p`
- `rima-p`
- `palabras-minuto-p`
- `dibujos-o`
- `completar-palabras`

### 4 Activated Generic MiniGames

Mount `SyllableTrain`, `WordPuzzle`, `MemoryMatch`, and `RapidFire` from `src/components/cartilla/InteractiveMiniGames.tsx` inside `/cartilla/practica` and end-of-lesson review tabs.

## Protected Requirements

- Spanish reading exercises use real human recordings from `public/audio/gretel/` or Steinway piano samples from `public/audio/piano/`. Keep `allowTts: false`; do not use `window.speechSynthesis` or AI text-to-speech.
- Workbook pages 86–87 (Lesson 24, `güe / güi`) remain `SOURCE_BLOCKED` and excluded from student navigation until the owner supplies source scans. Do not invent their artwork.
- Keep `git.deploymentEnabled: false` in `vercel.json`. This standard does not authorize a production deployment.
- Gretel Tutor #1073 is complete and outside this scope. Do not modify or assign Tutor files.
- `/cartilla/juego/mariposas-p` is live and verified with all 33 original assets. Do not overwrite or re-import its assets.
