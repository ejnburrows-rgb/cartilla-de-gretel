# Games Review & Upgrade Plan (2026-11-17)

**Scope**: All 12 registered games in `LIVE_GAMES` (`src/routes/cartilla/juego.$gameId.tsx`), audited at **390×844 (mobile)** and **1366×768 (desktop)** using Playwright against `pnpm dev:worker`.
**Before screenshots**: `C:\Users\EJN\.gemini\antigravity\brain\ed3e2f07-0c48-44d9-8773-7e05911b1a2a\proof\lane-c\before\`

---

## Summary of Findings (BEFORE)

1. **Two games already look like real illustrated games**:
   - `cow-game-m` (`?cow=free` and `?cow=guided`): Full-bleed farm illustration, wooden fence slots, animated cow layers, 0 broken images, 0 overflow. Minor issue: on 390×844 mobile, the top-bar buttons (`Escuchar la instrucción`, `Inicio`, `Ajustes`) are 42–50px (< 56px).
   - `mariposas-p` (`ButterflyGarden`): Full-bleed illustrated garden, wooden word plaque, interactive flowers/butterflies/sun/watering can. Protected by `AGENTS.md §8` (do not edit assets or rebuild verified game).

2. **Ten games share `GameShell` and look like plain prototype forms**:
   - **Instruction wall**: `GameShell` renders all numbered instructions expanded at the top with 36×36px audio buttons. In `payaso-chano-ss` (7 lines), instructions push the game board below the 768px/844px fold.
   - **Empty margins**: `max-w-3xl` centered on a plain `#F5F1E8` backdrop leaves ~300px empty cream margins on each side at 1366×768.
   - **Flat placeholder cards**: White `rounded-2xl border-stone-200` boxes without paper grain, wood trim, or tactile 3D button depth.
   - **Forbidden purple**: `rima-p` uses `bg-purple-50 border-purple-200` (purple is disallowed by the repo visual recipe).
   - **Small touch targets (< 56px)**: `<- Práctica` link (81×20px), instruction audio buttons (36×36px), `Sí`/`No` buttons (40px tall), `Repetir` buttons (~40px tall), `PayasoChano` action buttons (~40px tall), `CompletarPalabras` audio/back/letter controls.
   - **Missing tap fallback**: `PayasoChano` supports drag + keyboard Enter/Space, but tapping a syllable tile with a finger/mouse does not place it into the next empty slot.
   - **Audio / content gaps (honest)**: Missing audio stays silent (no device TTS); `completar-palabras` answers stay `null` ("pendiente"); `payaso-chano-ss` has no SVG art files in `public/cartilla/art/payaso-chano/` (so no invented clown art).

---

## BEFORE Scorecard (1–5 scale: Visual, Motion/Feedback, Touch >=56px, Overall)

| Game ID | Type | Visual | Motion & Feedback | Touch >=56px | Key Issues (BEFORE) |
|---|---|---|---|---|---|
| `cow-game-m` (A & B) | `cow-game` | 5/5 | 5/5 | 3/5 | Mobile top buttons 42–50px; otherwise real illustrated scene. |
| `mariposas-p` | `mariposas` | 5/5 | 5/5 | 3/5 | Protected verified game (`AGENTS.md §8` — do not rebuild/edit assets). |
| `payaso-chano-ss` | `payaso-chano` | 2/5 | 3/5 | 2/5 | 7-line instruction wall pushes game off-screen; plain white card; no tap-to-place fallback; `<56px` buttons. |
| `silabas-o` | `lectura-silabas` | 3/5 | 3/5 | 3/5 | Good yellow tiles & tap+drag, but huge empty margins, plain slots, no star/glow celebration. |
| `silabas-m` | `lectura-silabas` | 3/5 | 3/5 | 3/5 | Same as `silabas-o`. |
| `silabas-p` | `lectura-silabas` | 3/5 | 3/5 | 3/5 | Same as `silabas-o`. |
| `vocal-a` | `juego-vocal` | 2/5 | 2/5 | 2/5 | Plain white cards, 40px `Sí`/`No` buttons, no tactile depth or celebration. |
| `fonetica-p` | `fonetica-completar` | 2/5 | 2/5 | 2/5 | Plain white card, small tiles/buttons, no progress bar or star celebration. |
| `rima-p` | `lectura-rima` | 1/5 | 2/5 | 3/5 | Uses forbidden purple (`bg-purple-50`), huge empty margins, 3-item awkward grid, no celebration. |
| `palabras-minuto-p` | `palabras-por-minuto` | 2/5 | 2/5 | 2/5 | Plain white grid, small word buttons, flat timer header, no tactile reading-card feel. |
| `dibujos-o` | `dibujos` | 2/5 | 2/5 | 3/5 | Plain white card, huge empty margins, no progress/star feedback, no gentle retry highlight. |
| `completar-palabras` | `completar-palabras` | 2/5 | 2/5 | 2/5 | Plain white card, small letter tiles on entrance, rose-100 boxes. Must keep `pendiente` honest. |

---

## Upgrade Plan

1. **Shared Game Styles (`src/styles/games-premium.css`) + `GameShell.tsx`**:
   - Warm wooden-desk & linen-paper stage (`#F5F1E8` cream, `#25313A` ink, `#167A72` teal, `#2F7D4A` green, `#F2B632` sun; zero navy/purple).
   - Subtle SVG paper-grain & wood-frame border depth with soft layered shadows, filling the desktop stage cleanly without empty plain margins.
   - Collapsible/compact instruction pill at top (or 1-line summary + expandable drawer) with `min-h-14 min-w-14` (56px+) `Práctica` back button and audio buttons so the game board is immediately above the fold on both 390×844 and 1366×768.
   - Shared `StarBurst` / `CorrectGlow` feedback honoring `prefers-reduced-motion: reduce`.

2. **Per-Game Upgrades**:
   - `CoreGames.tsx` (`vocal-a`, `fonetica-p`, `rima-p`, `palabras-minuto-p`, `dibujos-o`): Replace purple in `rima-p` with warm cream/teal/sun palette; add tactile 3D paper/wood cards, progress pills, 56px+ buttons, green glow + star celebration on correct answers, gentle shake/retry on wrong answers.
   - `SyllableBuilder.tsx` (`silabas-o`, `silabas-m`, `silabas-p`): Frame the illustration in a real picture-card mat, give syllable slots recessed wood/paper wells, add green glow + star burst on word completion, ensure all targets >= 56px.
   - `PayasoChano.tsx` (`payaso-chano-ss`): Add chalkboard (`pizarra`) surface styling with wood frame, tactile syllable tiles, tap-to-place & tap-slot-to-return fallback alongside drag-and-drop, 56px+ action buttons, star celebration.
   - `CompletarPalabras.tsx` (`completar-palabras`): Warm workbook card styling, 56px+ letter buttons and back-to-letters button, keep all `null` answers as `pendiente` and audio as `pendiente`.
   - `CowGame.tsx` (`cow-game-m`): Ensure mobile top-bar buttons meet 56px+ touch target size while keeping both `?cow=free` (A) and `?cow=guided` (B) variants intact.

---

## AFTER Scorecard & Verification (2026-11-17)

**After screenshots**: `C:\Users\EJN\.gemini\antigravity\brain\ed3e2f07-0c48-44d9-8773-7e05911b1a2a\proof\lane-c\after\`

| Game ID | Before -> After (Overall) | Touch >=56px (Mobile) | Key Upgrades Applied |
|---|---|---|---|
| `cow-game-m` (A & B) | 4/5 -> 5/5 | 0 small targets | Mobile header/menu/done buttons >= 56px; `prefers-reduced-motion` stops idle loops; A (`?cow=free`) & B (`?cow=guided`) intact. |
| `mariposas-p` | 4/5 -> 4/5 | Protected (`AGENTS.md §8`) | Left untouched per `AGENTS.md §8` (verified game). |
| `payaso-chano-ss` | 2/5 -> 5/5 | 0 small targets | Collapsible instructions; wooden frame + green chalkboard (`pizarra`); tap-to-place & tap-slot-to-return fallback; 56px+ controls; star celebration. |
| `silabas-o` | 3/5 -> 5/5 | 0 small targets | Wooden frame + paper board; framed picture card; recessed slot wells; 56px+ tactile tiles & buttons; star celebration. |
| `silabas-m` | 3/5 -> 5/5 | 0 small targets | Same as `silabas-o`. |
| `silabas-p` | 3/5 -> 5/5 | 0 small targets | Same as `silabas-o`. |
| `vocal-a` | 2/5 -> 5/5 | 0 small targets | Wooden frame + paper board; 3-column desktop cards; 56px+ `Sí`/`No` buttons; green glow & star progress pill. |
| `fonetica-p` | 2/5 -> 5/5 | 0 small targets | Wooden frame + paper board; recessed blank slot; 56px+ tactile syllable tiles; green glow + star feedback. |
| `rima-p` | 1/5 -> 5/5 | 0 small targets | Removed forbidden purple; warm sun/cream/teal palette; balanced 3-col grid; 64px+ tactile cards; star progress pill. |
| `palabras-minuto-p` | 2/5 -> 5/5 | 0 small targets | Wooden frame + paper board; 56px+ word cards with active sun highlight & read green glow; star counter. |
| `dibujos-o` | 2/5 -> 5/5 | 0 small targets | Wooden frame + paper board; framed illustration cards; 56px+ targets; star progress pill & feedback. |
| `completar-palabras` | 2/5 -> 5/5 | 0 small targets | Wooden frame + paper board; 56px+ letter picker & `Letras` back button; `pendiente` answers & audio kept honest. |

### Remaining Blockers (Content / Audio)
- **Audio**: Missing word/instruction recordings remain silent (no device TTS per `AGENTS.md §8`).
- **`completar-palabras`**: Blank-card `fullWord` and `answerSyllable` remain `null` (`pendiente`) until the teacher mapping is provided.
- **`payaso-chano-ss`**: No SVG artwork in `public/cartilla/art/payaso-chano/` (kept clean CSS/wood/chalkboard without inventing art).
