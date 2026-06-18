## 2026-06-17T19:07:00Z
Your identity is Worker 1. Your working directory is C:\Users\EJN\Desktop\La Cartilla\cartilla-de-gretel\.agents\worker_setup_1\.
Your task is to implement the test setup and mocks for Milestone 1.

Specifically:
1. Create a test setup file `src/test/setup.ts` implementing:
   - A mock for `SpeechRecognition` and `webkitSpeechRecognition` matching the design in C:\Users\EJN\Desktop\La Cartilla\cartilla-de-gretel\.agents\explorer_setup_1\handoff.md.
   - A mock for `AudioContext` and `webkitAudioContext` matching the design in C:\Users\EJN\Desktop\La Cartilla\cartilla-de-gretel\.agents\explorer_setup_2\handoff.md.
   - Pointer/Touch event gesture simulation helpers matching the design in C:\Users\EJN\Desktop\La Cartilla\cartilla-de-gretel\.agents\explorer_setup_3\handoff.md. Make sure these helpers are exported from `src/test/setup.ts` or a separate utility so they can be easily imported by tests.
2. Edit `vite.config.ts` to include the `test` configuration block so Vitest uses `jsdom` and loads the setup file `src/test/setup.ts` globally, and supports globals.
3. Run the existing tests (`pnpm test`) to ensure everything compiles and passes.
4. Write your completion details to `C:\Users\EJN\Desktop\La Cartilla\cartilla-de-gretel\.agents\worker_setup_1\handoff.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
