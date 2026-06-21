## 2026-06-19T04:54:30Z
You are teamwork_preview_worker. Your working directory is c:\Users\EJN\Desktop\La Cartilla\cartilla-de-gretel\.agents\teamwork_preview_worker_binders_flow_1.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your objective is to coordinate and implement:
1. Premium 3D Digital Binders (Teacher UI):
   - In src/routes/cartilla/teacher/index.tsx, replace the flat folders grid with highly realistic, 3D-rendered digital binders.
   - They must be strictly color-coded:
     - Blue: "Rimas Reproducible Enriquecimiento" and "Respuestas de las Evaluaciones". Since both are Blue, the Blue binder should show sublinks (or a dropdown/modal overlay) when hovered/clicked, letting the teacher select which sublink to open.
     - Red: "Evaluaciones Reproducibles".
     - Purple: "Black line masters, tablas silábicas".
     - Green: "Guía del Profesor" (can remain as a green binder, styled as a premium 3D binder).
   - Use advanced CSS (perspective: 1000px, 3D transforms, linear-gradients, radial-gradients, box-shadows, rotateY, etc.) to give them depth, spine, front/back cover, and pages layers. Make them tilt/animate elegantly on hover.
   - Ensure there are no plain white backgrounds ("white, dead cutters"). No emojis inside CRM. Keep it ultra-professional.

2. Sequential Guided Path (Student Lesson Flow):
   - In src/routes/cartilla/leccion.$n.tsx, implement a strict, sequential progression for each lesson:
     (1) Learn the letter/syllables: show character details, syllables (ma, me, mi, mo, mu), example words. Include a "Listo, ¡a leer! ➔" button to proceed.
     (2) Read the story page: render the StudentWorkbookFlip component. Include a "¡Terminé de leer! Ir a los juegos ➔" button to proceed.
     (3) Play minigames: render the interactive mini-games from the lesson in a clean tab/carousel or step-by-step. Include a "Continuar a la evaluación ➔" button once mini-games are completed.
     (4) Take assessment: render the assessment/answer key. Show a "Finalizar lección ✓" button which calls the final completion code.
   - The student must flow from stage to stage sequentially. You can track this in state (e.g., currentStep: 1 | 2 | 3 | 4) and disable header step tabs if future stages are locked.
   - Save this step state in localStorage so that it is preserved on refresh but resets when switching lessons.

3. Native Zero-Lag Data Architecture:
   - Drive all lesson flow content and progress locally.
   - In src/lib/student.functions.ts, modify joinClass, logProgress, and getMyProgress so that if the joinCode or studentId represents a local seed student/class (e.g. joinCode/studentId starts with "DEMO" or "seed-student-"), the call intercepts the backend request and uses local localStorage state (readState/writeState similar to seed-data.ts) instead of calling Supabase.
   - In src/components/cartilla/Ejercicios.tsx (TeacherAnswerKey component), check if the local seed teacher session is active ("cartilla.seed.teacher.v1" in localStorage) to bypass Supabase authentication queries.
   - In src/routes/cartilla/student/lecciones.tsx, intercept the fetchMyProgress sync block for local seed student sessions to hydrate progress from the local localStorage seed state.

Verify your implementation by running typecheck and Vitest tests:
- pnpm typecheck
- pnpm test

Once complete, write your handoff report to handoff.md in your directory, and use send_message to report back to your parent orchestrator (conversation ID a434263f-3037-4aed-b6db-02df3d08835e).
