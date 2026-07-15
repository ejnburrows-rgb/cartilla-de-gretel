<!-- SKILL 6 — /security-audit (pre-launch gate) -->
<!-- Run in: Kilo Code · Produces SECURITY_AUDIT.md · Mandatory before any handoff -->

---
name: security-audit
description: Use before launching or handing off any project. Produces a SAFE / NOT SAFE verdict.
---

# Security Audit
Audit this codebase as a hostile attacker would. Write SECURITY_AUDIT.md.

CHECKLIST
1. SECRETS: search every file for API keys, passwords, tokens. Check .env is
   in .gitignore. Check git history hints (files named .env ever committed?).
2. DATABASE: list every Supabase table. For each: is Row Level Security ON?
   Which rows can a logged-out visitor read? Which can any logged-in user read?
   Flag anything a user can see that isn't theirs.
3. INPUT: every form field and URL parameter — is it validated on the SERVER
   (not just the browser)? Flag raw input reaching the database.
4. PAYMENTS: are prices computed on the server? Could a client-side edit change
   what's charged?
5. AUTH: can any page or API route that should require login be reached
   without it? Test by listing routes and their guards.

OUTPUT FORMAT in SECURITY_AUDIT.md
- Verdict at top: SAFE TO SHIP / NOT SAFE (with count of blockers)
- Each finding: severity (BLOCKER/WARN), file, one-line fix instruction.
Do not fix anything in this run. Audit only. Fixes become PLAN.md tasks.
