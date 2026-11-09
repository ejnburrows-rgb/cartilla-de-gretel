# Original CRM phone journey after worker splitting repair

Application head: `ca5d14f9ba18cac4a06ce2726a68f661e877bf9d`.

Result: FAIL. The unchanged initial heading assertion could not find `Hoy en tu clase` within its original 5-second limit. No downstream classroom, note, assignment, identity-isolation, or report step ran. The original 120-second test limit remains intact. Full Chromium, one worker, normal Vite optimizer, dead-local backend settings, and REST/auth abort handlers were retained.

This does not invalidate the separately proved worker transform repair. It shows that correct lazy route splitting alone does not resolve the remaining startup readiness failure. Saved browser timing has 125 completed resources, DOMContentLoaded at 12.753s, load at 13.061s, and headingReady null at capture. CRM route modules arrive at 15.556s and teacher layout at 17.055s, after the load event; further lazy imports can still be pending. No page error, HTTP error, or REST/auth request was recorded. A system snapshot during this run showed only 550 MB free of 16,300 MB physical memory; pressure is observed, not proven as the failure's cause.

All pre-existing CRM proof outputs were byte-backed up before execution; see preserved-output-manifest.json. The run generated no replacement dashboard screenshot before failing. Evidence belongs to runs/crm-phone-split-repair. New packet .gitattributes preserves captured bytes without CRLF normalization.

The initial reservation attempt used the root ledger, which did not contain this owner's prior receipt, and was correctly blocked before launching. wrong-state-blocked-reservation.json preserves that decision. The same work identity was then correctly reserved against the original test-owner ledger, with canonical candidate/evaluator invalidation, before the sole browser execution. Its accepted receipt records local_failure, not a pass.
