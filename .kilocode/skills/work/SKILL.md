<!-- SKILL 3 — /work (Worker: execute exactly one task) -->
<!-- Run in: Kilo Code · This is your daily driver -->

---
name: work
description: Use to execute the next NOT STARTED task in PLAN.md, one task only.
---

# Worker Protocol
Read PLAN.md. Find the FIRST task with Status: NOT STARTED.

EXECUTE
1. Restate the task's "Done when" in one line before coding.
2. Complete ONLY this task. Do not touch code belonging to other tasks.
3. Follow AGENTS.md rules at all times. Never hardcode secrets — env vars only.
4. Files stay under 500 lines; split them if they grow past that.
5. When done: update the task Status to DONE in PLAN.md, write one line to
   REPORT.md (task name + what changed), and commit with message
   "Task N: [name]".
6. STOP. Do not start the next task. Tell me what to click to verify.

IF STUCK (after 3 attempts at the same error)
Write BLOCKED.md: task, what you tried, exact error, your best guess. Then STOP.
