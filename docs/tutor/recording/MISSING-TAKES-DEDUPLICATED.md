# Deduplicated Missing Takes & Wording Decisions for Emilio

Reconciled across all four current sources:
1. **Approved audio files on disk (`public/audio/voz/**`)**: **167** MP3 files (161 approved vocabulary clips in `public/audio/voz/vocabulario/` excluding quarantined `nina-sordita.mp3`, plus 6 excerpts from `Gretel_558674_Original.m4a` in `public/audio/voz/tutor/leccion-0/`: `l0-praise-01.mp3` and `l0-vowel-model-{a,e,i,o,u}.mp3`).
2. **Runtime Tutor manifests (`src/content/tutor-lines.json` + `src/content/tutor-picture-models.json`)**: **49** approved legacy/core lines + **84** additional curriculum-matched picture models with Rhubarb visemes (`71` pending legacy lines remaining).
3. **Recovered owner cuts (`~/GretelVoicePrivate/gretel-tutor-handoff-2026-11-27/recovered-voice-cuts/`)**: **45** clips (40 workbook instruction cuts from `audio-b10640b9.mp3` + 5 Lesson 3 cuts from `audio-cfcac090.mp3`). `muy-bien.mp3` is superseded by the verified `Gretel_558674_Original.m4a` excerpt (`l0-praise-01.mp3`); the 44 instruction clips await Emilio's auditory quality approval before activation (do not re-record unless rejected).
4. **Owner spreadsheet (`Gretel-recording-list.xlsx`) & v2 24-lesson dialogue (`src/content/tutor-dialogue/*.json`)**: Reconciled against live disk assets. Spreadsheet discrepancies resolved below.

## 1. Spreadsheet Discrepancies Resolved (Already Present — Do NOT Re-Record)

| Item | Spreadsheet status (`Gretel-recording-list.xlsx`) | Actual verified status |
| --- | --- | --- |
| `a`, `e`, `i`, `o`, `u` (`l0-vowel-model-*`) | Listed in `Start here`, `Missing target words`, and `Pending legacy lines` | **LIVE & APPROVED** from `Gretel_558674_Original.m4a` with Rhubarb visemes (`l0-vowel-model-{a,e,i,o,u}.mp3`). |
| `¡Muy bien!` (`l0-praise-01`) | Listed in `Start here` as Mac recovery pending review | **LIVE & APPROVED** from `Gretel_558674_Original.m4a` (`l0-praise-01.mp3`, 716.68–717.98 s). |
| `a` sight-word (`l13-sight-a`, Lesson 13) | Listed with `a` in `Missing target words` | Uses the verified isolated `a` sound (`l0-vowel-model-a.mp3`). |
| 84 vocabulary words in `tutor-picture-models.json` | Some listed as pending wiring | **LIVE & APPROVED** with Rhubarb visemes (including Lesson 3's 8 practice words and Lesson 4's `elefante`, `erizo`, `espejo`, etc.). |

## 2. Priority Demo & Shared Classroom Coaching (Start Here — 5 Remaining Takes)

If Emilio records one short continuous file with clear pauses between phrases, these **5** lines complete the immediate Demo Mode greeting, praise, retry, and help loop (alongside the already-live vowels and `¡Muy bien!`). Items marked **(Wording approval needed)** are proposed sentences not yet in the printed book.

| Order | Line ID | Exact Spanish | Where the child hears it | Wording status |
| ---: | --- | --- | --- | --- |
| 1 | `l3-greeting-first-03` | ¡Qué bueno verte! Vamos a seguir con la vocal A. | Lesson 3 · `greeting-first` | Proposed sentence — confirm exact wording or edit |
| 2 | `l0-praise-06` | ¡Perfecto! | All lessons (shared) · `praise` | Proposed sentence — confirm exact wording or edit |
| 3 | `l0-praise-07` | ¡Eso es! | All lessons (shared) · `praise` | Proposed sentence — confirm exact wording or edit |
| 4 | `l0-try-again-01` | Inténtalo otra vez. | All lessons (shared) · `try-again` | Approved repo wording (`STUDENT_INTERACTION_STANDARD`) |
| 5 | `l0-help-02` | Mírame. Di la palabra conmigo. | All lessons (shared) · `help` | Proposed sentence — confirm exact wording or edit |

*Optional on-screen note from `Start here`*: `Observa cómo se escribe la a de abeja.` (`board-a`, Lesson 3) — currently an on-screen visual board action; record only if Emilio wants Gretel to speak this direction aloud.

## 3. All Remaining Shared & Lesson 1–3 Tutor Lines (66 Additional Unique Takes)

Deduplicated from the 71 pending lines in `src/content/tutor-lines.json` (minus the 5 priority takes above). None overlap with the 45 recovered clips or approved disk recordings.

| Line ID | Where the child hears it | Exact Spanish | Wording status |
| --- | --- | --- | --- |
| `l1-greeting-first-01` | Lesson 1 · `greeting-first` | ¡Hola! Vamos a conocer las vocales. | Existing repo wording |
| `l1-greeting-first-02` | Lesson 1 · `greeting-first` | ¡Hola! Soy Gretel. Vamos a aprender las vocales: a, e, i, o, u. | Proposed (`[DRAFT]`) — confirm/edit |
| `l1-greeting-first-03` | Lesson 1 · `greeting-first` | ¡Hola, amiguito! Hoy empezamos con las vocales. | Proposed (`[DRAFT]`) — confirm/edit |
| `l2-greeting-first-01` | Lesson 2 · `greeting-first` | ¡Hola! Vamos a la lección de la vocal O. | Existing repo wording |
| `l2-greeting-first-02` | Lesson 2 · `greeting-first` | ¡Hola! Hoy practicamos la vocal O. | Proposed (`[DRAFT]`) — confirm/edit |
| `l2-greeting-first-03` | Lesson 2 · `greeting-first` | ¡Qué bueno verte! Vamos a seguir con la vocal O. | Proposed (`[DRAFT]`) — confirm/edit |
| `l3-greeting-first-01` | Lesson 3 · `greeting-first` | ¡Hola! Vamos a la lección de la vocal A. | Existing repo wording |
| `l3-greeting-first-02` | Lesson 3 · `greeting-first` | ¡Hola! Hoy practicamos la vocal A. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-greeting-return-01` | All lessons (shared) · `greeting-return` | Bienvenidos a la Cartilla de Gretel. Vamos a aprender a leer juntos. | Existing repo wording |
| `l0-greeting-return-02` | All lessons (shared) · `greeting-return` | ¡Hola otra vez! Seguimos aprendiendo a leer juntos. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-greeting-return-03` | All lessons (shared) · `greeting-return` | ¡Qué bueno verte de nuevo! Vamos a continuar. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-praise-02` | All lessons (shared) · `praise` | ¡Excelente! | Existing repo wording |
| `l0-praise-03` | All lessons (shared) · `praise` | ¡Lo lograste! | Existing repo wording |
| `l0-praise-04` | All lessons (shared) · `praise` | ¡Qué bien! | Existing repo wording |
| `l0-praise-05` | All lessons (shared) · `praise` | Buen trabajo. | Existing repo wording |
| `l0-praise-08` | All lessons (shared) · `praise` | ¡Muy bien hecho! | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-praise-09` | All lessons (shared) · `praise` | ¡Sigue así! | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-praise-10` | All lessons (shared) · `praise` | ¡Genial! | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-praise-11` | All lessons (shared) · `praise` | ¡Correcto! | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-praise-12` | All lessons (shared) · `praise` | ¡Tú sí puedes! | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-praise-streak-01` | All lessons (shared) · `praise-streak` | ¡Vas volando! | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-praise-streak-02` | All lessons (shared) · `praise-streak` | ¡Qué racha tan buena! | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-praise-streak-03` | All lessons (shared) · `praise-streak` | ¡Muchas correctas seguidas! | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-praise-streak-04` | All lessons (shared) · `praise-streak` | ¡Eres una estrella! | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-praise-after-retry-01` | All lessons (shared) · `praise-after-retry` | ¡Lo lograste! Lo intentaste otra vez y pudiste. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-praise-after-retry-02` | All lessons (shared) · `praise-after-retry` | ¡Eso es! No te rendiste. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-praise-after-retry-03` | All lessons (shared) · `praise-after-retry` | ¡Muy bien! Te costó, pero lo conseguiste. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-praise-after-retry-04` | All lessons (shared) · `praise-after-retry` | ¡Bien por ti! Cada vez te sale mejor. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-close-miss-01` | All lessons (shared) · `close-miss` | Casi casi. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-close-miss-02` | All lessons (shared) · `close-miss` | Uy, casi. Un poquito más. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-close-miss-03` | All lessons (shared) · `close-miss` | Tan cerquita. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-close-miss-04` | All lessons (shared) · `close-miss` | Por poquito. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-try-again-02` | All lessons (shared) · `try-again` | Casi. Prueba otra vez. | Existing repo wording |
| `l0-try-again-03` | All lessons (shared) · `try-again` | Tú puedes. | Existing repo wording |
| `l0-try-again-04` | All lessons (shared) · `try-again` | No pasa nada. Inténtalo de nuevo. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-try-again-05` | All lessons (shared) · `try-again` | Otra vez, con calma. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-try-again-06` | All lessons (shared) · `try-again` | Una vez más, tú puedes. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-confusion-a` | All lessons (shared) · `confusion` | Esa es la A. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-confusion-e` | All lessons (shared) · `confusion` | Esa es la E. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-confusion-i` | All lessons (shared) · `confusion` | Esa es la I. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-confusion-o` | All lessons (shared) · `confusion` | Esa es la O. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-confusion-u` | All lessons (shared) · `confusion` | Esa es la U. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-wrong-word-01` | All lessons (shared) · `wrong-word` | Ese no es. Escucha otra vez. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-wrong-word-02` | All lessons (shared) · `wrong-word` | Uy, no es esa palabra. Intenta de nuevo. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-wrong-word-03` | All lessons (shared) · `wrong-word` | Casi, pero no es esa. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-repeat-ack-01` | All lessons (shared) · `repeat-ack` | Muy bien dicho. Ahora otra vez. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-repeat-ack-02` | All lessons (shared) · `repeat-ack` | ¡Otra vez, más fuerte! | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-dont-know-01` | All lessons (shared) · `dont-know` | No pasa nada. Escucha y repite conmigo. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-dont-know-02` | All lessons (shared) · `dont-know` | Tranquilo. Primero escucha la palabra. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-dont-know-03` | All lessons (shared) · `dont-know` | No te preocupes. La hacemos juntos. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-help-01` | All lessons (shared) · `help` | Escucha bien el sonido y repite. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-help-03` | All lessons (shared) · `help` | Primero escucha, luego repite despacio. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-silence-nudge-01` | All lessons (shared) · `silence-nudge` | No te oigo. Acércate al micrófono. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-silence-nudge-02` | All lessons (shared) · `silence-nudge` | Habla un poquito más fuerte. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-silence-nudge-03` | All lessons (shared) · `silence-nudge` | ¿Estás ahí? Dime la palabra cuando quieras. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-noise-01` | All lessons (shared) · `noise` | Hay mucho ruido. Busquemos un lugar tranquilo. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-noise-02` | All lessons (shared) · `noise` | Escucho ruido. Vamos a un lugar más callado. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-redirect-01` | All lessons (shared) · `redirect` | Vamos a seguir con la siguiente palabra. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-redirect-02` | All lessons (shared) · `redirect` | Sigue con la siguiente. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-redirect-03` | All lessons (shared) · `redirect` | Dejemos esa y seguimos aprendiendo. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-review-intro-01` | All lessons (shared) · `review-intro` | Vamos a repasar lo que aprendimos. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-review-intro-02` | All lessons (shared) · `review-intro` | Ahora repasamos juntos. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-closing-01` | All lessons (shared) · `closing` | ¡Muy bien! Terminamos por hoy. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-closing-02` | All lessons (shared) · `closing` | ¡Gran trabajo! Nos vemos en la próxima lección. | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-closing-03` | All lessons (shared) · `closing` | Adiós. ¡Hasta pronto! | Proposed (`[DRAFT]`) — confirm/edit |
| `l0-idle-end-01` | All lessons (shared) · `idle-end` | Descansa un poco. Nos vemos pronto. | Proposed (`[DRAFT]`) — confirm/edit |

## 4. Recovered Workbook Instruction Clips (44 Existing Cuts — Listen & Approve, Do NOT Re-Record)

These 44 recordings already exist in `~/GretelVoicePrivate/gretel-tutor-handoff-2026-11-27/recovered-voice-cuts/` (`40` from `audio-b10640b9.mp3` + `4` from `audio-cfcac090.mp3`, excluding `muy-bien.mp3` which is already live via `Gretel_558674_Original.m4a`). They passed separate transcription checks and await Emilio's auditory quality sign-off (checking background music bleed / tone). Full list: `INSTRUCTION-LINES.csv` and `OWNER-INSTRUCTION-RECOVERY.md`.

## 5. Missing Curriculum Targets Across Lessons 1–24 (715 Unique Texts)

Deduplicated by exact normalized Spanish across all 24 lesson graphs (`src/content/tutor-graph/lesson-*.json`). Any item appearing in multiple lessons is listed once with all lessons where the child hears it.

- `sentence`: **118** unique texts
- `sight-word`: **16** unique texts
- `sight-word/syllable`: **2** unique texts
- `sight-word/syllable/word`: **2** unique texts
- `sight-word/word`: **2** unique texts
- `syllable`: **81** unique texts
- `syllable/word`: **1** unique texts
- `word`: **493** unique texts

### 5.1 Lessons 1–6 Missing Targets (Immediate Early-Lesson Priority)

None — all Lesson 1–6 curriculum items already have approved recordings.

### 5.2 Lessons 7–24 Missing Syllables (86 Unique Syllable Texts; 96 Curriculum Syllable Items)

| Lesson(s) | Exact Spanish syllables |
| --- | --- |
| Lesson 7 | ma, me, mi, mo, mu |
| Lesson 8 | pa, pe, pi, po, pu |
| Lesson 8, 23 | yo |
| Lesson 9, 11 | de |
| Lesson 9, 12 | la |
| Lesson 9 | sa, se, si, so, su |
| Lesson 10, 13 | no |
| Lesson 10 | ta, te, ti, to, tu |
| Lesson 11 | da, di, do, du |
| Lesson 12 | le, li, lo, lu |
| Lesson 13 | na, ne, ni, nu |
| Lesson 14 | ña, ñe, ñi, ño, ñu |
| Lesson 15 | ba, be, bi, bo, bu |
| Lesson 16 | va, ve, vi, vo, vu |
| Lesson 17 | ra, re, ri, ro, ru |
| Lesson 18 | rra, rre, rri, rro, rru |
| Lesson 19 | ga, go, gu |
| Lesson 20 | fa, fe, fi, fo, fu |
| Lesson 21 | ja, je, ji, jo, ju |
| Lesson 22 | ca, co, cu |
| Lesson 23 | ya, ye, yi, yu |
| Lesson 24 | za, ze, zi, zo, zu |

### 5.3 Lessons 7–24 Remaining Missing Words & Reading Sentences

- **Remaining single words / sight words (L7–24)**: **511** unique texts (see full per-lesson scripts in `docs/tutor/recording/B007-lesson-01.txt` through `B030-lesson-24.txt` and `RECORDING-INDEX.csv`).
- **Reading sentences (L7–24)**: **118** unique sentences (see `B013-lesson-07.txt` through `B030-lesson-24.txt`).

## 6. Scripted v2 Coaching Dialogue (1,418 Unique Lines Across `B001–B031`)

- **Count**: **1418** scripted lines in `src/content/tutor-dialogue/universal.json` and `lesson-01.json`..`lesson-24.json` (0 overlap with the 71 legacy pending lines; 0 `[DRAFT]` markers).
- **Recording scripts**: `docs/tutor/recording/B001-universal.txt` .. `B031-interactive-conversation.txt` and priority subset `PRIORITY-B001`..`PRIORITY-B003`.
- **Runtime behavior until recorded**: Every unrecorded v2 line displays cleanly as on-screen Spanish text labeled `Solo texto (sin audio aprobado todavía)` and never uses synthetic TTS.

## 7. Flip Chart & Artwork Scene Labels (38 Internal Keys — Needs Text Confirmation First)

- `docs/tutor/coverage/AUDIO-RECONCILIATION.md` §4 lists 38 `source-pending` Flip Chart/scene keys (`a la fiesta scene`, `burro b`, etc.; also tracked in XLSX sheet `Other product audio` alongside 18 sound/UI stubs). Do **not** read internal tags like `scene`; confirm the exact printed Flip Chart caption before recording.
