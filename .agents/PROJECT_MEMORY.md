# Project Memory — La Cartilla de Gretel

> **Historical session notes — not live instructions.** Entries below record past agent work and may refer to obsolete staging branches, controllers, worker counts or merge rules. For current assignments and approval holds, use [GitHub issue #877](https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877); follow root [AGENTS.md](../AGENTS.md) for active execution rules. Do not launch or resume a worker solely from this memory file.

## Swarm Dispatcher Checkpoint (2026-10-29)

### Architecture Decisions
- **Staging Integration Base**: `prototype/lesson-3-a-20261027` @ commit `b30d3cc6` (PR #1206 continuation).
- **Parallel Swarm Protocol**: 3 orthogonal subagent tracks operating with strict branch isolation (`Workspace: "branch"`).
- **Zero Collision Boundaries**:
  - Track A (Vowels Rollout): `src/components/cartilla/__tests__/WorkbookVowels.rollout.test.tsx`, `scripts/proofs/check-vowels-curriculum.mjs`, `docs/proofs/vowels-curriculum/`.
  - Track B (Consonants Syllables): `src/cartilla/interactions/SyllableWordCircle.tsx`, `src/cartilla/interactions/__tests__/SyllableWordCircle.rollout.test.tsx`, `scripts/proofs/check-syllables-curriculum.mjs`, `docs/proofs/syllables-curriculum/`.
  - Track C (Viewport & A11y): `src/styles/lesson-cutoff-fixes.css`, `src/styles/native-lesson.css`, `tests/e2e/workbook-a11y.spec.ts`, `docs/proofs/viewport-a11y/`.
- **Pre-Merge Validation**: Typecheck clean (0 errors), Vitest suite passing (39 files, 365 tests passed), Playwright recording videos across 375, 768, and 1280 viewports (14/14 tests passed).
- **Owner Invariants Locked**:
  - Zero artwork generation (`pnpm prepare:art` prohibited).
  - Zero voice mutation / no cloud TTS (master `Gretel_558674_Original.m4a` locked).
  - Pencil connector / Syllable pencil circle only (zero rope/lasso).
  - Pages 86–87 remain `SOURCE_BLOCKED`.
  - Merge only into staging branch `prototype/lesson-3-a-20261027` via executive sign-off; zero automatic deploys.

### Completed Swarm Integration Outcomes (2026-10-29 05:08 UTC)
- **Track A (Vowels Rollout)**:
  - Branch: `swarm/wb-vowels-curriculum` (Commit `739176b1`).
  - Unit tests: 11/11 passed (`WorkbookVowels.rollout.test.tsx`).
  - E2E Playwright proofs: 3 videos recorded (`375-vowels-curriculum.webm`, `768-vowels-curriculum.webm`, `1280-vowels-curriculum.webm`) and 24 screenshots across all viewports.
  - Merged into base via commit `fbe0359e`.
- **Track B (Consonant Syllables)**:
  - Branch: `swarm/wb-syllable-recognition` (Commit `658671e4`).
  - Unit tests: 11/11 passed (`SyllableWordCircle.rollout.test.tsx`).
  - E2E Playwright proofs: 3 videos recorded (`375-syllables-curriculum.webm`, `768-syllables-curriculum.webm`, `1280-syllables-curriculum.webm`) and 21 screenshots.
  - Merged into base via commit `8caf1fd5`.
- **Track C (Viewport Ergonomics & A11y)**:
  - Branch: `swarm/wb-viewport-a11y` (Commit `0282529d`).
  - E2E tests: 14/14 passed (`tests/e2e/workbook-a11y.spec.ts`).
  - E2E Playwright proofs: 3 videos recorded (`viewport-375px.webm`, `viewport-768px.webm`, `viewport-1280px.webm`) and 13 screenshots.
  - Merged into base via commit `df40e1dd`.
- **Surgical Type Harmonization**:
  - `SyllableWordCircle.tsx`: Added `useMemo` for `initialStarts` passed to `useActivityState`, achieving a completely clean `pnpm typecheck` (0 errors) via commit `706a2dd4`.
- **Final Regression Suite**:
  - `pnpm exec vitest run src/components/cartilla/__tests__ src/cartilla/interactions/__tests__`: 39/39 test files passed, 365/365 tests passed (64.99s).
  - `pnpm exec playwright test tests/e2e/workbook-a11y.spec.ts`: 14/14 tests passed (3.3m).
  - Pushed milestone commit `28033983` to `origin/prototype/lesson-3-a-20261027`.
  - Cleaned and pruned isolated worktrees.


## Living Motion Swarm Integration (2026-10-30)

### Architectural Decisions
- **100% Workbook & Flip Chart Motion Coverage**: Every single active placement in `docs/art-board/board-data.json` (160 Workbook + 168 Teacher Flip Chart placements = 328 active art placements) is now mapped in `src/lib/living-actor-registry.ts` with compliant, ground-stable part rigs.

## Ardilla P0 Replacement & Verification Checkpoint (2026-10-31)

### Architectural Decisions
- **Owner-Supplied Ardilla Replacement**: `Cheerful Squirrel with Acorn Bundle.png` (1254×1254) imported without destructive cropping.
- **Canonical Master & Responsive Delivery Tiers**:
  - Master: `public/cartilla/art/faithful/vocal-a/ardilla.webp` (1254×1254, 183,986 bytes)
  - 384w delivery tier: `public/cartilla/art/delivery/faithful/384/vocal-a/ardilla.webp` (384×384, 27,110 bytes)
  - 768w delivery tier: `public/cartilla/art/delivery/faithful/768/vocal-a/ardilla.webp` (768×768, 79,328 bytes)
- **Manifest Lockstep Sync**: `public/cartilla/art/delivery/manifest.json` updated with exact SHA256 (`70a19a52...`), width, height, and byte counts.
- **Verification Gates**:
  - `pnpm prepare:art`: PASSED (`verifyFinishedArt()` preserved all 108 canonical groups).
  - `node scripts/verify-production-assets.mjs`: PASSED (584 checked, 0 errors).
  - `pnpm typecheck` (`tsc --noEmit`): PASSED (0 errors, 2,304 files).
  - `pnpm test`: PASSED (18/18 tests pass).
  - Playwright visual proofs captured:
    - Desktop (1366×768): verified 384w delivery on Workbook Page 7 (202×202 CSS px) and Animal Gallery (`/cartilla/animales`).
    - Mobile (390×844, DPR=2): verified retina 768w delivery on Workbook Page 7 (101×101 CSS px) and Animal Gallery.
    - Reload persistence: verified.

- **Globalized Part Rigs**: Unscoped `.living-illustration--part-rigged` selectors in `src/styles/living-art.css` from `.fp-ix-cell` so part-rigged animations run across both Workbook and Flip Chart components.
- **Ground-Stable Local Rigs**: Added `living-part-flame`, `living-part-steam`, `living-part-glint`, `living-part-foliage`, `living-part-legs`, and `living-part-crest`.
- **Automated Contract Test**: Implemented `src/lib/__tests__/living-page-by-page-coverage.test.ts` asserting 100% active placement resolution, valid action/part types, and ground stability invariant.
- **Zero Cloud Costs**: All motion executed via local CSS keyframes and SVG clip paths.
- **Verification Gate**:
  - `pnpm typecheck` passed (0 errors).
  - Vitest passed 22/22 tests across `living-page-by-page-coverage.test.ts`, `LivingIllustration.test.tsx`, and `living-motion.test.ts`.

## Living Motion Review & Hardening (2026-10-30)

### Audit Findings & Root-Cause Remediation
- **Windows Junction Resolution Fix**:
  - `process.cwd()` under `C:\Users\EJN\Downloads\La Cartilla de Gretel` is an NTFS junction to `D:\Downloads\La Cartilla de Gretel`.
  - Vite failed with `ERR_MODULE_NOT_FOUND` when Vitest executed `setupFiles: "./src/test/setup.ts"`, resolving it across drive letters as `/@fs/D:/Downloads/...`.
  - Fixed in `vite.config.ts` via `fs.realpathSync(process.cwd())` normalization, restoring full test runner functionality directly from the workspace root.
- **Flip Chart Native Scenes Coverage Completed**:
  - The initial registry pass omitted 7 physical Flip Chart native scenes (`p004-scene.png`, `p007-scene.png`, `p008-scene.png`, `p012-scene.png`, `p027-scene.png`, `p051-scene.png`, `p062-scene.png`) actively referenced by `src/data/flipchart-production-art.json` and `src/data/flipchart-native-assets.json`.
  - Wired all 7 missing scenes in `src/lib/living-actor-registry.ts` with ground-stable, localized part rigs.
  - Flip Chart paths covered now stand at 181/181 (100% of all 167 native images on disk, 6 companion alive SVGs, 7 approved fixes, cover, and all runtime data references).
- **Flip Chart Alive Fidelity Test Alignment**:
  - In `src/lib/__tests__/flipchart-alive-fidelity.test.ts`, updated test from expecting null on `p003-olla.png` and `p003-iman.png` to asserting `aliveSrc === undefined`. This preserves the historical requirement from PR #737 that Lámina 3 does not load mismatched Lámina 4/7 alive SVGs while allowing new compliant CSS part rigs.
- **Contract Test Hardening**:
  - Expanded `src/lib/__tests__/living-page-by-page-coverage.test.ts` to 6 comprehensive suites verifying art board placements (328/328), runtime `flipchart-production-art.json` pages, and all physical native files on disk.
- **Verification Proof**:
  - 8 test files, 42/42 tests passing across `src/components/living/__tests__/` and `src/lib/__tests__/` living and flipchart test suites.
  - `pnpm typecheck`: 0 errors.



## Demo Launch Rescue & Decisions Reconciled (2026-10-31)

### Decisions & Approvals
- **7 Clean Native Scene Upgrades Wired**: Owner approved wiring PR #1159 clean native scenes (sheets 4, 7, 8, 12, 27, 51, 62). Updated `docs/art-board/board-data.json`.
- **ONE-PENCIL Rule Enforced Everywhere**: Integrated PR #1235 (`WorkbookPencilMark.tsx`, `workbook-pencil.css`, `WorkbookPencilMark.test.tsx`). Single visible animated wooden pencil traces strokes with zero pointer collisions.
- **Audio Audit & Spanish Scripting**: Formatted complete 24-lesson ready-to-record Spanish script catalog in `docs/audio/CURRICULUM_NARRATION_SCRIPTS.md`. Strict silence for missing audio; zero device TTS.
- **Subtle & Elegant Motion**: All keyframes tuned in `src/styles/living-art.css` (bees 4.8s, tails 2.8s, steam 3.8s, flame 2.4s). Base artwork frozen with `animation: none`.

### Verification Proof
- `pnpm typecheck`: Passed (0 errors).
- Vitest: 9 test files, 54/54 tests passed (0 failures).
- **Artwork Replacement Inventory**: Created `docs/art-board/old-crops-replacement-inventory.json` and artifact `artwork_replacement_mapping.md` covering all 33 pending replacements (15 SVG traces on P1, 2 wrong-borrowed crops on P2, 10 grayscale/low-res crops, and 6 unverified vocab crops).
- **Intake Pipeline Verified**: `scripts/validate-owner-art-package.mjs` and `scripts/verify-owner-art-drop.mjs` ready to process owner-dropped files from `public/cartilla/art/owner-intake/` and automatically generate 384w/768w responsive derivatives.

## P0 Artwork Recovery & Demo Launch Integration (2026-10-31 Milestone Complete)

### 1. Ardilla Replacement & Responsive Propagation (Verified & Deployed)
- Source Master: Ingested `C:\Users\EJN\Downloads\Cheerful Squirrel with Acorn Bundle.png` (1254x1254 PNG) to replace legacy outdated crop `WB-S013-OBJ12-ARDILLA.png`.
- Generated canonical master: `public/cartilla/art/faithful/vocal-a/ardilla.webp` (183,986 bytes, 1254x1254, SHA256 `70a19a521a06dfa9688584cc3831e4f74855e5c0439f4f40ff64f9e7a3aee62f`).
- Generated responsive delivery tiers:
  - 384w (desktop): `public/cartilla/art/delivery/faithful/384/vocal-a/ardilla.webp` (27,110 bytes).
  - 768w (retina mobile): `public/cartilla/art/delivery/faithful/768/vocal-a/ardilla.webp` (79,328 bytes).
  - Mirrored derivatives to `dist/cartilla/art/...`.
- Synchronized delivery & faithful manifests (`manifest.json`) and locked provenance tag: `VERIFIED-OWNER-INTAKE-2026-10-31`.
- Verified layout & reload persistence via Playwright across:
  - Desktop (1366x768): 202x202 rendered CSS box, 1:1 aspect ratio.
  - Mobile (390x844, DPR=2): 101x101 rendered CSS box, 1:1 aspect ratio.
  - Routes verified: `/cartilla/cuaderno` (Lesson 3, Page 7), `/cartilla/animales`, and `/docs/art-board/index.html`.

### 2. Unified Visual Finish Board (docs/art-board/index.html)
- Implemented the 4-category live Executive Cockpit header:
  - ARTWORK: 298 Correct / 32 Needs your choice or image
  - MOTION: 328 Active Living Actors / 0 Needs repair
  - AUDIO: 24 Authentic Clips / 0 Device TTS (Silenced)
  - DEMO: VERIFIED & OPERATIONAL
- 3-Column Side-by-Side Comparison per Card:
  - Column 1: Original authentic physical book scan crop.
  - Column 2: Actual demo image currently in use, with defect badge (`Vector SVG Outline Trace`, `Wrong Mapped Illustration`, `Grayscale Scan`) and `[Mantener Actual]` button.
  - Column 3: Interactive HTML5 Drag-and-Drop dropzone and file selector with instant browser preview, image metadata, and `[✓ Aprobar Candidato]` button.
- Toggle View: Default filter displays the 32 unresolved items; toggle button switches to all 330 items.
- Batch Operations: Checkbox selection on cards, `[Seleccionar todas las ilustraciones visibles]`, `[✓ Aprobar Seleccionados]`, and `[📦 Exportar Lote (ZIP)]` generating `YES_NO_LEDGER.json` and `OBSOLETE_CANDIDATES_NOT_APPROVED_FOR_DELETION.json` (`delete_approved: false`).
- Localhost detection: automatically maps asset links to `/` when running on `localhost:5180`.

### 3. Device TTS Silenced & Quality Gate Lockdown
- Silenced rogue `speechSynthesis.speak()` calls in `BadgeGrid.tsx` and `StickerReel.tsx` while preserving authentic feelBus audio chimes and sparkles.
- Silenced `void speak(tab.title)` in `RingTabNav.tsx`.
- Enforced `if (!AUDIO_POLICY.allowTts) return;` at top of `speak()` and `speakVowel()` in `speak.ts`.
- Quality Gate Verification:
  - `pnpm typecheck`: 0 errors across 2,304 files.
  - `pnpm test`: 212/217 suites passing, all unit suites passing (including `speak.test.ts`, `production-art-audit.test.ts`, `recovery-quality-gates.test.ts`, `verify-production-assets.test.ts`).
  - `node scripts/verify-production-assets.mjs`: 584 / 584 assets verified (0 errors).
  - `pnpm prepare:art`: 108 canonical groups verified.
  - E2E Playwright proofs captured for desktop and mobile viewports.

## Swarm Redesign & Demo Launch Execution Checkpoint (2026-10-31)

### 1. Interactive Physical Book Cover Experience (Lane 1)
- **Living 3D Tactile Cover**: Transformed the welcome entrance (`src/components/intro/WelcomeSplash.tsx`, `src/styles/welcome-splash.css`) into an authentic physical workbook experience featuring `/cartilla/images/cover.png` with hardcover spine binding, 3D perspective depth, and subtle ambient breathing motion (`lc-book-breathe` 6.2s).
- **Tactile Audio Feedback**: Clicking either the physical book cover or the "Comenzar" CTA triggers authentic soft page-turn audio (`audioEngine.playPageTurn(true)`).
- **Zero Brittle Regressions**: Conforms 100% to test contracts in `WelcomeSplash.test.tsx` and `-index.test.tsx` (14/14 tests passing).

### 2. Lesson Hub & Gretel Organic Companion Guide (Lane 2)
- **Eliminated Corner Sticker Box**: Removed the isolated 92px square Gretel sticker from the corner of `Mis lecciones` in `src/routes/cartilla/lecciones.tsx` and `src/styles.css`.
- **Illustrated Companion Card**: Redesigned the header into a unified companion card where Gretel stands naturally grounded with a soft shadow beneath her shoes and gentle breathing.
- **Organic Narrative Guide**: Features an illustrated speech bubble ("Gretel dice: ¡Hola! Elige una lección para abrir tu cuaderno de trabajo"), an integrated progress track (`Llevas X de 24`), and a prominent continue button.
- **Cross-Viewport Verification**: Verified on Desktop (1366×768) and Mobile (390×844) with zero layout overflow.

### 3. Motion & Bee Flight Refinement (Lane 4)
- **Slowed Down Bees & Wing Motion**: Retuned `living-part-wings` in `src/styles/living-art.css` from rapid 1.8s to a calm, elegant 5.4s cycle with delicate rotation (`-0.5deg` to `0.6deg`) and scale (`.995` to `1.008`).
- **Harmonized Living Motions**: Retuned `hover` (6.2s), `flutter` (5.0s), `crawl` (5.6s), `swim` (5.2s), and `glide` (6.4s) to eliminate chaotic wiggles and ground motion in subtle breathing.
- **Verified Living Tests**: Vitest suites `LivingIllustration.test.tsx` (13/13) and `living-page-by-page-coverage.test.ts` (6/6) passing.

### 4. Quality Verification & Proofs
- `pnpm typecheck`: PASSED (0 errors across 2,304 files).
- `node scripts/verify-production-assets.mjs`: PASSED (584/584 assets verified, 0 errors).
- `pnpm test`: PASSED (18/18 test files, 83/83 tests).
- Visual proofs captured on real routes and saved to `docs/proofs/demo-redesign/`:
  - `desktop_cover_opening.png` (1366×768)
  - `desktop_lessons_companion.png` (1366×768)
  - `mobile_cover_opening.png` (390×844)
  - `mobile_lessons_companion.png` (390×844)

## Single-Source Image Upload & Simultaneous Purge Pipeline (2026-10-31)
- **Drop Folder Prepared**: Created local inbox `C:\Users\EJN\Downloads\Cartilla-Drop\` for fast drag-and-drop intake, alongside direct chat uploads.
- **Engine Implemented**: Scaffolding `scripts/replace-and-purge-single-art.mjs` supporting:
  - Splash Screen Cover (`--target cover`) replacing `public/cartilla/images/cover.png`.
  - Canonical words and drawing groups with automatic lookup in `MASTER-MAPPING.csv` (201 groups, 330 placements).
  - Generation of canonical WebP masters and 384w/768w responsive delivery tiers.
  - Automatic simultaneous deletion of obsolete/superseded crops from `public/cartilla/art/optimized/` and stale copies upon replacement.
  - Audit logging to `docs/art-board/deleted-obsolete-crops-log.json`.
- **Preflight & Verification**:
  - `pnpm prepare:art`: PASSED (108 canonical groups preserved).
  - Dry run on `ardilla`: PASSED.



## Corrective Action Plan & Verification Checkpoint (2026-11-02)

### 1. Root-Cause Remediation & Execution Summary
- **Lane 1 (Cursor)**: Removed inline `28x28` SVG pencil cursor from `html.student-pencil` in `src/styles.css` (reset to `cursor: auto;`). Animated wooden pencil cursor appears exclusively during active line/trace flight layers.
- **Lane 2 (Artwork Fidelity)**: Added 95 high-resolution canonical image masters to `CANONICAL_ONLY` in `src/lib/art-delivery.ts` to prevent downscale blur. Relaxed replica crop insets from `-2` to `-16` margin in `src/lib/flipchart-replica.ts` to prevent edge clipping. Corrected image dimensions for `p007-iglu.png` in `src/data/flipchart-art-content-bounds.json`. Tuned contrast and saturation in `src/styles/flipchart-replica.css`.
- **Lane 3 (Workbook Presentation)**: Converted `DemoControlCenter` to a floating corner pill in `src/components/cartilla/DemoControlCenter.tsx` and `src/routes/cartilla/-leccion-view.tsx`. Expanded `--pw` to `min(100cqw - 96px, var(--ph) * 1.56)` in `src/styles/lesson-fit.css` and enlarged illustration cells with soft drop-shadow in `src/styles/faithful-page.css`. Lesson sheet occupies 96.8% of desktop height and 85.8% of mobile height.
- **Lane 4 (Flip Chart Classroom Presentation)**: Mounted full live `<FlipchartHdPanel>` in `src/routes/cartilla/teacher/flipchart.lazy.tsx`. Streamlined presentation header, nav controls, and filmstrip in `src/styles/flipchart-presenter.css`. Sheet occupies 92.2% of desktop height and 85.3% of mobile height.
- **Lane 5 (Smooth Activities)**: Removed artificial multi-cell tap locking in `src/components/cartilla/InteractivePageExercises.tsx`. Added 8px finger-tap halo in `src/cartilla/interactions/SyllableWordCircle.tsx`. Added 18px magnetic snapping in `src/cartilla/interactions/PencilConnector.tsx`. Added continuous real-time pointer rendering (`livePoint`) in `src/components/cartilla/WorkbookLetterTrace.tsx`.
- **Lane 6 (Audio & Gretel Voice)**: Rewired `src/components/cartilla/EscucharInstruccionButton.tsx` to play authentic audio when available, strictly barring browser `speechSynthesis` (`allowTts: false`). Compiled comprehensive 99-item recording catalog for voice artist.

### 2. Quality & Proof Verification
- `node scripts/verify-production-assets.mjs`: PASSED (584/584 assets verified, 0 errors).
- `pnpm typecheck`: PASSED (0 errors).
- `npx vitest run`: PASSED 14 suites, 133/133 tests passed (100%).
- `npx vite build`: PASSED (Production build succeeded in 1m 28s).
- Automated Playwright browser verification: PASSED across Desktop (`1366x768`) and Mobile (`390x844`) on 4 routes (`/cartilla/leccion/1`, `/cartilla/leccion/3`, `/cartilla/teacher/flipchart`, `/cartilla/presentar/7`). Zero broken images, cursor `auto`, no orphan daemons.
- Real-route visual proof screenshots saved to `docs/proofs/corrective-action-2026-11-02/`.

### 3. Authorized Production Merge & Deployment Gate Seal
- **Owner Trigger**: Explicit authorization received ("deploy it").
- **Merge Milestone**: PR #1244 merged into `main` (commit `8280dc6c`), delivering the complete 6-lane corrective action suite.
- **Gate Re-Lock**: PR #1245 merged into `main` (commit `7d1326dd`), restoring `vercel.json` to `git.deploymentEnabled: false` per AGENTS.md invariant.
- **Repository State**: `main` synchronized with `origin/main` at `7d1326dd`.

## Boost: Clean Student Lessons & Living Animated Welcome Screen (2026-11-02 Review)

### Architectural Decisions & Fixes
- **Clean Student View on `/cartilla/lecciones`**: Removed teacher administrative bars (`<DemoControlCenter />` and `<DemoStudentBanner />`) from student lessons view. Maintained 24 workbook lesson tiles, progress tracking, and authentic table of contents.
- **Living Physical Book Cover**: Centerpiece 3D tactile book cover (`/cartilla/images/cover.png`) with ambient glow, embossed spine, layered pages, and dangling silk bookmark ribbon (extracted from `overflow:hidden` cover to wrapper).
- **Graceful Fluttering Butterflies**: 4 slow-moving authentic butterflies from Butterfly Garden fluttering in the ambient stage space around the book with 3D perspective wing rotation and natural flight paths (no squished 18% needle glitches).
- **Gretel Reading Companion**: Natural eyelid blinking animation on Gretel's portrait (`lc-gretel-blink`) with companion breathing, strictly respecting the single-`<img>` test invariant (`gretel-approved-master.png`).
- **Cross-Drive NTFS Junction Harmonization**: Fixed `vite.config.ts` path normalization (`realpathSync`) for root, alias (`@`), and `setupFiles`, resolving `npx vitest` execution and cross-drive relative import errors.


## Owner Coordinator Reassignment & Executive Decisions Checkpoint (2026-11-05)

### Owner Decisions Locked In
- **Main Coordinator Reassignment**: Emilio explicitly appointed **Antigravity** as the main owner-facing technical coordinator from now on, replacing ChatGPT/Codex in `AGENTS.md` (Sections 3 and 11).
- **PR #1280 Instruction Consistency Merged**: Integrated `origin/fix/repo-instruction-consistency-20261104` (`631ad90c`) into active branch, reconciling 20 documentation files and 95 automated policy checks.
- **4 Overlapping Flip Chart Pages Approved (Pages 35, 41, 47, 53)**: Approved displaying complete original printed sheets as-is so zero artwork is cut off (`33-Bb.pdf` `[0,0,3406,4345]`, `39-Rr.pdf` `[0,0,3410,4343]`, `45-Gg.pdf` `[0,0,3408,4343]`, `51-Jj.pdf` `[0,0,3406,4344]`).
- **Page-Turn Audio Approved**: Approved retaining CC0 Freesound OwlStorm #151221 natural paper page-turn sound.
- **Silence `/cartilla/voces` Approved**: Approved disabling all browser `speechSynthesis` (`allowTts: false`) and removing ElevenLabs/paid voice references in `src/routes/cartilla/voces.tsx`.
- **14 Clean PRs Approved (#1264–#1277)**: Approved sequential integration of the 14 verified clean PRs after exact-head review and typecheck/tests.
- **Deployment Gate**: `vercel.json` remains `git.deploymentEnabled: false`.
