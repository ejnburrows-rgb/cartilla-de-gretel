# Gretel Tutor — Security Audit & Remediation Log

This document records the exploitability assessment, applied fixes, and verification results for all SonarCloud security findings, remaining `S8786` polynomial-regex findings, and PR #1323 private intake hardening in `gretel-tutor`.

## 1. Summary Table

| Rule | Severity | Location | Real Exploitability | Disposition | Fix Applied |
|---|---|---|---|---|---|
| `S1523` | CRITICAL | `scripts/tutor-coverage-matrix.mjs:120` | Low in production (dev-only CLI reading tracked repo TS files), **High** if ever pointed at untrusted TS | **Fixed** | Removed `node:vm` / `vm.runInNewContext` completely; replaced with pure static TypeScript AST literal extraction (`ts.createSourceFile`). |
| `S4036` | Security Hotspot | `scripts/fetch-vosk-model.mjs:146` (and lines 131–178) | Low–Medium (local developer/CI PATH hijacking) | **Fixed** | Replaced bare `"tar"` and `"unzip"` invocations with `resolveFixedSystemBinary()` checking fixed absolute system paths (`/usr/bin/*`, `/bin/*`, `/opt/homebrew/bin/*`, `/usr/local/bin/*`, `.tools/bin/*`) verified via `accessSync(X_OK)`. Removed `process.env.PATH` mutation. |
| `S4036` | Security Hotspot | `scripts/tutor-intake/guard.mjs:158` | Low–Medium (local developer/CI PATH hijacking) | **Fixed** | Replaced bare `"git"` invocation with `resolveFixedSystemBinary("git", { repoRoot })` checking fixed absolute paths verified via `accessSync(X_OK)`. |
| `S4036` | Security Hotspot | `scripts/tutor-intake/visemes.mjs:91` | Low–Medium (local developer/CI PATH hijacking) | **Fixed** | Replaced bare `"unzip"` invocation with `resolveFixedSystemBinary("unzip", { repoRoot })` checking fixed absolute paths verified via `accessSync(X_OK)`. |
| `S4036` | Security Hotspot | `scripts/build-tutor-visemes.mjs:96,207` | None (already eliminated by refactoring) | **Verified Resolved** | Commit `12e9adf5` refactored `build-tutor-visemes.mjs` to delegate all external tool execution to `scripts/tutor-intake/media.mjs` and `scripts/tutor-intake/visemes.mjs`; zero `spawnSync`/`execFileSync` calls remain in `build-tutor-visemes.mjs`. |
| `S8786` | Code Smell / ReDoS | `scripts/tutor-coverage-matrix.mjs:90` (`/-+$/`) | Negligible (runs on short curriculum strings only) | **Fixed** | Replaced `/^-+/` and `/-+$/` with linear O(n) index trimming in `idSlug()`. |
| `S8786` | Code Smell / ReDoS | `scripts/validate-tutor-book-fidelity.mjs:512` (`/^B\d+.*\.txt$/i`) | Negligible (runs on local `docs/tutor/recording/` filenames) | **Fixed** | Replaced backtracking regex with linear O(n) prefix/suffix/digit check (`startsWith("b")`, `endsWith(".txt")`, ASCII digit at index 1). |
| PR #1323 | Defense-in-Depth | `scripts/tutor-intake/{guard,media,index}.mjs` | Medium (private voice data exposure, malicious media playlists, duplicate intake) | **Adopted** | Enforced `0o700` dir / `0o600` file permissions on `~/GretelVoicePrivate/`, added `-nostdin -xerror -protocol_whitelist file,pipe` to `ffmpeg` (and `-protocol_whitelist file,pipe` to `ffprobe`), and added SHA-256 content-hash matching against installed approved speech in `src/content/tutor-lines.json`. |

---

## 2. Detailed Finding Analysis & Remediations

### 2.1 `S1523` (CRITICAL) — Dynamic Code Execution in `scripts/tutor-coverage-matrix.mjs:120`

- **Original code**: `loadPureTsModule()` transpiled `.ts` files with `ts.transpileModule()` and executed the output with `vm.runInNewContext(outputText, sandbox)`.
- **Real exploitability**:
  - This script is a build/documentation generator (`node scripts/tutor-coverage-matrix.mjs`) that never runs in the browser or production PWA bundle, and only reads tracked repository TypeScript files (`src/content/lesson-meta.ts`, `src/lib/workbook-pages.ts`, `src/content/games/*.ts`).
  - However, Node's `node:vm` is explicitly **not** a security sandbox (prototype-chain escapes allow arbitrary code execution), so any tampered or untrusted TypeScript file in a PR checkout would execute arbitrary JS during matrix generation.
- **Fix applied**:
  - Removed `import vm from "node:vm"` and `vm.runInNewContext` completely.
  - Replaced `loadPureTsModule()` with `evalStaticTsNode()`, a pure recursive TypeScript AST literal evaluator over `ts.createSourceFile()` supporting only static data constructs: primitives (`string`, `number`, `boolean`, `null`, unary `+/-`), template strings, arrays (with spread), plain objects (with shorthand/spread), local `const` references, and simple `.map(x => ...)` on statically resolved arrays.
  - Moved the pure arithmetic `workbookPagesForLesson(lesson)` formula directly into `scripts/tutor-coverage-matrix.mjs` so zero functions are ever dynamically evaluated.

### 2.2 `S4036` — OS Command PATH Resolution

- **Affected locations**:
  1. `scripts/fetch-vosk-model.mjs:146` (and lines 131, 132, 135, 178): invoked bare `"unzip"` and `"tar"` via `spawnSync`.
  2. `scripts/tutor-intake/guard.mjs:158`: invoked bare `"git"` via `execFileSync`.
  3. `scripts/tutor-intake/visemes.mjs:91`: invoked bare `"unzip"` via `execFileSync`.
  4. `scripts/build-tutor-visemes.mjs:96,207`: historical finding from prior revision `7ec72bfa`; commit `12e9adf5` removed all direct subprocess calls from `build-tutor-visemes.mjs` (it now delegates exclusively to `scripts/tutor-intake/visemes.mjs` and `scripts/tutor-intake/media.mjs`).
- **Real exploitability**:
  - All affected scripts are local developer/CI build tools, not runtime app code. However, invoking bare command names relies on `process.env.PATH`, which could execute a shadowed binary if a writable directory precedes system directories in `PATH`.
- **Fix applied**:
  - Added `resolveFixedSystemBinary()` in `scripts/tutor-intake/media.mjs` (imported by `guard.mjs` and `visemes.mjs`) and an equivalent standalone helper in `scripts/fetch-vosk-model.mjs`.
  - Candidate lists are restricted to fixed absolute paths (`<repoRoot>/.tools/bin/<name>`, `/usr/bin/<name>`, `/bin/<name>`, `/opt/homebrew/bin/<name>`, `/usr/local/bin/<name>`, plus fixed Windows Git installation paths on `win32`).
  - Every candidate is verified with `statSync(candidate).isFile()` and `accessSync(candidate, fsConstants.X_OK)` on POSIX before execution.
  - Removed `process.env.PATH` mutation in `scripts/fetch-vosk-model.mjs`.

### 2.3 `S8786` — Polynomial / Super-Linear Regular Expressions

- **Locations**:
  - `scripts/tutor-coverage-matrix.mjs:90`: `.replace(/^-+/, "").replace(/-+$/, "")` in `idSlug()`.
  - `scripts/validate-tutor-book-fidelity.mjs:512`: `/^B\d+.*\.txt$/i.test(f)` when scanning `docs/tutor/recording/`.
- **Real exploitability**:
  - Negligible in practice because both operate exclusively on short, trusted repository strings and local filenames.
- **Fix applied**:
  - Replaced `idSlug()` leading/trailing hyphen regexes with two O(n) `while` loops trimming `"-"` indices.
  - Replaced `/^B\d+.*\.txt$/i` with a zero-regex O(n) check (`lower.startsWith("b") && lower.endsWith(".txt") && lower.length >= 6 && code >= 48 && code <= 57`).

### 2.4 PR #1323 Private Intake Security Hardening

Adopted from `origin/tembo/tutor-private-intake:scripts/intake-tutor-audio.py`:

1. **Restrictive private vault permissions (`0o700` dirs / `0o600` files)**:
   - Added `enforcePrivatePermissions(privateDir, filePaths)` in `scripts/tutor-intake/guard.mjs` and invoked it during non-dry-run intake in `scripts/tutor-intake/index.mjs`.
   - Ensures `~/GretelVoicePrivate/`, its `originals/` subdirectories, `index.json`, and stored private original recordings are strictly owner-readable/writable only on POSIX systems.
2. **Hardened `ffmpeg` and `ffprobe` flags**:
   - Exported `FFMPEG_SECURITY_FLAGS = ["-nostdin", "-xerror", "-protocol_whitelist", "file,pipe"]` and `FFPROBE_SECURITY_FLAGS = ["-protocol_whitelist", "file,pipe"]` in `scripts/tutor-intake/media.mjs`.
   - Applied to all `ffmpeg` invocations (`detectSilenceWithFfmpeg`, `extractAndResampleWav`, `exportRuntimeMp3`) and `ffprobe` (`probeMedia`) to prevent interactive stdin hangs, silently ignored decode errors, and malicious container/playlist network SSRF (`http://`, `https://`, `subfile:`, etc.).
3. **Content-hash matching against installed approved speech**:
   - Added `buildApprovedSpeechHashIndex(repoRoot)` and `matchInstalledApprovedBySha256(sha256, index)` in `scripts/tutor-intake/index.mjs`.
   - `runTutorIntake()` now tags incoming sources with `matchesInstalledApproved` and `matchedApprovedEntries` and includes `approvedHashMatches` in the intake report when an incoming file is byte-identical to an installed recording in `src/content/tutor-lines.json`.

---

## 3. Justified False Positives & Contextual Notes

- **`resolveToolBinary()` in `scripts/tutor-intake/media.mjs`**: Used for optional developer-installed media tools (`ffmpeg`, `ffprobe`, `rhubarb`). It checks explicit path overrides, environment variables (`FFMPEG_PATH`, `FFPROBE_PATH`, `RHUBARB_PATH`), and repo-local `.tools/` first, only falling back to `PATH` scanning with `statSync().isFile()` + `accessSync(X_OK)` verification before returning an absolute path. Because `ffmpeg`/`rhubarb` locations vary widely across Linux/macOS/Windows developer setups, this controlled absolute-path resolution is intentional and safe.
- **No browser/production exposure**: Every file audited in this report lives under `scripts/` and executes only during offline developer/CI workflows. None are imported by Vite or bundled into the student/teacher web application.

---

## 4. Verification Commands

All checks executed and verified clean:
- `node scripts/tutor-coverage-matrix.mjs`
- `node scripts/validate-tutor-lines.mjs`
- `node scripts/validate-tutor-visemes.mjs`
- `node scripts/validate-tutor-book-fidelity.mjs`
- `pnpm vitest run scripts/__tests__/tutor-intake.test.mjs`
