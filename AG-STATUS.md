DONE: Backfilled 31 crops automatically via OpenCV SIFT template matching.
DONE: 18 crops logged as PROVENANCE-UNKNOWN in PROVENANCE-BACKFILL-REPORT.md.



































### Validator Status (Updated: 2026-07-10T13:00:25.894Z)
- `node scripts/validate-content.mjs`: **PASS**
- `node scripts/validate-activities-content.mjs`: **BLOCKED**
  - **Error:**
    ```
    node:internal/modules/cjs/loader:1522
      throw err;
      ^
    
    Error: Cannot find module 'C:\Users\EJN\.gemini\antigravity\scratch\cartilla-de-gretel\scripts\validate-activities-content.mjs'
        at Module._resolveFilename (node:internal/modules/cjs/loader:1519:15)
        at wrapResolveFilename (node:internal/modules/cjs/loader:1073:27)
        at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1097:10)
        at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1124:12)
        at Module._load (node:internal/modules/cjs/loader:1296:5)
        at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
        at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
        at node:internal/main/run_main_module:33:47 {
      code: 'MODULE_NOT_FOUND',
      requireStack: []
    }
    
    Node.js v26.2.0
    ```
- `node scripts/validate-teacher-guide.cjs`: **PASS**
