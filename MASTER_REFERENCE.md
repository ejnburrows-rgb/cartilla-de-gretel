# MASTER REFERENCE — La Cartilla de Gretel

> **Execution policy:** [AGENTS.md](AGENTS.md). **Current assignments/status:** [GitHub #877](https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877). Historical directives below are context, not independent controller instructions.

Controller responsibilities and recorded owner decisions. This is not a live status report.
The finish requirements are in PROJECT_FINISH_DEFINITION.md; current approved scope is in
PROJECT_SOURCE_OF_TRUTH.md; the existing execution queue is GitHub issue #877.
Read live GitHub and actual app results before claiming current progress.
Owner controls product priority, proof inspection and consequential approvals; ChatGPT/Codex coordinates the existing technical work under AGENTS.md.

## 1. THE PROJECT
Spanish K-2 reading book + classroom app. Repo: ejnburrows-rgb/cartilla-de-gretel.
Stack: Vite + React + TypeScript + TanStack Router + Supabase. Host: Vercel.
Do not infer current deployment from historical URLs; inspect the live app and deployed
revision directly when release state matters. Deployment is explicitly owner-gated.
PROJECT_FINISH_DEFINITION.md defines completion; PROJECT_SOURCE_OF_TRUTH.md records
scope and owner decisions; CARTILLA_DIGITAL_DIRECTIVE.md governs book fidelity.

## 2. WHO DOES WHAT (permissions — updated today)
Chain: owner → ChatGPT/Codex controller → existing assigned workers and independent reviewer.
- CHATGPT/CODEX (Controller): uses #877 as the sole current execution record and this document as supporting reference, coordinates existing assignments, reconciles evidence and approvals, and presents visible results. Codex retains artwork identification/mapping/integration.
- JULES (Worker): retains existing assigned implementation and focused verification. Completed sessions are not integrated features; reuse delivered work before assigning new coding.
- MUSE (Supporting records): supplies prior assignments, session history and controller records when accessible; no independent dispatch or competing queue.
- EXISTING SPECIALISTS: retain their existing bounded assignments, including Piano/game work, subject to current owner approvals and access. This controller change creates no new agent or service authorization.
- INDEPENDENT REVIEWER: reviews material changes where required; no worker approves its own work, and protected-main approval remains mandatory.
- OWNER: makes essential product/visual decisions and authorizes consequential actions. Technical coordination stays with the controller; never require the owner to relay ordinary worker prompts.
- Universal: one owner per task/file surface; recover existing work before rebuilding; report blockers to the ChatGPT/Codex controller. Preserve existing work, exact-change approvals and release gates.

## 3. DECISIONS ALREADY MADE (never ask again)
GAMES: Cow, Rima, Palabras por minuto, Chano, and owner-restored Mariposas (October 28). The existing Butterfly Garden source project is already imported intact on PR #1079 (33 image hashes verified), with the related scene candidate in PR #1010. Do not silently merge overlapping implementations; preserve both for reconciled review. Chano's latest owner design direction is accepted, but its exact delivered version and intended-route gameplay must still be reconciled before integration.
AUDIO: device TTS OFF; silence where no recording exists; rec_gretel_* recordings
NEVER used; Gretel_558674_Original.m4a only with verified transcript match; lesson
narrations stay silent where verified authentic phrases are unavailable; recover existing recordings in #769, not a default owner rerecording or generated voice.
ART: no new art generation, ever; no original modified/replaced/regenerated; the
original book art is the only truth; every picture shown side-by-side vs the
original for the owner's yes before it enters a page. 7 flip-chart fixes approved
Oct 20, files in the repo, wiring still pending. OJOS: DECIDED + DONE today —
approved singular `ojo` with `ojo.png` in both spots; #1210 proposed `ojos` wording remains held without a later explicit owner reversal.
Background: CREAM. Pencil pages 7–8 always separate.
DEPLOY: auto-deploy OFF; every deploy needs the owner's own "deploy it";
vercel.json lock (git.deploymentEnabled:false) is never touched.
MERGE: only finished + tested work, with screenshot proof (video if it moves);
reports use DONE and live / DONE but not live / WAITING / NOT TESTED; merges never deploy.
GITHUB STATUS: use current GitHub PR records and #877. The former October 28 open/unmerged #1079 and HTTP 405 snapshot is superseded; it remains available in Git history, not as a current integration or release blocker. This document does not maintain a second deployment-status ledger.

## 4. HOW EMILIO IS TALKED TO
- Proof or it didn't happen: a real picture attached to every claim, a video for
  anything that moves. No picture = NOT PROVEN.
- Lead with what visibly changed and what still blocks completion. Include exact
  evidence links when useful; do not make the owner navigate technical processes.
- Do not reopen routine A–E decisions or request repeated approval cards.
- Report verified states faithfully: built, tested, owner-accepted, reviewed,
  merged and deployed are distinct. Clearly state partial, blocked or unknown work.
- Never give out his personal information to anyone, for anything.

## 5. COORDINATION RULE (owner override October 28)
The owner gives requests in the current ChatGPT/Codex conversation. The controller handles existing agent assignments and review through available tools, using the current authorized scope and existing #877 queue. Do not require daily handout prompts or owner-managed agent routing. If a specific access limitation requires owner action, provide one concrete step and retain all technical details yourself. No automatic dispatch schedule or provider access is established merely by these instructions.
