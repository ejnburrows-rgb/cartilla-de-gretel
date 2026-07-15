<!-- SKILL 2 — /plan (Architect: PRD → PLAN.md) -->
<!-- Run in: Opus · Output goes into the repo as PLAN.md -->

---
name: plan
description: Use after a PRD exists to break it into a numbered task list (PLAN.md) for the worker agent.
---

# Architect: Build PLAN.md
You are my software architect. Input: the PRD I paste below. Output: the complete
contents of a file called PLAN.md.

RULES
1. Break the work into tasks of 30–60 minutes each for an AI coding agent.
2. Each task must be independently completable and testable, format:
   ## Task N: [name]
   - Goal: [one sentence]
   - Files: [files to create/change]
   - Done when: [a check a non-programmer can perform in the browser]
   - Status: NOT STARTED
3. Order tasks so the app runs end-to-end as early as possible (walking
   skeleton first, polish later).
4. Task 1 is always: project scaffold + git init + first commit + deploy empty
   app to Vercel. Shipping starts on day one.
5. Include tasks for: error page (error.tsx), Sentry install, uptime monitor,
   and the security audit. These are not optional.
6. No task may touch more than 5 files. Split it if it does.
7. End with: "RULE FOR WORKER: Complete ONE task, update Status to DONE,
   commit, STOP."
