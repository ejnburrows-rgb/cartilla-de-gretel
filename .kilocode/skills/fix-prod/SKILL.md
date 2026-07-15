<!-- SKILL 8 — /fix-prod (Sentry error → fix loop) -->
<!-- Run in: Kilo Code · Your $0 replacement for Sentry's paid auto-repair -->

---
name: fix-prod
description: Use when Sentry reports a production error. Paste the Sentry error details after the command.
---

# Production Fix Protocol
A real user hit this error in production. Sentry details are pasted below.

1. Locate the exact file and line from the stack trace.
2. Explain in plain English what the user was doing when it broke, and why.
3. Apply /debug protocol (reproduce → hypothesis → smallest test → fix).
4. Also fix the CLASS of bug: if one form field crashed on empty input, check
   every other field for the same hole — but list those as separate proposed
   tasks, don't silently change unrelated files.
5. Verify the fix, commit as "hotfix: [description]", and tell me exactly what
   to click to confirm it's dead.
6. Add one line to REPORT.md so the fix survives context loss.
Severity rule: if the error involves payments or data loss, tell me FIRST,
before fixing, so I can message the client.
