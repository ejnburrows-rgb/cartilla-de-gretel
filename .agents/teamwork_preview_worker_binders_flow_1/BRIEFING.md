# BRIEFING — 2026-06-19T01:01:00-04:00

## Mission
Coordinate and implement Premium 3D Digital Binders (Teacher CRM), Sequential Guided Path (Student Lesson Flow), and Native Zero-Lag Data Architecture.

## 🔒 My Identity
- Archetype: teamwork_preview_worker
- Roles: implementer, qa, specialist
- Working directory: c:\Users\EJN\Desktop\La Cartilla\cartilla-de-gretel\.agents\teamwork_preview_worker_binders_flow_1
- Original parent: a434263f-3037-4aed-b6db-02df3d08835e
- Milestone: Binders, Guided Flow, and Zero-Lag Data Architecture

## 🔒 Key Constraints
- CODE_ONLY network mode
- Never commit PNGs or PDFs to git
- Never change lesson-meta.ts letter assignments or page ranges
- Never replace original book illustrations with AI-generated art
- Never hardcode Supabase keys
- Never add English text to student-facing UI
- Never alter the book's original Spanish reading content
- Follow strict commit formats and UI/UX guidelines
- No emojis inside CRM, ultra-professional style

## Current Parent
- Conversation ID: a434263f-3037-4aed-b6db-02df3d08835e
- Updated: 2026-06-19T01:01:00-04:00

## Task Summary
- **What to build**:
  1. Premium 3D Digital Binders (Teacher UI) in `src/routes/cartilla/teacher/index.tsx`.
  2. Sequential Guided Path (Student Lesson Flow) in `src/routes/cartilla/leccion.$n.tsx` using localStorage.
  3. Native Zero-Lag Data Architecture in `src/lib/student.functions.ts`, `src/components/cartilla/Ejercicios.tsx`, and `src/routes/cartilla/student/lecciones.tsx`.
- **Success criteria**:
  - Fully color-coded 3D binders matching specified colors.
  - Interactive sublink behavior for the Blue binder.
  - Sequential steps 1 to 4 with tab locks and state in localStorage.
  - DEMO/seed intercepts for data operations to bypass Supabase queries.
  - All tests and type checks pass.

## Key Decisions Made
- Intercepted student database queries before the Zod UUID validation step to support non-UUID local demo student/class IDs.
- Structured Step 3 (mini-games) to display one active game at a time using sub-tabs, with clean back/next navigation and a final button to unlock the assessment stage.
- Implemented realistic 3D perspective CSS styling with metal accents and textures for the teacher CRM binders, avoiding plain backgrounds.

## Change Tracker
- **Files modified**:
  - `src/routes/cartilla/teacher/index.tsx` — 3D Premium Binders UI replacing folder grids, Blue binder dropdown
  - `src/routes/cartilla/leccion.$n.tsx` — Strict 4-step guided progression with localStorage step state preservation
  - `src/lib/student.functions.ts` — Local storage intercept for DEMO/seed sessions
  - `src/components/cartilla/Ejercicios.tsx` — Active seed teacher session check in TeacherAnswerKey to bypass Supabase queries
  - `src/routes/cartilla/student/lecciones.tsx` — Client-side fetchMyProgress intercept for local seed student progress hydration
  - `src/lib/__tests__/student.functions.test.ts` — Unit tests for intercept/local-storage student functions
- **Build status**: Pass (pnpm typecheck runs cleanly)
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pass (all 195 Vitest tests pass successfully)
- **Lint status**: 0 outstanding violations
- **Tests added/modified**: `src/lib/__tests__/student.functions.test.ts` (added 3 intercept tests)

## Loaded Skills
- None loaded.

## Artifact Index
- `c:\Users\EJN\Desktop\La Cartilla\cartilla-de-gretel\.agents\teamwork_preview_worker_binders_flow_1\ORIGINAL_REQUEST.md` — Original request details.
