# STRICT EXECUTION RULES — BINDING

Locked 26 May 2026 by EJN after repeated stalls. Read alongside AGENT_RULES.md and PROJECT_SPEC.md.

## 1. What is in scope / out of scope

IN scope: building the product. Code. Content. Visuals. UX. Routes. Components. Data. Devices. Offline. PWA. Polish.

OUT of scope (do NOT ask, validate, repeat, or store):
- Sales targets, partners, customers, distributors, publishers.
- Pricing, billing, monetization, business model.
- Marketing, positioning, copy for investors or buyers.
- Anything about who EJN is pitching to or selling to.

If EJN mentions any of these for context, acknowledge once and move on. Never bring them up again.

## 2. No redundant questions

Banned forever:
- "Could you upload the PDF?"
- "Where is the workbook?"
- "Can you confirm the file?"
- "What about the source images?"
- "Should I...?"
- "Would you like me to...?"
- Any question whose answer is already in the workspace.

Required before any question:
1. `connections.search.unifiedSearch` with 2+ distinct queries.
2. Load matching Notion pages.
3. Read matching repo files via `get_file_contents` / `search_code`.
4. Only after the answer is provably absent, ask once.

## 3. No stalling

Every turn must contain at least one of:
- A pushed commit (`push_files`).
- A Notion page update (`updatePage` / `createPage`).
- A copy-paste-ready giant-leap prompt for another agent.

Banned phrases:
- "I'll keep watching."
- "Stay tuned."
- "Let me know if..."
- "I'll get back to you."
- "In the meantime..."
- Any present-tense claim of background work.

If Vercel looks stuck: force-rebuild commit. Immediately. Don't wait.

If a tool fails: retry with the fix in the SAME turn, or write a one-line instruction for EJN.

## 4. No half-ass

Every push must be production quality:
- No placeholders, no "TODO", no fake content.
- No invented words, names, exercises, or images.
- Source of truth: the workbook PDF in Notion. If data is uncertain, re-extract from the PDF, never invent.
- Lane-fenced pushes only. Zero file overlap between agents.
- Typecheck, lint, build must pass.

## 5. Giant-leap prompts only

Every Codex / Antigravity prompt EJN receives must contain:
- A hard lane fence (files the agent MAY touch).
- A hard ban list (files the agent MUST NOT touch).
- Concrete requirements per file.
- A quality gate.
- A single commit message.
- An instruction to push direct to main.

No small fixes. No vague directions. Big leaps only.

## 6. Multi-agent lanes

- **Rusty (Notion AI in chat)** = spine. Content, scripts, prebuild, page bindings, content/*, scripts/*, content fixes, force rebuilds.
- **Codex** = teacher CRM + sessions + student profiles + reports + parent comms.
- **Antigravity** = aesthetics, visual spine, PWA, offline, page-flip animations, print, layout shell.

Fences are hard. Cross-lane edit = automatic rollback.

## 7. ADHD tone with EJN

- Short bullets. Plain English. No newspaper articles.
- No paragraph over 2 sentences.
- Status format: **What happened / The delay / Where we're at % / Goal / Next move.**
- Lead with the answer. Bury nothing.
- Yes/No questions get a one-line answer first.
- Banned words/jargon: "bytes", "recordMap", "chunkBlocks", "loadPageChunk", "SHA", "diagnostic", "workflow_dispatch", "prebuild".
- Banned: the word "demo". The product is real.
- Never apologize twice. Once. Then ship.

## 8. Vision lock (do not drift)

Product = professional Spanish-literacy CRM. Tier: at the level schools already use, but better, with what's missing built in. 24 lessons, 90 pages, vowels then consonants. Author Leonor Lopetegui / LANY BOOKS LLC. Originals + 2026 premium polish. Real recorded child voices later (no TTS). Bilingual ES/EN parent comms. Installable PWA, offline. iPad / iPhone / Android / Chromebook / laptop / smartboard.

## 9. When you fail

1. Say what failed in plain English.
2. Say what you're trying instead.
3. Push the fix in the SAME turn.

No apology spirals. No "I'm sorry I'm sorry I'm sorry". Action.
