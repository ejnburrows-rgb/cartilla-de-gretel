# Gretel Asset Recovery Report

**Date:** 2026-11-26  
**Worktree / Branch:** `/Users/ejn/Desktop/Gretel/gretel-tutor` (`feat/gretel-tutor-l1-3`)  
**Policy Alignment:** Updated `AGENTS.md` (§8) and `docs/GRETEL_VOICE_DECISION.md` with the 2026-11-26 Owner Clarification & Authorization; `pnpm verify:policy` passed (95/95 tests + active-doc & locked-visual checks).

---

## Authorized Sources Audited

1. **Google Drive (`gdrive` CLI):** Connected account `rodetucker@gmail.com` (root listing, `Google AI Studio` folder tree `1YQIyMxJBjIomCk5NhK077K9DrWH_XQ7j`, PDF/folder/filename searches, shared drives, and direct lookup of repo-recorded Drive IDs).
   - *Key Access Finding:* The repo-recorded Google Drive file IDs for the original PDFs (`13mj0ewFUI2Txa5OsEgGpt6i64qfGYh-b`, `1TAd5RmCLzOaq0JobfLw_2qBme_Y0fCqb`) return **HTTP 404 (`notFound`)** under `rodetucker@gmail.com`, indicating those files live on a different owner Google account or are not shared with `rodetucker@gmail.com`.
2. **Local Folders (read-only inspection):**
   - `/Users/ejn/Desktop/Gretel` (`cartilla-main`, `gretel-tutor`, `delivery_staging`, `lany-books-web`, `offline_cartilla.zip`)
   - `~/Downloads` (`PNGs/`, `Images/`, `PDFs/`, `Cartilla_Gretel_Original_Assets_Agent_Handoff_2026-11-20.zip`, `gretel-recording-desk.zip`)
   - `~/Documents` (including `Codex/`)
   - `~/Desktop`
   - `~/teamwork_projects` (`cartilla_de_gretel`, `cartilla-step-b`, `lany_books_review`)
   - `~/GretelVoicePrivate/` (not yet created on this machine)
3. **Remote GitHub Branches & Commits (read-only `git ls-tree` / `git cat-file`):**
   - `origin/audio/owner-instructions-20261019`
   - `origin/feat/gretel-resumable-cloned-voice-20261014` (PR #769 head `237920f723aec8cebb2d2ef71e6ed63a1073a478`)
   - `origin/voice/lesson-3-owner-only`
   - `origin/feature/issue-1035-welcome-video-7305563812994230697`
   - `origin/swarm/track-h-video-slot`
   - `origin/ws2b-recovery-7816-pdf-thumbnails`

---

## (A) Recovered Assets (Exact Paths & Drive File IDs)

### 1. Gretel Portraits & Layered Puppet Artwork

| Asset | Exact Path / Drive File ID | Details & Verification |
| :--- | :--- | :--- |
| **Owner-Approved Gretel Master (Full-Body)** | `public/cartilla/images/gretel/gretel-approved-master.png` (identical copy at `~/Downloads/Images/All-Images/ae36cd_gretel-approved-master.png`) · Drive ID `1UDgi3wPfKhrp9P_fovYisN5E0G0Wnw6W` (`Folk Art Girl with Red Bow.png`) | 1086×1448 PNG, SHA-256 `ff59ea11dd1ebe90d71c3a22489d03f42f063b30b44a51ca7f3d84b2b440dcdd`. Approved by Emilio on 2026-09-30 (`src/data/gretel-approved-master.json`). |
| **Layered Gretel Rig Parts (Torso-Up Components)** | `~/Downloads/PNGs/` (`torso_3 (1).png` 281×345, `torso_3 (2).png` 313×393, `head_1.png`, `head_1 (1).png`, `head_1 (2).png`, `hair_2 (1).png`, `hair_2 (2).png`, `eyes_open_*.png`, `eyes_closed_*.png`, `eyebrows_*.png`, `mouth_open_*.png`, `mouth_closed_*.png`, `hand_open_*.png`, `hand_closed_*.png`) | Cutout puppet parts from 2026-10-29. Not yet activated in `public/cartilla/images/gretel/layers/` (requires owner visual approval before activation). |
| **Additional Local Gretel Reference Images (Unapproved for Tutor Master)** | `~/Downloads/Gretel Teaching.webp` (765×1024, SHA-256 `2156219c63a0b5e5f679ea289a6e8a9d205d951779013a26b7d00d87cf9e0c38`); `~/Downloads/PNGs/image(10).png` (1086×1448 classroom photo-style); `/Users/ejn/Desktop/Gretel/lany-books-web/public/images/gretel/gretel-headset.jpg` (cover crop) | Reference only; do not activate as tutor face art without explicit owner approval. |
| **Folk Art Alternate (Drive Record Only)** | Drive ID `1k1v7RSCFvNMMfDLcZKWt1RV7Hpj4st-j` (`Gretel in Folk Art Style.png`, SHA-256 `d383a5c2c28d4b189e094c14ad22b5d94d0d23ea6eedb926df15ce5ca6b5d43c`) | Recorded in `docs/artwork-reconciliation/ARTWORK_AUDIT_2026-10-16.md:646`. |

### 2. Existing Approved Voice Recordings & Audio Assets

| Asset Set | Exact Path / Branch | Count & Status |
| :--- | :--- | :--- |
| **Approved Picture Vocabulary Recordings (Candidate B)** | `/Users/ejn/Desktop/Gretel/gretel-tutor/public/audio/voz/vocabulario/*.mp3` (also in `cartilla-main`) | **161 approved MP3s** (approved 2026-10-04, PR #503). *Note: 162 MP3s exist in the folder because 1 file (`nina-sordita.mp3`) is permanently quarantined/retired and must never be played.* |
| **Tutor L1–L3 Viseme Sidecars** | `/Users/ejn/Desktop/Gretel/gretel-tutor/public/audio/voz/tutor/leccion-{1,2,3}/*.visemes.json` | **43 viseme JSON files** paired with existing approved vocabulary recordings. |
| **Workbook Instruction Cuts (`line-01`..`line-40`)** | Git branch `origin/audio/owner-instructions-20261019:public/audio/instrucciones/line-01.mp3`..`line-40.mp3` AND local disk `~/teamwork_projects/cartilla_de_gretel/public/audio/instrucciones/` | **40 MP3 files** cut from owner WhatsApp master `audio-b10640b9.mp3` (2026-10-19), mapped in `src/content/instruction-recordings.json` on that branch. Not yet copied into `gretel-tutor/public/audio/`. Human auditory quality approval remains noted as pending in `OWNER-INSTRUCTION-RECOVERY.md`. |
| **Lesson 3 Explicit Instruction & Praise Cuts** | Git branch `origin/audio/owner-instructions-20261019:public/audio/leccion3/{muy-bien,p7-instr,p8-instr,p9-instr1,p9-instr2}.mp3` AND local disk `~/teamwork_projects/cartilla_de_gretel/public/audio/leccion3/` | **5 MP3 files** cut from owner Lesson 3 source `audio-cfcac090.mp3` (2026-10-19). Not yet copied into `gretel-tutor/public/audio/`. |
| **UI Interaction & Piano Audio** | `public/audio/feel/*.mp3` (8 files), `public/audio/{ambient-classroom,page-turn,page-turn-soft}.mp3` (3 files), `src/components/cartilla/piano/piano-samples.ts` (6 Steinway PCM buffers) | Connected and active on `feat/gretel-tutor-l1-3`. |

### 3. PDF Drive IDs Found in Repo Records (Not Downloadable via Connected Account)

| Document | Recorded Drive File ID | Local Check Result |
| :--- | :--- | :--- |
| **Original Student Workbook PDF** (`Libro del alumno - Rescan and Optimize (2).pdf`, 98 pages, canonical 15,500,956 bytes, SHA-256 `cbe050520bafefaea9c19c75eee6dd48ab3476a6377dc45009d176c18aab0a3b`) | `13mj0ewFUI2Txa5OsEgGpt6i64qfGYh-b` (`https://drive.google.com/file/d/13mj0ewFUI2Txa5OsEgGpt6i64qfGYh-b/view`) | **Not present locally** (`public/book/book.pdf` absent; local `~/Documents/la_cartilla_de_Gretel2(1).pdf` and `.agents/teamwork/explorer_survey_3/la_cartilla_de_Gretel2.pdf` are a different 5.4 MB copy, SHA-256 `1820820f...`). Drive ID returns HTTP 404 on `rodetucker@gmail.com`. |
| **Original Teacher Flip Chart PDF** (`La Cartilla de Gretel Flip Chart.pdf`, 62 pages) | `1TAd5RmCLzOaq0JobfLw_2qBme_Y0fCqb` (`https://drive.google.com/file/d/1TAd5RmCLzOaq0JobfLw_2qBme_Y0fCqb/view`) | **Not present locally** (only derived comparison/proof PDFs and extracted sheet art exist locally). Drive ID returns HTTP 404 on `rodetucker@gmail.com`. |

### 4. Quarantined / Rejected Sources (Confirmed Excluded)

- `Gretel_67_Audio_Lecciones_Listo.zip` and PR #769 (`237920f7`) `public/audio/gretel/clips/rec_*` / `rec_gretel_*` — **permanently rejected/quarantined** (stuttering/music/wrong cuts).
- `public/audio/voz/vocabulario/nina-sordita.mp3` — **permanently retired/quarantined** (replaced by "niña distraída").
- `Gretel_558674_Original.m4a` is **not** committed in PR #769 (`237920f7`) or any git branch (by design, as a private voice original).

---

## (B) Consolidated List of Genuinely Unrecoverable Files (Single Owner Request)

None of the five items below could be recovered from Google Drive (`rodetucker@gmail.com`), local folders, or remote GitHub branches. **Do not commit private voice originals or large raw PDFs into git** — store private voice files in `~/GretelVoicePrivate/` and raw PDFs outside git (or share their Google Drive links with `rodetucker@gmail.com`).

| # | File / Asset Needed | Why It Is Necessary | Easiest Way to Provide |
| :--- | :--- | :--- | :--- |
| 1 | **Latest torso-up Gretel portrait** *(only if newer than `gretel-approved-master.png`)* | Sets the exact approved upper-body framing and facial look for the live Gretel Tutor avatar so we do not guess or crop from an older illustration. *(If `gretel-approved-master.png` is still the latest approved artwork, just confirm and we can use it directly.)* | Share the image file or confirm `gretel-approved-master.png` is final. |
| 2 | **D-ID interaction reference video** (agent `v2_agt_090x6mtn`, `https://studio.d-id.com/agents/share`) | Provides the concrete visual reference for head movement, blink rhythm, lip-sync expressiveness, and warm idle motion so our native offline Gretel Tutor puppet matches the feel you approved. | Export/record a short clip (15–30 s) from D-ID or share an accessible link/file. |
| 3 | **`Gretel_558674_Original.m4a`** *(expected SHA-256 `239e3518f364adfcefab39f4220a4b2b85a6e3987679af823d7ef0f26f76935d`, ~32.5 min / 47.1 MB)* | Needed in `~/GretelVoicePrivate/` **only if** you want us to mine and transcript-verify reusable spoken lines from that earlier master recording. *(Optional if you prefer supplying fresh ElevenReader recordings from the new tutor scripts.)* | Place in `~/GretelVoicePrivate/Gretel_558674_Original.m4a` or share via Drive (never commit to git). |
| 4 | **Original Student Workbook PDF** (`Libro del alumno - Rescan and Optimize (2).pdf`, Drive ID `13mj0ewFUI2Txa5OsEgGpt6i64qfGYh-b`) | Required to verify exact printed workbook page fidelity, layout/page-number reconciliation, and `scripts/prebuild-fetch-pdfs.mjs` SHA-256 validation (`cbe05052...`). | Share Drive file `13mj0ewFUI2Txa5OsEgGpt6i64qfGYh-b` with `rodetucker@gmail.com` or place locally outside git. |
| 5 | **Original Teacher Flip Chart PDF** (`La Cartilla de Gretel Flip Chart.pdf`, Drive ID `1TAd5RmCLzOaq0JobfLw_2qBme_Y0fCqb`) | Required to cross-check Teacher Flip Chart scenes, text, and lesson scripts against the original 62-page physical source. | Share Drive file `1TAd5RmCLzOaq0JobfLw_2qBme_Y0fCqb` with `rodetucker@gmail.com` or place locally outside git. |
