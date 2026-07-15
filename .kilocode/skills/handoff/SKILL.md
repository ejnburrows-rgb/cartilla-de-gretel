<!-- SKILL 10 — /handoff (client delivery gate) -->
<!-- Run in: Kilo Code, then verify yourself · The name-protection skill -->

---
name: handoff
description: Use when a project is believed finished, to verify it is actually deliverable.
---

# Handoff Gate
Check each item and output a table with PASS/FAIL and evidence (what you did
to verify). No item may be assumed.

1. SECURITY_AUDIT.md exists with verdict SAFE TO SHIP.
2. QA_REPORT.md exists with zero open FAILs.
3. Sentry is installed; a test error was thrown and appeared in the dashboard.
4. error.tsx exists — users see a friendly screen, never a stack trace.
5. Uptime monitor is watching the LIVE url (not localhost).
6. .env.example exists listing every required env var (names only, no values).
7. README.md tells a stranger how to run and deploy the project.
8. LICENSE.md and PRIVACY.md (if the site collects anything) are present.
9. Stripe is in LIVE mode and one real test purchase was refunded successfully
   (skip if no payments).
10. All code is committed and pushed; Vercel deploy is green.
Verdict: DELIVERABLE / NOT DELIVERABLE + the shortest path to fixing each FAIL.
