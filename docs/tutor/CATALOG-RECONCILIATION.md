# Gretel Tutor — Recording Catalog Reconciliation (PR #1073 + PR #1322 + PR #1323 + B031)

> **Authoritative Single Source of Truth:** `src/content/tutor-dialogue/universal.json` + `src/content/tutor-dialogue/lesson-01.json`–`lesson-24.json`, synchronized 1-to-1 with `docs/tutor/recording/B001`–`B031` `.txt`, `RECORDING-INDEX.csv`, `RECORDING-INDEX.md`, and the 3-batch Priority Recording Package (`PRIORITY-PACKAGE.md`).
>
> **Status:** All `1,418` reconciled v2 utterances remain at `status: "scripted"` with **zero unapproved audio activated**. All `120` legacy `src/content/tutor-lines.json` `lineId`s (`43` owner-approved word models + `77` pending) remain intact and unchanged.

---

## 1. Executive Summary & Reconciled Counts

Two independent recording catalog efforts overlapped under Issue #877, and Priority Batch 3 (`B031`) extends live interactive tutoring:
- **PR #1073** (`feat/gretel-tutor-l1-3`): v2 runtime-ready dialogue manifests (`1,288` lines across 30 recording batches `B001`–`B030`, full pedagogical role coverage, 3-level progressive hints, separated letter-name vs. phonetic-sound models, strict book-fidelity validator).
- **PR #1322** (`origin/tembo/tutor-dialogue-atlas`): `docs/tutor/dialogue/draft-00.jsonl`–`draft-24.jsonl` (`1,208` source-linked context rows across `1,047` distinct Spanish utterances, preserving `workbookPage`, `workbookPdfSheet`, `flipchartSheet`, `answer` → `expectedAnswer`, and `commonError`, with clip deduplication across contexts).
- **PR #1323** (`origin/tembo/tutor-private-intake`): Identical `draft-00..24.jsonl` catalog as PR #1322, adding `README.md` documentation and a local private Vosk/FFmpeg intake script (`scripts/intake-tutor-audio.py`).
- **Interactive Conversation Batch `B031` (+50 lines):** Adds 50 clean Spanish-only conversational utterances (`PRIORITY-B003-interactive-conversation.txt`) for live FaceTime/D-ID tutoring — acknowledgments, curiosity, follow-up questions, alternative explanations, contextual clarification, student interruptions, help requests, transitions, Flip Chart presentation, layout changes (full avatar / split screen / picture-in-picture), Workbook guidance, honest snapshot-only camera interaction, and personalized coaching.

This reconciliation merges PR #1073, PR #1322, and `B031` into **ONE authoritative catalog** and **ONE recording workflow** so the owner never faces competing scripts or records duplicate lines.

| Metric | PR #1073 (Before) | PR #1322 (`tutor-dialogue-atlas`) | Authoritative Reconciled Catalog |
|---|---:|---:|---:|
| **Universal / Interactive / Technical Lines** | 208 (`B001`–`B006`) | 57 contexts (`draft-00.jsonl`) | **290** (`B001`–`B006` + `B031`: +32 PR #1322 + 50 interactive) |
| **Lesson Scripted Lines (L1–L24)** | 1,080 (45/lesson, `B007`–`B030`) | 1,151 contexts (`draft-01..24.jsonl`) | **1,128** (47/lesson, `B007`–`B030`: +48 unique PR #1322 lines) |
| **Total Unique v2 Scripted Utterances** | 1,288 | 1,047 distinct texts | **1,418** (0 duplicate normalized texts) |
| **Legacy `tutor-lines.json` `lineId`s Intact** | 120 (43 approved + 77 pending) | 120 | **120** (43 approved + 77 pending, unchanged) |
| **Total Merged Manifest Entries** | 1,408 | — | **1,538** (`120` legacy + `1,418` v2) |
| **PR #1322 Source-Linked Context Mappings** | 0 | 1,208 | **1,208** (100% preserved in `sourceContexts`) |
| **Shared-Clip Deduplicated Contexts** | 0 | 204 contexts across 43 texts (161 dupes saved) | **204** contexts flagged `sharedClip: true` (**161** duplicate recordings prevented) |
| **Total Recording Batches** | 30 (`B001`–`B030`) | Variable | **31** (`B001`–`B031`, 25–50 lines each) |
| **Total Spoken Words (v2)** | 19,410 | — | **20,723** (~188.4 min at 110 wpm + pauses) |
| **Priority Starter Package** | — | — | **3 batches / 133 lines** (`PRIORITY-B001` + `PRIORITY-B002` + `PRIORITY-B003`, 1,740 words, ~15.8 min) |
| **Active Unapproved Audio** | 0 | 0 | **0** (all 1,418 v2 lines `status: "scripted"`) |
| **Unsupported Observation / Clarity Claims** | — | — | **0** (enforced in validator + tests) |
| **References to Absent Workbook pp. 86–87** | 0 | 0 | **0** (blocked in schema + validator + tests) |
| **Quarantined Audio (`nina-sordita.mp3`, 67-clip ZIP)** | 0 | 0 | **0** (blocked in schema + validator + tests) |

---

## 2. Preserved PR #1322 Source-Linked Context Mappings

Every single one of PR #1322's **1,208** verified context rows is preserved in `src/content/tutor-dialogue/universal.json` and `lesson-01.json`–`lesson-24.json` under the typed `sourceContexts` field (validated by `SourceContextMappingSchema` in `src/content/tutor-dialogue/schema.ts`):

| PR #1322 Metadata Field | Preserved Schema Field | Preserved Count | Notes |
|---|---|---:|---|
| `lineId` | `sourceContexts[].sourceLineId` | **1,208** | 100% of PR #1322 stable context IDs preserved |
| `workbookPage` | `sourceContexts[].workbookPage` | **971** | Verified printed Workbook pages only (0 refs to pp. 86–87) |
| `workbookPdfSheet` | `sourceContexts[].workbookPdfSheet` | **971** | Exact original PDF sheet IDs from reconstruction mapping |
| `flipchartSheet` | `sourceContexts[].flipchartSheet` | **180** | Exact Teacher Flip Chart sheet IDs (Sheets 3–62) |
| `answer` | `sourceContexts[].expectedAnswer` | **433** | Exact expected spoken/written answers for prompts |
| `commonError` | `sourceContexts[].commonError` | **204** | Expected learner error patterns for coaching |
| Shared-text reuse | `sourceContexts[].sharedClip` | **204** | 43 texts reused across 204 contexts → **161** duplicate clips eliminated |

### Unique Verified Dialogue Merged Directly from PR #1322 (+80 lines) + B031 (+50 lines)
- **Universal & Technical (+32 lines in `universal.json` from PR #1322):**
  - `B003` (+10 → 40 lines): 5 `clarify` turns (`dialogue-universal-clarify-01..05`) + 5 `understanding-check` turns.
  - `B005` (+14 → 42 lines): camera preview/off/denied, snapshot positioning/uncertain, offline-ready/offline-missing, mic-denied/start, privacy/paper-no-name, and session recovery turns.
  - `B006` (+8 → 38 lines): curiosity, small-talk, interrupt/resume/switch, text-alternative, retry-choice, and harder-word prompts.
- **Interactive Conversation (`B031`, +50 lines in `universal.json`):**
  - `B031` (50 lines): natural acknowledgments, curiosity & spontaneous expressions, follow-up questions, alternative explanations, contextual clarification, student interruptions, requests for help, conversation-to-teaching transitions, Flip Chart presentation, layout transitions (full avatar / split screen / picture-in-picture), Workbook guidance, honest snapshot-only camera interaction, and personalized coaching.
- **Lessons 1–24 (+48 lines, +2 per lesson → 47 lines/lesson in `B007`–`B030`):**
  - 1 verified Flip Chart comprehension/find prompt per lesson (`atlas-flipchart-check`) carrying `flipchartSheet` + `expectedAnswer`.
  - 1 verified Workbook activity prompt per lesson (`atlas-workbook-check`) carrying `workbookPage`, `workbookPdfSheet`, `expectedAnswer`, and `commonError` (for Lessons 7–24 fill activities).
- **Deduplication Guarantee:** All `1,418` v2 entries carry `normalizedText` and are enforced to be 100% unique by normalized Spanish text in both `scripts/validate-tutor-book-fidelity.mjs` and `src/lib/__tests__/tutor-dialogue-manifest.test.ts`. No identical Spanish text is ever recorded twice.

---

## 3. Recording Workflow & Priority Package

1. **Start with the 3-Batch Priority Recording Package** ([`recording/PRIORITY-PACKAGE.md`](./recording/PRIORITY-PACKAGE.md)):
   - [`recording/PRIORITY-B001-universal.txt`](./recording/PRIORITY-B001-universal.txt) (`B001`, 36 lines, 426 words, ~3.9 min)
   - [`recording/PRIORITY-B002-lesson-01.txt`](./recording/PRIORITY-B002-lesson-01.txt) (`B007`, 47 lines, 680 words, ~6.2 min)
   - [`recording/PRIORITY-B003-interactive-conversation.txt`](./recording/PRIORITY-B003-interactive-conversation.txt) (`B031`, 50 lines, 634 words, ~5.8 min)
   - Total starter session: **133 lines (1,740 words, ~15.8 min)** — clean Spanish only, ready for ElevenReader, matching `RECORDING-INDEX.csv` 1-to-1.
2. **Private Master Vault & Local Intake:**
   - Raw takes live outside Git in `~/GretelVoicePrivate/`.
   - Alignment, checksum verification, clipping checks, and review extraction run locally via `scripts/tutor-intake/` before any clip is marked `status: "approved"`.
3. **Full 31-Batch Library:**
   - Once the owner approves the Priority Package playback in Lesson 1 and live conversation, continue with the remaining 28 batches (`B002`–`B006`, `B008`–`B030`) in [`recording/RECORDING-INDEX.md`](./recording/RECORDING-INDEX.md) without re-recording `B001`, `B007`, or `B031`.

---

## 4. Coordination Notes for Viktor & Gitar (Issue #877)

To prevent duplicate catalogs and conflicting recording indices under **Issue #877**:

1. **Superseding PR #1322 (`origin/tembo/tutor-dialogue-atlas`):**
   - **Action:** Close/supersede PR #1322 in favor of this reconciled catalog on `feat/gretel-tutor-l1-3`.
   - **Why nothing is lost:** All `1,208` `draft-00..24.jsonl` context mappings (`workbookPage`, `workbookPdfSheet`, `flipchartSheet`, `expectedAnswer`, `commonError`, `sourceLineId`) and `80` unique verified utterances (32 universal/technical + 48 lesson flipchart/workbook prompts) are now preserved directly inside `src/content/tutor-dialogue/` with Zod schema validation, book-fidelity validation, and 1-to-1 `RECORDING-INDEX.csv` synchronization.
2. **Superseding PR #1323 (`origin/tembo/tutor-private-intake`):**
   - **Action:** Close/supersede PR #1323's duplicate `docs/tutor/dialogue/draft-00..24.jsonl` files. If Viktor/Gitar want to keep PR #1323's standalone Vosk helper (`scripts/intake-tutor-audio.py`), it can be pointed directly at `docs/tutor/recording/RECORDING-INDEX.csv` (the single authoritative index) instead of maintaining a second `docs/tutor/dialogue/` export pipeline.
3. **Single Contract Going Forward:**
   - **Authoritative manifests:** `src/content/tutor-dialogue/universal.json` + `lesson-01..24.json` (plus intact legacy `src/content/tutor-lines.json`).
   - **Authoritative recording index:** `docs/tutor/recording/RECORDING-INDEX.csv` & `RECORDING-INDEX.md` (with `PRIORITY-PACKAGE.md` as the owner's entry point).
   - **Required CI gates before any catalog change:**
     - `node scripts/validate-tutor-book-fidelity.mjs`
     - `node scripts/validate-tutor-lines.mjs`
     - `pnpm vitest run src/lib/__tests__/tutor-dialogue-manifest.test.ts`
