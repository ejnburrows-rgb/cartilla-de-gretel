# Project Handoff Notes — La Cartilla de Gretel

> Full architectural ledger: [`.agents/PROJECT_MEMORY.md`](./.agents/PROJECT_MEMORY.md)  
> Controlling rules: [`AGENTS.md`](./AGENTS.md)  
> Master task queue: GitHub Issue #877  
> Main Coordinator: **Antigravity** (Owner-appointed 2026-11-05)  
> Working Directory: `C:\Users\EJN\Downloads\La Cartilla de Gretel`

---

## 2026-11-05 — Main Coordinator Reassignment & Executive Decisions Locked In

**Done:**
- **Antigravity Appointed Main Coordinator**: Updated [`AGENTS.md`](./AGENTS.md) (Sections 3 and 11), [`.agents/PROJECT_MEMORY.md`](./.agents/PROJECT_MEMORY.md), and orchestration plan to establish Antigravity as the primary owner-facing coordinator per Emilio's explicit instruction.
- **PR #1280 Integrated into Active Branch**: Merged `origin/fix/repo-instruction-consistency-20261104` (`631ad90c`), reconciling 20 repository instruction files and 95 policy regression tests.
- **Live Built Preview Running**: Production preview server active on `http://127.0.0.1:3000/` (`HTTP 200`).

**Decided (Owner Approvals 2026-11-05):**
- **Antigravity** is the main coordinator from now on.
- **Flip Chart Pages 35, 41, 47, 53**: Display the complete original printed page as-is so zero artwork is cut off.
- **Page-Turn Sound**: Enable the soft natural paper page-turn sound (Freesound OwlStorm #151221).
- **Voice Audition Route (`/cartilla/voces`)**: Silence all robotic device voices (`allowTts: false`) and remove mentions of paid voice tools so only authentic Gretel recordings play.
- **Clean PR Queue**: Proceed with integrating #1280 and the 14 clean speed/test updates (#1264–#1277) while finalizing the Flip Chart art.

**Next step:**
- Wire the 4 full-sheet Flip Chart pages (35, 41, 47, 53) and silence `/cartilla/voces`, then verify with `pnpm typecheck` and affected tests.

---

## 2026-10-31 — Swarm Redesign & Demo Launch Execution

**Done:**
- **P0 Ardilla Replacement**: Ingested owner's `Cheerful Squirrel with Acorn Bundle.png` (1254x1254), generated canonical master (`public/cartilla/art/faithful/vocal-a/ardilla.webp`) and responsive delivery tiers (`384w` and `768w`), locked provenance in delivery manifests (`VERIFIED-OWNER-INTAKE-2026-10-31`), and verified layout & reload persistence via Playwright across Desktop (1366x768) and Mobile (390x844).
- **Physical Book Cover Opening Experience (Lane 1)**: Transformed the welcome entrance (`src/components/intro/WelcomeSplash.tsx`, `src/styles/welcome-splash.css`) into an authentic physical workbook experience featuring `/cartilla/images/cover.png` with hardcover spine binding, 3D perspective depth, and subtle ambient breathing motion (`lc-book-breathe` 6.2s). Clicking the book or CTA triggers authentic soft page-turn audio (`audioEngine.playPageTurn(true)`). 100% compliant with existing test suites.
- **Lesson Hub & Gretel Companion Redesign (Lane 2)**: Completely removed the isolated 92px square Gretel sticker from the corner of `Mis lecciones` in `src/routes/cartilla/lecciones.tsx` and `src/styles.css`. Implemented a warm, illustrated companion card where Gretel stands grounded with soft shadow and gentle breathing, speaking through an organic speech bubble ("¡Hola! Elige una lección para abrir tu cuaderno de trabajo"), accompanied by a clean progress bar and prominent continue CTA.
- **Slow Down Bees & Motion Refinement (Lane 4)**: Retuned `living-part-wings` in `src/styles/living-art.css` from rapid 1.8s to a calm, elegant 5.4s cycle with delicate rotation and scale. Slowed down hover (6.2s), flutter (5.0s), and crawl (5.6s) to eliminate all jittery wiggles.
- **Device TTS Silenced & Quality Gate Lockdown (Lane 5)**: Permanently silenced rogue `speechSynthesis.speak()` calls in `BadgeGrid.tsx`, `StickerReel.tsx`, `RingTabNav.tsx`, and `speak.ts`. All vocabulary audio remains routed through the 162 authentic voice recordings in `public/audio/voz/vocabulario/*.mp3`.
- **Quality Gates & Proofs**:
  - `pnpm typecheck`: 0 errors across 2,304 files.
  - `node scripts/verify-production-assets.mjs`: 584 / 584 assets verified (0 errors).
  - `pnpm test`: 18/18 test suites passing (83/83 tests).
  - Visual proofs captured on real routes and saved to `docs/proofs/demo-redesign/`:
    - `desktop_cover_opening.png` (1366x768)
    - `desktop_lessons_companion.png` (1366x768)
    - `mobile_cover_opening.png` (390x844)
    - `mobile_lessons_companion.png` (390x844)

**Decided:**
- The opening experience now begins with the physical 3D book cover with tactile page-turn audio feedback.
- Gretel is permanently integrated as a grounded narrator and guide across the lesson roadmap rather than a floating sticker.
- Rapid 1.8s insect wing animations are eliminated in favor of calm, breathing cycles (5.4s+).
- Synthetic device TTS remains permanently disabled.

**Next step:**
- Present the verified before/after visual evidence, test results, and status to the owner for final review and sign-off.


## [2026-11-06 11:03] Realistic Motion Overhaul & Physical Book Proofs Cockpit (Swarm Complete)
- **Eliminated Cheap Motion**: Permanently deleted 14 whole-image CSS wobble keyframes (living-creature-micro, living-breathe, living-crawl, living-sway, etc.) and living-workbook floats (lwp-float, lwp-bob, lwp-breathe, lwp-blink).
- **Realistic Eye Blinking**: Characters with eyes blink naturally (120ms eye-frame swap every 3.5-6s) while the body stays completely still on the paper. Inanimate objects are 100% static.
- **Physical Book Red-Circle Cockpit**: Batch-generated 750 high-resolution physical page screenshots and zoom details across all 201 drawing groups / 330 placements.
- **2-Column Review Interface**: Left panel displays the full physical Workbook/Flipbook page with the asset circled in crimson red (#dc2626) plus high-res zoom and candidate side-by-side; right panel houses dedicated action controls (Aprobar, Rechazar, Reemplazar, Omitir, Deshacer).
- **Verification**: 21/21 living motion tests passed, 3/3 server tests passed, pnpm typecheck passed with 0 errors, verify-production-assets 588/588 passed.
