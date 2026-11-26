# Worker route splitting repair validation

Application/config head: `ca5d14f9ba18cac4a06ce2726a68f661e877bf9d`.

The old worker mode omitted the entire TanStack router plugin, which also removed automatic route splitting. The repair retains the plugin and gives each worker lane a generated tree under ignored `work/router-worker/{open,gated}`. Production and Vitest options remain unchanged.

`result.json` verifies open and gated route transforms independently: WelcomeSplash and NativeLessonViewer are lazy `tsr-split` references, neither is a static import; generated route IDs match the committed tree. All 96 tracked route/tree files preserve SHA-256 and modification time. Both awaited Vite close calls finish. The standalone diagnostic exits explicitly after recording remaining imported-plugin resources.

This is a transform-only diagnostic using middleware mode with dependency crawl disabled. It does not prove real browser readiness or default dependency-optimizer behavior. The original CRM phone journey is the separate affected runtime gate, retaining normal worker settings and original 5-second assertion/120-second test limits.

`completion.json` supplies actual process exit 0 and reuses the prior independent typecheck exit 0 at the same head; it does not claim typecheck was repeated. `accepted.json` verifies the completed focused diagnostic. Failed diagnostics are retained: initial syntax error; unsettled top-level await; 120-second shutdown watchdog; and a completed transform check whose residual process was terminated by the owner (exit 4294967295, not a pass). No failed diagnostic is promoted as passing evidence.

The archived drivers contain old absolute paths and accepted reservation identities. They document execution and must not be replayed as launch authority.
