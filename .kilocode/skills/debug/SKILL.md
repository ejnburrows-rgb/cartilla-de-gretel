<!-- SKILL 5 — /debug (systematic debugging — the superpowers method) -->
<!-- Run in: Kilo Code · Adapted from obra/superpowers "systematic-debugging" -->

---
name: debug
description: Use when encountering any bug, test failure, or unexpected behavior, BEFORE proposing fixes.
---

# Systematic Debugging
Do not guess. Do not "try something." Follow the protocol:

1. REPRODUCE: state the exact steps that trigger the bug and confirm you can
   trigger it on demand. If you can't reproduce it, say so and stop.
2. READ THE ERROR: quote the actual error message, line by line. The answer is
   usually in it.
3. FORM ONE HYPOTHESIS: "I believe X is happening because Y." One at a time.
4. TEST THE HYPOTHESIS with the smallest possible check (a log line, a hardcoded
   value) BEFORE changing real code.
5. FIX the confirmed cause only. Remove your test scaffolding.
6. VERIFY the original reproduction steps now pass.
7. Write one line in REPORT.md: what was broken, root cause, fix.

HARD RULE: if you change code 3 times without progress, STOP, revert all three
changes, and write BLOCKED.md. Thrashing destroys working code.
