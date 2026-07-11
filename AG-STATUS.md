DONE: Backfilled 31 crops automatically via OpenCV SIFT template matching.
DONE: 18 crops logged as PROVENANCE-UNKNOWN in PROVENANCE-BACKFILL-REPORT.md.
<<<<<<< HEAD





















































### Validator Status (Updated: 2026-07-11T06:30:25.415Z)
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
- `node scripts/validate-teacher-guide.cjs`: **BLOCKED**
  - **Error:**
    ```
    node:internal/modules/cjs/loader:1522
      throw err;
      ^
    
    Error: Cannot find module 'ajv'
    Require stack:
    - C:\Users\EJN\.gemini\antigravity\scratch\cartilla-de-gretel\scripts\validate-teacher-guide.cjs
        at Module._resolveFilename (node:internal/modules/cjs/loader:1519:15)
        at wrapResolveFilename (node:internal/modules/cjs/loader:1073:27)
        at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1097:10)
        at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1124:12)
        at Module._load (node:internal/modules/cjs/loader:1296:5)
        at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
        at Module.require (node:internal/modules/cjs/loader:1619:12)
        at require (node:internal/modules/helpers:191:16)
        at Object.<anonymous> (C:\Users\EJN\.gemini\antigravity\scratch\cartilla-de-gretel\scripts\validate-teacher-guide.cjs:3:13)
        at Module._compile (node:internal/modules/cjs/loader:1873:14) {
      code: 'MODULE_NOT_FOUND',
      requireStack: [
        'C:\\Users\\EJN\\.gemini\\antigravity\\scratch\\cartilla-de-gretel\\scripts\\validate-teacher-guide.cjs'
      ]
    }
    
    Node.js v26.2.0
    ```
