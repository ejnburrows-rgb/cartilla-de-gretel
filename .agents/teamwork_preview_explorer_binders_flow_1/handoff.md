# Handoff Report: Teacher CRM 3D Binders & Student Sequential Flow Analysis

## 1. Observation
From a comprehensive analysis of the project workspace, the following exact paths, configuration files, and build/test outputs were verified:

### A. Teacher CRM Dashboard & Folder Assets
1. **Teacher Hub Page**: Located at `src/routes/cartilla/teacher/index.tsx`. It defines the 2D flat CSS folder shapes for the materials:
   ```typescript
   // Lines 21-52
   const FOLDERS: DriveFolder[] = [
     { title: "Rimas Reproducible Enriquecimiento", color: "bg-[#1e40af]", to: "/cartilla/teacher/recursos/rimas" },
     { title: "Respuestas de las Evaluaciones", color: "bg-[#eab308]", to: "/cartilla/teacher/recursos/respuestas" },
     { title: "Evaluaciones Reproducibles", color: "bg-[#dc2626]", to: "/cartilla/teacher/recursos/evaluaciones" },
     { title: "Blackline Masters tablas silábicas", color: "bg-[#9333ea]", to: "/cartilla/teacher/recursos/blacklines" },
     { title: "Guía del Profesor", color: "bg-[#16a34a]", to: "/cartilla/teacher/recursos/guia" }
   ];
   ```
2. **Teacher CRM Shell**: Located at `src/features/teacher-crm/TeacherCrmShell.tsx`.
3. **Resource Viewer**: Located at `src/routes/cartilla/teacher/recursos/$recursoId.tsx`.
4. **Physical Photographs / Screenshots**: Located at `public/cartilla/images/original/`. These correspond to photos of the physical materials from the book:
   - `homework.jpg` (Rimas / Homework)
   - `evaluations.jpg` (Evaluations)
   - `syllabic-charts.jpg` (Blackline syllabic tables)
   - These are cataloged in `src/data/source-art-inventory.json` (lines 42-76).

### B. Student Lesson Flow & Router
1. **Student Lessons Workspace**: Mapped under the route `/cartilla/student/lecciones` in `src/routes/cartilla/student/lecciones.tsx`.
2. **Lesson Play Router**: Mapped under the route `/cartilla/leccion/$n` in `src/routes/cartilla/leccion.$n.tsx`.
3. **Exercise Pane**: The actual student exercise listing is in `src/components/cartilla/StudentExercisePane.tsx` (lines 126-196), which wraps items in `<OrderedExercises>` from `src/components/cartilla/OrderedExercises.tsx`.

### C. Lesson Master Seed Data
1. **Master Lesson Metadata**: Single source of truth is in `src/content/lesson-meta.ts` (lines 22-47, exporting `LESSONS` with page ranges, kinds, and colors).
2. **Catalog Aggregator**: Combines metadata with vowel/consonant JSON data in `src/lib/lesson-catalog.ts` (exporting `CATALOG`).
3. **CRM Local Seed Data**: Simulates database operations inside `src/lib/seed-data.ts`.

### D. Test & Build Framework Status
1. **TypeScript Typecheck**: Executed `npx pnpm typecheck` (`tsc --noEmit`), which completed successfully with exit code 0.
2. **Vitest Unit Tests**: Executed `npx pnpm test` (`vitest run`), which completed successfully with the following summary:
   ```
   ✓ src/test/setup-helpers.test.ts (10 tests)
   ✓ src/components/gretel/__tests__/gretelMachine.test.ts (6 tests)
   ✓ src/hooks/__tests__/useSpeechRecognition.test.ts (5 tests)
   ✓ src/lib/__tests__/speak.test.ts (3 tests)
   ✓ src/components/gretel/__tests__/lessons-audit.test.ts (170 tests)

   Test Files  5 passed (5)
   Tests       192 passed | 2 expected fail (194)
   ```

---

## 2. Logic Chain

### A. Replacing Folders with Pure CSS 3D-Rendered Binders
1. **Color-Coding Compliance**: The `AGENTS.md` guidelines state:
   - **Blue**: "Rimas Reproducible Enriquecimiento" (y Respuestas de las Evaluaciones)
   - **Red**: "Evaluaciones Reproducibles"
   - **Purple**: "Black line masters, tablas silábicas"
   - *Requirement*: Information must be structured in these distinct folders as sublinks.
   - *Observation*: The current dashboard in `src/routes/cartilla/teacher/index.tsx` has 5 separate folder cards (including a yellow one for "Respuestas" and a green one for "Guía").
   - *Reasoning*: To conform strictly, the yellow "Respuestas" must be merged into the **Blue Binder** alongside "Rimas". The green "Guía" can remain as a separate Green binder on the side, or be integrated. The primary dashboard should display three main 3D binders (Blue, Red, Purple).
2. **CSS 3D Binder Design**: To replace the 2D shapes with realistic 3D binders without using external assets, we can construct them using HTML + CSS 3D transforms:
   - **Container**: Needs `perspective: 1000px;` and relative positioning.
   - **Card Group**: Needs `transform-style: preserve-3d;` and transition animations.
   - **Components**:
     - *Spine*: Rotated by `rotateY(-90deg)` and positioned at the left edge.
     - *Front Cover*: Translated slightly forward in `Z`-axis.
     - *Back Cover*: Translated backward in `Z`-axis.
     - *Pages*: White block layered between front and back covers.
   - **Interactivity**: On hover, the binder tilts (e.g. `transform: rotateY(-20deg) rotateX(10deg) translateZ(10px)`) to reveal the depth of the pages and spine.
3. **Sublinks Overlay**: When the **Blue Binder** is hovered or clicked, it should reveal a dropdown menu or modal showing the sublinks (Rimas vs. Respuestas) instead of redirecting directly.

### B. Enforcing Student Sequential Flow (Learn -> Read -> Play -> Assess)
1. **Current State**: `StudentExercisePane.tsx` lists exercises in whatever order they appear (controlled by `<OrderedExercises>`), and students can scroll down and mark tasks as completed in any sequence.
2. **Proposed Stepper Wizard**:
   - Refactor `StudentExercisePane.tsx` to display only **one stage at a time** using an active step state:
     ```typescript
     type FlowStage = 'learn' | 'read' | 'play' | 'assess';
     const [activeStage, setActiveStage] = useState<FlowStage>('learn');
     ```
   - Lock navigation tabs so the student cannot skip ahead:
     ```typescript
     const isStageUnlocked = (stage: FlowStage): boolean => {
       if (stage === 'learn') return true;
       if (stage === 'read') return learnCompleted;
       if (stage === 'play') return learnCompleted && readCompleted;
       if (stage === 'assess') return learnCompleted && readCompleted && playCompleted;
       return false;
     };
     ```
   - **Mapping current activities to the 4 stages**:
     - **Learn**: Syllable Tap introduction (consonants) or Vowel character introduction + Tracing.
     - **Read**: Reading vocabulary words/sentences aloud (`reading_sentences`).
     - **Play**: Interactive games (`drag_build_word`, drag-and-drop, multiple-choice).
     - **Assess**: A final evaluation check or completion screen.
   - **Transitions**: When an activity within a stage is completed, show a progress animation and unlock a big "Continuar" button that changes `activeStage` to the next step.

---

## 3. Caveats
1. **Guía del Profesor Folder**: The CRM color-coding rule in `AGENTS.md` does not explicitly name a color for "Guía del Profesor". However, this document is vital. The proposal suggests keeping it as a 4th Green binder, or placing it as a dedicated utility button on the top navigation bar to maintain exactly three primary binders for student materials.
2. **Student Session Persistence**: The sequential progression state should be stored in `localStorage` per student session so they don't lose their place if they refresh the browser, but it must reset when a new lesson is started.

---

## 4. Conclusion
We have mapped the locations of all requested components and files. To implement the changes, the next developer should:
1. **Refactor Teacher CRM Dashboard (`src/routes/cartilla/teacher/index.tsx`)**:
   - Consolidate folders list to three main objects (Blue, Red, Purple) plus the Green Guide binder.
   - Embed a CSS 3D binder component (relying on `preserve-3d` and custom CSS variables for coloring).
   - Add a sub-navigation menu under the Blue binder for opening "Rimas" vs "Respuestas".
2. **Refactor Student Flow (`src/components/cartilla/StudentExercisePane.tsx`)**:
   - Replace the vertical listing structure with a horizontal stepper/progress wizard showing: Learn, Read, Play, Assess.
   - Render only the node of the active stage, disabling click-through for subsequent stages unless their pre-requisites are met in `localStorage`.

---

## 5. Verification Method
To verify that these architectural changes are successfully introduced:
1. Run Typescript compiler check:
   ```bash
   npx pnpm typecheck
   ```
2. Run Vite test runner to verify existing code logic is intact:
   ```bash
   npx pnpm test
   ```
3. Check the student dashboard UI manually to verify that next-stage buttons are disabled until the current active stage triggers `markDone()`.
