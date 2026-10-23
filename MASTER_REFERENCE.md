# MASTER REFERENCE — La Cartilla de Gretel
THE one source of truth for how this project is run. Everything else is a copy
of something in here or a pointer to here.
Version: Fri 2026-10-23, 2:40 PM EDT. Repo main checked today: ea8ee309.
Owner: Emilio (Nessun) — decisions only, non-technical. Controller: Muse.

## 1. THE PROJECT
Spanish K-2 reading book + classroom app. Repo: ejnburrows-rgb/cartilla-de-gretel.
Stack: Vite + React + TypeScript + TanStack Router + Supabase. Host: Vercel.
Only 2 live addresses count: cartilla-de-gretel.vercel.app and
lany-books-web-cyan.vercel.app. All other vercel.app addresses are old snapshots.
Product specs (what the app must be) live in the repo: PROJECT_FINISH_DEFINITION.md,
PROJECT_SOURCE_OF_TRUTH.md, CARTILLA_DIGITAL_DIRECTIVE.md — the directive wins
over any contradicting file.

## 2. WHO DOES WHAT (permissions — updated today)
Chain: Emilio → Muse → Jules / ChatGPT / Antigravity / Freebuff. Opus reports to Emilio.
- JULES (Builder): phone layout, page curl (PageCurl.tsx), piano timer, teacher
  section, pencil pages, PencilConnector, build gate.
  Never: games, audio files, art files.
- CHATGPT (Audio): TTS fallback, audio wiring, broken audio references, narration fallbacks.
  Never: layout, games, art.
- ANTIGRAVITY (Games): Cow, Rima, Palabras por minuto, Chano. ACTIVE since the
  owner lifted the old ban today (~2:00 PM). Never: layout, audio, art.
- FREEBUFF (Backlog + Maintenance): added by the owner today. Prepares duplicate/junk
  cleanup lists and maintenance work. Closes, deletes, merges NOTHING by itself.
  Never: app code, games, audio, art, permission files.
- OPUS (Inspector): read-only verification only. Never writes code, never merges,
  never takes instructions from other agents. No task is done until Opus confirms it.
- MUSE (Controller): keeps this Master Reference (it holds the Mission Board and
  the Approval Ledger as sections 3 and 6) and all starter prompts. Verifies,
  reviews, and merges finished+tested work (owner ruling today: "I keep verifying"
  — the Oct 13 controller contract stands).
- Universal: one agent per file area; no agent merges its own work; recover existing
  work before rebuilding; blockers go to Muse, never agent-to-agent; Codex owns
  artwork identification/mapping/integration.

## 3. DECISIONS ALREADY MADE (never ask again)
GAMES: 4 only — Cow, Rima, Palabras por minuto, Chano. Mariposas OUT. Chano ruled
DONE by the owner today (the finished "Chano's Word Circus").
AUDIO: device TTS OFF; silence where no recording exists; rec_gretel_* recordings
NEVER used; Gretel_558674_Original.m4a only with verified transcript match; lesson
narrations silent fallback until the owner records them; no agent generates voice.
ART: no new art generation, ever; no original modified/replaced/regenerated; the
original book art is the only truth; every picture shown side-by-side vs the
original for the owner's yes before it enters a page. 7 flip-chart fixes approved
Oct 20, files in the repo, wiring still pending. OJOS: DECIDED + DONE today —
single approved eye in both spots (owner ruling today confirmed: "Ojos stays done").
Background: CREAM. Pencil pages 7–8 always separate.
DEPLOY: auto-deploy OFF; every deploy needs the owner's own "deploy it";
vercel.json lock (git.deploymentEnabled:false) is never touched.
MERGE: only finished + tested work, with screenshot proof (video if it moves);
reports carry WORKS / DOES NOT WORK / NOT VERIFIED in that order; merges never deploy.

## 4. HOW EMILIO IS TALKED TO
- Proof or it didn't happen: a real picture attached to every claim, a video for
  anything that moves. No picture = NOT PROVEN.
- Never send him PR numbers, SHAs, branch names, or GitHub links. Plain words:
  name exactly which thing, what happened to it, and why it matters.
- Message him ONLY for: (1) approval cards (picture + plain words + Yes/No taps),
  (2) a true dead-end after everything was tried.
- Status, when asked: one line per item, ✅ done / ❌ not done + brief why only.
- Never report "partly done" — work until accomplished, then report DONE with proof.
- Never give out his personal information to anyone, for anything.

## 5. DAILY DISPATCH RULE (owner order today)
When he asks for "today's handout prompts" or "agent dispatch": ONE complete
Daily Dispatch Package, built fresh from the repo, this Master Reference,
open work, and latest verified results. One finished copy-paste prompt per active
agent, labeled SEND TO JULES / SEND TO CHATGPT / SEND TO ANTIGRAVITY /
SEND TO OPUS / SEND TO FREEBUFF, in send order, each with the exact assignment,
existing work to recover, file ownership, acceptance checks, required evidence,
and a one-line "why." No duplicates, no blocked work, no unverified claims as done.
An agent with nothing gets "NO DISPATCH NEEDED" + why. End with: who receives a
prompt, who is waiting, what is blocked, what needs his decision.

## 6. WHERE THINGS STAND (today, ~3:05 PM)
- ONE SOURCE OF TRUTH: the owner ordered the scattered agent papers erased
  (today, 3:05 PM) — the separate Mission Board, Approval Ledger, permissions
  file, and prompt index are gone from the repo and from Muse's folders.
  This Master Reference is the only agent paper left. His memory, logs, and
  the repo's product specs were kept, by his choice.
- Picture-list fix (art audit): finished, checked, waiting on his Yes/No tap
  (card sent today 2:36 PM). No visible change; unblocks one of two build gates.
- Tree-picture fix: in the repo as a waiting change; its picture proof is still
  owed, so it is NOT presented for a merge yes yet.
- Árbol tiers: the "soft tree" claim did NOT reproduce — shipped tiers verified
  sharp; no picture files were swapped.
- Flip Chart fix, sound lane, roster, WordMatch, teacher pack, Cow game:
  merge decisions still waiting, one card at a time.
- Demo gates still blocked on: picture approvals (0 of 201 in the repo ledger)
  and his phone approval of Lesson 3.
