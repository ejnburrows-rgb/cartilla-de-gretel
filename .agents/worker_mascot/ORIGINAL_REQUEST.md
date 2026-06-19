## 2026-06-17T19:07:16Z
You are a developer worker. Your working directory is C:\Users\EJN\Desktop\La Cartilla\cartilla-de-gretel\.agents\worker_mascot\.
Your task is to implement mascot upgrades by modifying the following files in the workspace:

1. src/components/gretel/gretelPoses.ts
Update the paths in GRETEL_POSES to point to `/cartilla/images/gretel/poses/` with `.webp` extension:
- "idle-1": "/cartilla/images/gretel/poses/idle-1.webp"
- "idle-2": "/cartilla/images/gretel/poses/idle-2.webp"
- "blink": "/cartilla/images/gretel/poses/blink.webp"
- "talk-open": "/cartilla/images/gretel/poses/talk-open.webp"
- "talk-closed": "/cartilla/images/gretel/poses/talk-closed.webp"
- "wave": "/cartilla/images/gretel/poses/wave.webp"
- "point": "/cartilla/images/gretel/poses/point.webp"
- "cheer": "/cartilla/images/gretel/poses/cheer.webp"

2. src/lib/speak.ts
Ensure local voices are prioritized offline and update cache logic when offline state changes:
- Define a module-level variable `let lastOnLine: boolean | null = null;`.
- Add a helper function:
  ```typescript
  function getVoice(): SpeechSynthesisVoice | null {
    const currentOnLine = typeof navigator !== "undefined" ? navigator.onLine : true;
    if (lastOnLine !== currentOnLine) {
      cachedVoice = null;
      lastOnLine = currentOnLine;
    }
    if (!cachedVoice) {
      cachedVoice = pickBestVoice();
    }
    return cachedVoice;
  }
  ```
- Modify both `speak` and `speakVowel` functions to use `getVoice()` instead of `cachedVoice ?? pickBestVoice()`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Verification instructions:
1. Run `npx vitest run` and confirm all tests pass.
2. Run `pnpm build` to ensure the project compiles successfully.
Write your completion handoff to C:\Users\EJN\Desktop\La Cartilla\cartilla-de-gretel\.agents\worker_mascot\handoff.md and message your parent when done.
