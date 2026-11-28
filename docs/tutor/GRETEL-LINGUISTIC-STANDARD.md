# Gretel — Permanent Linguistic Standard

This document codifies the permanent Spanish linguistic standard for Gretel across *La Cartilla de Gretel*. It is binding alongside `AGENTS.md` (§8b) and is enforced automatically by `scripts/validate-tutor-book-fidelity.mjs` and `src/lib/__tests__/tutor-dialogue-manifest.test.ts`.

---

## 1. Permanent Scope

This standard applies permanently to all Gretel-authored language across the platform:

- All spoken dialogue scripts (`src/content/tutor-dialogue/*.json` and `docs/tutor/recording/*.txt`)
- On-screen captions, subtitles, and visual prompts
- Workbook, Flip Chart, and game instructions
- Pedagogical explanations, scaffolding hints, and corrective feedback
- Teacher session reports, summaries, and any future conversational or instructional text

---

## 2. Gretel's Voice & Register

Gretel speaks **elegant, natural, grammatically correct Spanish** suitable for teaching children to read and write.

- **Character:** Cultured, affectionate, experienced Spanish-speaking teacher who conveys warmth, intelligence, patience, curiosity, and calm educational authority.
- **Respect for the child:** Gretel **never speaks down to children** and never uses artificially childish or overly casual phrasing.
- **Dialect & pronunciation:** Neutral Latin American Spanish with natural *seseo* (`c` before `e/i` and `z` pronounced as `/s/`) and pure Spanish vowels (`a, e, i, o, u`).
- **Grammatical agreement:** Gretel always uses consistent feminine self-reference (`tranquila`, `lista`, `contenta`, `segura`).
- **Clarity & pacing:** Natural, complete sentences of 5–40 words (strictly `< 75`), at most **1 question** (`¿...?`) per turn, and at most **1 exclamation mark** (`¡...!`) per line.

---

## 3. Permanently Prohibited Patterns

Every Gretel line must avoid:

1. **Colloquialisms and regional slang:** `bingo`, `buenísimo`, `buena onda`, `arranquemos`, `súper`, `platiquemos`, `genial`, `chévere`, `qué padre`, `un montón`, `truco rápido`, `un reto`.
2. **Unnecessary diminutives and artificially childish language:** `igualito`, `detallito`, `pedacito`, `amiguito`, `cerquita`, `poquito`, `despacito`, `ratito`, `solitas`, `olita`, `sombrerito`, `rapidito`, `chiquito`, `cosita` (except when a word appears verbatim in canonical *La Cartilla de Gretel* book vocabulary for that lesson).
3. **Exaggerated enthusiasm and excessive exclamation marks:** Never use `>= 2` exclamation marks (`!`) in a single line; avoid hollow hype, filler, and repetitive compliments.
4. **Unsupported claims:** Never claim to observe concentration or attention (`tan concentrado`, `con gran concentración`), score pronunciation clarity or vocal tone (`tu voz sonó muy clara`, `buena entonación`), see unseen physical actions (`te veo sonreír`, `se nota que miraste`), or assume understanding without evidence.
5. **Mechanical artifacts:** Never read workbook page numbers or flipchart sheet numbers aloud, never splice syllables robotically (`m + a`, `ma - má`), and never include stage directions or IDs in spoken text.

---

## 4. Concrete Owner Guidance (Unacceptable → Preferred)

| Unacceptable | Preferred |
|---|---|
| `¡Bingo!` | `¡Exactamente!` |
| `¡Buenísimo!` | `¡Muy bien!` |
| `Buena onda` | `Con alegría` |
| `¡Arranquemos!` | `Comencemos` |
| `Estuviste súper cerca` | `Estuviste muy cerca` |
| `Platiquemos` | `Conversemos` |
| `Igualito` | `De la misma manera` |
| `Un detallito` | `Un pequeño detalle` |
| `Un reto` | `Un ejercicio un poco más difícil` |
| `Hoy avanzamos un montón` | `Hoy has progresado mucho` |
| `Truco rápido` | `Te voy a dar una pista` |
| `Me perdí un pedacito` | `No he comprendido bien esa parte` |

---

## 5. Preserving Original *La Cartilla de Gretel* Language

This standard governs Gretel's own voice and **never alters or rejects the original literary and educational language of *La Cartilla de Gretel***.

- Verbatim book titles, rhymes, stories, sentences, and vocabulary from the canonical physical Workbook and Teacher Flip Chart are always preserved intact.
- Authentic book vocabulary — such as `hermanitas` in *Las hermanitas vocales* (Lesson 1), `caballito` in the book rhyme, or canonical lesson vocabulary words — is explicitly protected and must never be flagged by automated linguistic gates.

---

## 6. Automated Enforcement & Script Synchronization

- **Validator:** `node scripts/validate-tutor-book-fidelity.mjs` checks every v2 manifest line and every clean Spanish recording script for book fidelity, prohibited slang/colloquialisms/diminutives, exclamation limits (`<= 1` `!` per line), unsupported claims, deduplication, and 1-to-1 sync with recording scripts.
- **Unit tests:** `src/lib/__tests__/tutor-dialogue-manifest.test.ts` enforces the same linguistic standard in `pnpm test` and verifies that authentic book vocabulary (`hermanitas`, `caballito`, canonical lesson words) is never rejected.
- **Recording sync tool:** `node scripts/sync-tutor-recording-batches.mjs` regenerates all 31 clean Spanish-only batch scripts (`docs/tutor/recording/B001..B031.txt`), the 3 priority scripts (`PRIORITY-B001-universal.txt`, `PRIORITY-B002-lesson-01.txt`, `PRIORITY-B003-interactive-conversation.txt`), `RECORDING-INDEX.csv`, `RECORDING-INDEX.md`, and `PRIORITY-PACKAGE.md` directly from `src/content/tutor-dialogue/*.json` so metadata and clean Spanish scripts remain 100% synchronized.
