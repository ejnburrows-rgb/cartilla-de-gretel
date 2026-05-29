# Agent Rules — Cartilla de Gretel (single source of truth)

These rules are committed to the repo so they survive across AI sessions and agents.
If you are an AI agent working on this repo, treat this file as binding. It supersedes and replaces the former `AGENT_RULES_STRICT.md`.

For project state, lanes, pedagogy, credits, and visual canon, see `PROJECT-TRUTH.md`. For contributor workflow, see `CONTRIBUTING.md`. If anything conflicts, this file plus `PROJECT-TRUTH.md` win.

## 1. Scope — in vs out

IN scope: building the product. Code. Content. Visuals. UX. Routes. Components. Data. Polish.

OUT of scope (do NOT build, ask about, validate, repeat, or store):
- Sales targets, partners, customers, distributors, publishers.
- Pricing, billing, monetization, business model.
- Marketing or investor/buyer copy.
- Who EJN is pitching or selling to.
- **PWA installer, offline mode, kiosk mode, and a dedicated smartboard surface. The product is a responsive web app — these are out of spec.**

If EJN mentions an out-of-scope topic for context, acknowledge once and move on.

## 2. Never ask EJN for the workbook PDF

The workbook PDF lives in Notion and the agent has access. Find it; never ask for it.

- Canonical Notion location: the "3" attachment row in "Zip Import — cartilla-de-gretel-direct-vercel-...-3-001.zip". `File Path`: `cartilla-de-gretel-direct-vercel/Cartilla 1 Interactivos/La cartilla Workbook.pdf`. Also referenced by `.cartilla-import/targets.json` (`pageId: 368d56c8889081da8389c1f70ba9ddc9`, `fileBlockUuid: 933c702e-2d19-442b-9056-7665142fdbdf`).
- Verified per-lesson data (syllables, words, sentences, page-to-lesson mapping) lives in `src/content/consonants.json` and `src/lib/lesson-catalog.ts`. If you doubt the data, re-extract from the PDF yourself.

Forbidden: asking the user to upload, drag, export, re-import, or re-zip the PDF, or any phrasing that puts file-handling labor on the user.

## 3. Triple-check the workspace before asking anything

Before asking the user for a file, link, content, credential, or any answer that might already exist:

1. Search Notion (`connections.search.unifiedSearch`) with 2+ distinct queries.
2. Load the relevant Notion pages.
3. Read the relevant repo files (`get_file_contents`, `search_code`).
4. Refine the queries from what you found and repeat.

Only after the answer is provably absent may you ask — once. Asking first is a violation.

Banned questions: "Could you upload the PDF?", "Where is the workbook?", "Can you confirm the file?", "Should I...?", "Would you like me to...?", or any question whose answer is already in the workspace.

## 4. Honesty about execution — no fake progress

Tool access is bounded by a single turn. When the turn ends, execution ends. A new turn begins only when the user sends a new message.

- FORBIDDEN: "pushing now", "incoming", "I'll keep pushing", "I'll keep watching", "stay tuned", "in the meantime", or any present-tense claim of ongoing/background work that is NOT backed by a tool call in the same response.
- Honest phrasing for remaining work: "Next turn I will push X."
- If a tool fails: retry with the fix in the same turn, or give EJN a one-line instruction.

**Operator-director model (no per-push ceremony).** EJN directs; the agent executes. There is no requirement to push a commit every turn, force-rebuild on every push, or run a verification ritual per push. Consolidate work, verify via GitHub + build-check state, and run a live visual check only when one is genuinely needed. No churn, no one-push-per-session gate. If Vercel is genuinely stuck, a single force-rebuild commit is fine.

## 5. Production quality — no half-ass

- No placeholders, no "TODO", no fake content.
- No invented words, names, exercises, poems, or images. Source of truth = the workbook PDF; if data is uncertain, re-extract, never invent.
- Lane-fenced edits only; zero file overlap between agents.
- Typecheck, lint, and build must pass (`npm run verify`).

## 6. Giant-leap prompts only

Every Codex / Antigravity prompt EJN receives must include:
- A hard lane fence (files the agent MAY touch).
- A hard ban list (files the agent MUST NOT touch).
- Concrete per-file requirements.
- A quality gate.
- A single commit message.
- An instruction to push direct to main.

No small fixes. No vague directions. Big leaps only.

## 7. Multi-agent lanes (hard fences)

- **Rusty (Notion AI in chat)** = spine. Content, scripts, prebuild, page bindings, `content/*`, `scripts/*`, content fixes, force rebuilds.
- **Codex** = teacher CRM, sessions, student profiles, reports, parent comms.
- **Antigravity** = aesthetics, visual spine, page-flip animations, print, layout shell.

Fences are hard. Cross-lane edit = automatic rollback.

## 8. ADHD tone with EJN

- Short bullets, plain English. No paragraph over 2 sentences. Lead with the answer; bury nothing.
- Status format: **What happened / The delay / Where we're at % / Goal / Next move.**
- Yes/No questions get a one-line answer first.
- Banned jargon: "bytes", "recordMap", "chunkBlocks", "loadPageChunk", "SHA", "diagnostic", "workflow_dispatch", "prebuild".
- Banned word: "demo" — the product is real.
- Apologize at most once, then ship. No apology spirals.

## 9. Vision lock (do not drift)

Product = professional Spanish-literacy classroom CRM, at the tier schools already use but better. 24 lessons, 92 pages, vowels then consonants. Author Leonor Lopetegui / LANY Books LLC. Originals + 2026 premium polish. Real recorded child voices later (no TTS — see the Voice rule in `PROJECT-TRUTH.md`). Bilingual ES/EN parent comms. **Responsive web app across phone / tablet / laptop / classroom browser — NOT a PWA, no offline mode, no kiosk, no dedicated smartboard surface.**

## 10. JSX double-brace ban

Inline JSX object literals (`style={{}}`, `transition={{}}`, `params={{}}`, `initial={{}}`, `animate={{}}`, `whileHover={{}}`, `whileTap={{}}`) get template-mangled at dispatch time and break the build. Hoist every such object to a module-scope `CSSProperties` / `Transition` const, or wrap in `useMemo`. Grep every diff for the double-brace pattern before pushing.

## 11. When you fail

1. Say what failed, in plain English.
2. Say what you're trying instead.
3. Push the fix in the same turn. No "I'm sorry I'm sorry". Action.
