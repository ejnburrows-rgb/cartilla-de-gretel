# Correction: unit success and production artifact identity

The complete 324b1383 unit run remains verified: 223 files; 2,195 plain passes and two unchanged pre-existing expected failures. Its seven existing performance-budget assertions passed on a fresh Vite build.

That build inherited NODE_ENV=test from Vitest through scripts/verify-performance-budget.mjs. Its captured React vendor contains the development runtime and its CRM chunk uses jsxDEV. Consequently, earlier wording calling this artifact a fresh production build or a production-qualified entry artifact was too broad. This correction supersedes that wording in unit-runner-repair/complete-gate-324b1383/REPORT.md, its original immutable post-build manifest, and earlier timing reviews. The old manifest and accepted receipts are retained unchanged as historical evidence; their hashes still identify the original bytes.

Fix bfab98b6 forces NODE_ENV=production only in the child performance build. A new regression examines the real CRM build chunk for development JSX and confirms the parent test environment stays test. All original budgets, coverage, and hook/test time limits remain unchanged. This does not change application artwork, audio, routing authority, or backend access.

Worker routing fix 51563318 (worker identity ca5d14f9) is separately verified by open/gated route transforms and unchanged source files. The original default-dev phone journey at ca5d14f9 still fails its unchanged initial 5-second heading assertion. The sampled old-artifact built entry passed only in a profiled diagnostic; it does not qualify the full CRM phone journey or erase earlier failures.

Current production-runtime validation now passes all8 checks, and the full original phone journey passes against its immutable445-file artifact. Complete browser qualification, four owner source-placement decisions, physical phone/projector evidence, and eligible exact-head formal review are separate requirements. No merge or deployment has occurred.
