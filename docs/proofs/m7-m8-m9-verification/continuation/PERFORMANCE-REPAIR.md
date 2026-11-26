# Startup performance repair — PR #1247

Status: DONE but not live for source repair and measured budgets. Integrated full gate and targeted browser verification remain with the integration/runtime owner.

Application/test commit: `649d0fd072cf50fe8580c8629376f9f6349af44a` on existing `continuation/1247-test-repairs`. Candidate `4d73acf7647d04f4f02a4cf2cef4acae8dc14025` was merged normally into the existing workstream as `2093f390`; the sole report conflict retained the candidate's corrected Git LF-normalization explanation. No unrelated dirty or untracked files were removed.

## Confirmed import attribution and repair

A local Rollup generateBundle inspector measured actual rendered modules, rather than relying on the stale graph index. The eager practice route exported both Route and Practica, preventing its component from being isolated by automatic route splitting. Its ActivityCarousel/vocabulary dependency path pulled page layouts (118,298 rendered bytes), Flip Chart text data (191,357 combined), living actor registry (72,844), DnD core (90,236) and motion/interaction code into the entry graph. Moving the unchanged view into dash-prefixed `-practica-view.tsx`, loaded by `practica.lazy.tsx`, removes that eager path. Both existing consumer test imports were updated; their assertions remain unchanged. The router generated the corresponding lazy import.

The intermediate graph in `after-practica-module-attribution.json` shows the remaining eager Supabase contribution: GoTrueClient 233,869 rendered bytes, PostgREST 128,873, Storage 101,283, plus its supporting modules. Static imports in teacher, presenter and print route guards were the eager root. Those guards now await the same client only after their existing public/local/session checks. Admin-overview loading follows the existing local admin check, and the shared role helper awaits the client before the same two parallel RPCs. Access decisions, redirects and errors are unchanged.

Tailwind still scans all production source. Only `__tests__`, test and spec files are excluded from generation; no production class safelist or source file is excluded. The existing practice/teacher styles are loaded with their actual route dependency graph. No artwork, source metadata, audio, Tutor, Mariposas, budget threshold, performance checker or performance assertion changed.

## Measurements

Bytes, raw / gzip. Limits remain entry JS 512000/128000, entry CSS 307200/51200, total first paint JS 1003520/276480.

| Build identity | Entry JS | Entry CSS | First-paint JS |
| --- | ---: | ---: | ---: |
| Candidate source, standalone production diagnostic | 1179045 / 268196 | 318586 / 52513 | 1484518 / 365818 |
| Practice split + test-only CSS scan exclusion, same standalone environment | 455640 / 113061 | 291582 / 47411 | 733851 / 201476 |
| Final source649d0fd0, unchanged performance test's fresh build | 249309 / 58331 | 291582 / 47411 | 741358 / 207988 |

The final row is measured from the unchanged test's fresh build, not a reused dist. All six budget/isolation/lazy checks PASS; violations[]. Build exit0,147s. The test runner's NODE_ENV=test retains development React: final vendor395438 raw/118591 gzip, versus standalone production192950/60538. This explains why the standalone baseline differs from the prior published test-runner baseline. The 88 installed direct dependency versions all match the candidate lockfile importer; dependency identity is attached. No installation or shared dependency mutation was performed.

## Verification and limits

- Existing practice + teacher/admin guard suites:15 passed,0 failed,0 skipped. `loading-focused.json` preserves raw results.
- Typecheck:exit0. `typecheck.log`.
- Unchanged performance suite:6 passed,1 failed,0 skipped. The sole failure was the historical report Markdown existence assertion at line75, because this isolated sparse checkout omitted tracked `docs/proofs/performance-budget`. All budget and isolation assertions passed. Raw JSON/log retained.
- Restored that tracked directory using sparse-checkout; direct verification of the unchanged report assertion values passes: Markdown and JSON exist, JSON passed=true, violations[]. `sparse-proof-restored.json`. Existing tracked baseline reports were not rewritten.
- A corrected-checkout rerun was stopped before any new Vite build launched; the integration owner's single complete gate will run the unchanged suite with the restored directory present. No second full performance build was completed just to repeat passed measurements.
- No full suite, physical device, production deployment or final runtime acceptance is claimed here. Runtime owner should verify cold welcome startup, first interaction, practice rapid/piano/family modes, teacher local/public routes, presentation, printable single/all, and retained artwork/audio when those routes load. Gated-auth unit coverage remains in the15 focused results.

Changed application/test files: `src/lib/auth-role.ts`; generated `src/routeTree.gen.ts`; `src/routes/cartilla/practica.tsx`, `-practica-view.tsx`, `practica.lazy.tsx`; existing `src/routes/cartilla/__tests__/practica-games.test.tsx`, `tests/practica.test.tsx`; teacher `route.tsx`, `admin.tsx`; `imprimir.$n.tsx`, `imprimir.all.tsx`, `presentar.$n.tsx`; `src/styles.css`.

Next: integrate accepted source, run the single final gate and affected browser checks, then exact-head independent/formal review before merge/release. Budget success is not release approval.
