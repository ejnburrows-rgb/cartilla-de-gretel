# Gretel Tutor — Audio Reconciliation & Quarantine Dossier

Complete SHA-256 audit of every audio and viseme asset in the repository, permanent quarantine enforcement, and per-lesson recording/offline footprint estimates.

## 1. Permanent Quarantine & Rejection Registry

These materials and technologies MUST NEVER be played, restitched, deployed, or counted as active audio:

| Asset / Technology | Location / Pattern | SHA-256 / Size | Status | Governance Rule |
|---|---|---|---|---|
| `Gretel_67_Audio_Lecciones_Listo.zip` (`rec_gretel_*`) | Absent from worktree; blocked by `validate-tutor-lines.mjs` | N/A (external) | **REJECTED / QUARANTINED** | Owner rejected 2026-10-15 (stuttering, music bleed, wrong cuts). Never use. |
| `nina-sordita.mp3` | `public/audio/voz/vocabulario/nina-sordita.mp3` | `40400ef648db825bf5da6b732db97bc66b097192f3f6288b7bdb44d6788bbc91` (17,957 B) | **QUARANTINED / UNUSED** | Retired 2026-10-22 (character renamed to 'niña distraída'); excluded from manifests and playback. |
| `silent.mp3` | `public/cartilla/audio/silent.mp3` | `63880acd0ec6c2248590cb3396b91eb51ea7ed8ac48bbeefe9167666c665000e` (328 B) | **UNUSED / BYPASSED** | Silent placeholder bypassed by Silent Respect audio policy. |
| `tinywow_audio_recording.mp3` | Absent from worktree | N/A (external) | **REJECTED / QUARANTINED** | Lossy third-party transcoding distortion (2026-10-19). |
| `browser_cloud_tts_generators` | Prohibited by `AUDIO_POLICY` (`allowTts: false`) | Code policy | **PROHIBITED** | Recorded human audio only; missing clips resolve silently. |

## 2. Repository Audio Inventory Summary

- **Files on disk under `public/audio/**` and `public/cartilla/audio/**`**: **217** (174 `.mp3` files + 43 `.visemes.json` files)
- **Approved playable vocabulary MP3s**: **161** (43 wired in `tutor-lines.json` for L1–3 + 118 additional Candidate B recordings in `picture-name-recordings.json`)
- **UI & Core MP3s**: **11** (1 full acoustic `page-turn-soft.mp3`; 2 84-byte silent single-frame stubs `ambient-classroom.mp3` & `page-turn.mp3`; 8 19-byte `feel/*.mp3` ASCII placeholder stubs marked `source-pending`)
- **Quarantined / Unused MP3s on disk**: **2** (`nina-sordita.mp3` quarantined; `silent.mp3` bypassed)
- **Embedded Steinway PCM bank**: `src/components/cartilla/piano/piano-samples.ts` (SHA-256 `1eedc3a6a88300272a9edcdcb6ff525f0a0423787c77b5125ba22a8ac6ec416d`, 314,604 B)
- **External / Unmerged Audio**: `Gretel_558674_Original.m4a` (expected SHA-256 `239e3518f364adfcefab39f4220a4b2b85a6e3987679af823d7ef0f26f76935d`) remains `source-pending` until transcript alignment; `origin/audio/owner-instructions-20261019` instruction cuts (40+5) are not in this worktree.

## 3. Per-Lesson Line Counts, Recording Minutes & Offline MB

Shared universal tutor bank (`lesson 0` in `tutor-lines.json`): **68 pending lines**, ~**2.88 min**, ~**1.088 MB** projected audio+visemes (plus one-time ~32–40 MB offline Vosk Spanish model).

| Lesson | Title | Total Planned Lines | Approved on Disk | Pending to Record | Manifest Wired (L1–3) | Est. Recording Min | On-Disk Audio MB | Est. Full Offline MB |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | Las hermanitas vocales | 28 | 19 | 9 | 36 | 1.15 | 0.204 | 0.440 |
| 2 | Oo | 12 | 7 | 5 | 4 | 0.72 | 0.077 | 0.266 |
| 3 | Aa | 13 | 8 | 5 | 3 | 0.73 | 0.082 | 0.272 |
| 4 | Ee | 12 | 7 | 5 | 0 | 0.72 | 0.078 | 0.268 |
| 5 | Ii | 13 | 8 | 5 | 0 | 0.74 | 0.083 | 0.274 |
| 6 | Uu | 10 | 5 | 5 | 0 | 0.65 | 0.051 | 0.238 |
| 7 | Mm | 49 | 6 | 43 | 0 | 1.86 | 0.057 | 0.710 |
| 8 | Pp | 44 | 6 | 38 | 0 | 1.70 | 0.052 | 0.648 |
| 9 | Ss | 61 | 7 | 54 | 0 | 2.30 | 0.068 | 0.877 |
| 10 | Tt | 53 | 5 | 48 | 0 | 2.02 | 0.042 | 0.768 |
| 11 | Dd | 51 | 6 | 45 | 0 | 1.97 | 0.056 | 0.751 |
| 12 | Ll | 53 | 5 | 48 | 0 | 2.06 | 0.046 | 0.784 |
| 13 | Nn | 55 | 6 | 49 | 0 | 2.12 | 0.057 | 0.807 |
| 14 | Ññ | 54 | 8 | 46 | 0 | 2.04 | 0.079 | 0.779 |
| 15 | Bb | 60 | 10 | 50 | 0 | 2.30 | 0.101 | 0.875 |
| 16 | Vv | 52 | 5 | 47 | 0 | 2.00 | 0.044 | 0.763 |
| 17 | R inicial | 53 | 6 | 47 | 0 | 2.09 | 0.059 | 0.796 |
| 18 | rr | 53 | 7 | 46 | 0 | 2.11 | 0.068 | 0.802 |
| 19 | Gg | 41 | 7 | 34 | 0 | 1.84 | 0.072 | 0.693 |
| 20 | Ff | 53 | 5 | 48 | 0 | 2.08 | 0.048 | 0.793 |
| 21 | Jj | 51 | 6 | 45 | 0 | 2.10 | 0.061 | 0.794 |
| 22 | Cc | 44 | 6 | 38 | 0 | 1.84 | 0.056 | 0.696 |
| 23 | Yy | 52 | 5 | 47 | 0 | 2.15 | 0.053 | 0.814 |
| 24 | Zz | 46 | 6 | 40 | 0 | 1.85 | 0.061 | 0.704 |
| **Total (L1–24)** | **All 24 Lessons** | **1013** | **166** | **847** | **43** | **41.14** | **1.654** | **15.612** |
| **Grand Total (+Shared)** | **L1–24 + Shared Bank** | **1081** | **166** | **915** | **43** | **44.02** | **1.654** | **16.700** |

> Note: Per-lesson "Approved on Disk" counts unique approved Candidate B words in `picture-name-recordings.json` matching each lesson's workbook + flipchart items (some vocabulary words recur across lessons, so the sum across lessons exceeds the 161 unique files on disk). In `tutor-lines.json`, Lesson 1 wires 36 entries (19 target words + 17 page 1–3 distractor words) reused across Lessons 2 (4 new) and 3 (3 new) for 43 total.

## 4. Missing Flip Chart & Scene Recordings (`source-pending`, 38 items)

| Pronunciation Key | Suggested File | Content Reference | Status |
|---|---|---|---|
| a la fiesta scene | `audio/voz/vocabulario/a-la-fiesta-scene.mp3` | Flip Chart 50 / production content | `source-pending` |
| abejas z | `audio/voz/vocabulario/abejas-z.mp3` | Flip Chart 60 / production content | `source-pending` |
| burro b | `audio/voz/vocabulario/burro-b.mp3` | Flip Chart 33 / production content | `source-pending` |
| campana d | `audio/voz/vocabulario/campana-d.mp3` | Flip Chart 21 / production content | `source-pending` |
| carro calabaza scene | `audio/voz/vocabulario/carro-calabaza-scene.mp3` | Flip Chart 62 / production content | `source-pending` |
| carro rr | `audio/voz/vocabulario/carro-rr.mp3` | Flip Chart 42 / production content | `source-pending` |
| flor abeja f | `audio/voz/vocabulario/flor-abeja-f.mp3` | Flip Chart 48 / production content | `source-pending` |
| gallina c | `audio/voz/vocabulario/gallina-c.mp3` | Flip Chart 54 / production content | `source-pending` |
| gato enamorado scene | `audio/voz/vocabulario/gato-enamorado-scene.mp3` | Flip Chart 47 / production content | `source-pending` |
| jicotea jabela scene | `audio/voz/vocabulario/jicotea-jabela-scene.mp3` | Flip Chart 53 / production content | `source-pending` |
| jirafa j | `audio/voz/vocabulario/jirafa-j.mp3` | Flip Chart 51 / production content | `source-pending` |
| leo lee gretel scene | `audio/voz/vocabulario/leo-lee-gretel-scene.mp3` | Flip Chart 26 / production content | `source-pending` |
| los caramelos scene | `audio/voz/vocabulario/los-caramelos-scene.mp3` | Flip Chart 56 / production content | `source-pending` |
| made y papa scene | `audio/voz/vocabulario/made-y-papa-scene.mp3` | Flip Chart 23 / production content | `source-pending` |
| mi bote de vela scene | `audio/voz/vocabulario/mi-bote-de-vela-scene.mp3` | Flip Chart 38 / production content | `source-pending` |
| mi mama scene | `audio/voz/vocabulario/mi-mama-scene.mp3` | Flip Chart 11 / production content | `source-pending` |
| mi papa scene | `audio/voz/vocabulario/mi-papa-scene.mp3` | Flip Chart 14 / production content | `source-pending` |
| nina enmarcada ny | `audio/voz/vocabulario/nina-enmarcada-ny.mp3` | Flip Chart 30 / production content | `source-pending` |
| nina l | `audio/voz/vocabulario/nina-l.mp3` | Flip Chart 24 / production content | `source-pending` |
| nina suena scene | `audio/voz/vocabulario/nina-suena-scene.mp3` | Flip Chart 32 / production content | `source-pending` |
| nino nada scene | `audio/voz/vocabulario/nino-nada-scene.mp3` | Flip Chart 29 / production content | `source-pending` |
| nino tambor t | `audio/voz/vocabulario/nino-tambor-t.mp3` | Flip Chart 18 / production content | `source-pending` |
| nino yoyo y | `audio/voz/vocabulario/nino-yoyo-y.mp3` | Flip Chart 57 / production content | `source-pending` |
| niña distraída | `audio/voz/vocabulario/niña-distraída.mp3` | Flip Chart 6 / production content | `source-pending` |
| oso (parpadeo) | `audio/voz/vocabulario/oso-parpadeo.mp3` | Verified faithful-art content | `source-pending` |
| pollito p | `audio/voz/vocabulario/pollito-p.mp3` | Flip Chart 12 / production content | `source-pending` |
| rapido arriba scene | `audio/voz/vocabulario/rapido-arriba-scene.mp3` | Flip Chart 44 / production content | `source-pending` |
| raton r | `audio/voz/vocabulario/raton-r.mp3` | Flip Chart 39 / production content | `source-pending` |
| rosca manolo scene | `audio/voz/vocabulario/rosca-manolo-scene.mp3` | Flip Chart 41 / production content | `source-pending` |
| saltamontes g | `audio/voz/vocabulario/saltamontes-g.mp3` | Flip Chart 45 / production content | `source-pending` |
| sapo samapo scene | `audio/voz/vocabulario/sapo-samapo-scene.mp3` | Flip Chart 17 / production content | `source-pending` |
| serpiente s | `audio/voz/vocabulario/serpiente-s.mp3` | Flip Chart 15 / production content | `source-pending` |
| sopa de pato scene | `audio/voz/vocabulario/sopa-de-pato-scene.mp3` | Flip Chart 20 / production content | `source-pending` |
| sube la bola scene | `audio/voz/vocabulario/sube-la-bola-scene.mp3` | Flip Chart 35 / production content | `source-pending` |
| ternero n | `audio/voz/vocabulario/ternero-n.mp3` | Flip Chart 27 / production content | `source-pending` |
| toro m | `audio/voz/vocabulario/toro-m.mp3` | Flip Chart 9 / production content | `source-pending` |
| viento v | `audio/voz/vocabulario/viento-v.mp3` | Flip Chart 36 / production content | `source-pending` |
| yate de yayo scene | `audio/voz/vocabulario/yate-de-yayo-scene.mp3` | Flip Chart 59 / production content | `source-pending` |

## 5. Complete Checksum Registry of Existing Audio Assets

### 5.1 Core UI & Feel Audio (11 MP3s + 1 Unused Fallback + 1 Quarantined)

| Path | Classification | Status | Bytes | Duration (s) | SHA-256 |
|---|---|---|---:|---:|---|
| `public/audio/ambient-classroom.mp3` | `placeholder-stub-core-ui` | `source-pending` | 84 | 0 | `230b1bea7ad077e03262ef492e7b2efac11329b5a594d97559cdc97a0c950222` |
| `public/audio/feel/chime.mp3` | `placeholder-stub-ui-feel` | `source-pending` | 19 | 0 | `7abd58bdd207f3aa548f688c857f195b539bea7b23ced75b93e134ee798b7266` |
| `public/audio/feel/drag-drop.mp3` | `placeholder-stub-ui-feel` | `source-pending` | 19 | 0 | `7abd58bdd207f3aa548f688c857f195b539bea7b23ced75b93e134ee798b7266` |
| `public/audio/feel/drag-pick.mp3` | `placeholder-stub-ui-feel` | `source-pending` | 19 | 0 | `7abd58bdd207f3aa548f688c857f195b539bea7b23ced75b93e134ee798b7266` |
| `public/audio/feel/error.mp3` | `placeholder-stub-ui-feel` | `source-pending` | 19 | 0 | `7abd58bdd207f3aa548f688c857f195b539bea7b23ced75b93e134ee798b7266` |
| `public/audio/feel/page-flip.mp3` | `placeholder-stub-ui-feel` | `source-pending` | 19 | 0 | `7abd58bdd207f3aa548f688c857f195b539bea7b23ced75b93e134ee798b7266` |
| `public/audio/feel/sparkle.mp3` | `placeholder-stub-ui-feel` | `source-pending` | 19 | 0 | `7abd58bdd207f3aa548f688c857f195b539bea7b23ced75b93e134ee798b7266` |
| `public/audio/feel/success.mp3` | `placeholder-stub-ui-feel` | `source-pending` | 19 | 0 | `7abd58bdd207f3aa548f688c857f195b539bea7b23ced75b93e134ee798b7266` |
| `public/audio/feel/tap.mp3` | `placeholder-stub-ui-feel` | `source-pending` | 19 | 0 | `7abd58bdd207f3aa548f688c857f195b539bea7b23ced75b93e134ee798b7266` |
| `public/audio/page-turn-soft.mp3` | `connected-core-ui` | `approved` | 43518 | 1.88 | `0e6737d635998d90f015249c0215691d3cb63d2ff37d49949914284160b6e9e0` |
| `public/audio/page-turn.mp3` | `placeholder-stub-core-ui` | `source-pending` | 84 | 0 | `230b1bea7ad077e03262ef492e7b2efac11329b5a594d97559cdc97a0c950222` |
| `public/audio/voz/vocabulario/nina-sordita.mp3` | `quarantined-retired` | `quarantined` | 17957 | 2.76 | `40400ef648db825bf5da6b732db97bc66b097192f3f6288b7bdb44d6788bbc91` |
| `public/cartilla/audio/silent.mp3` | `unused-bypassed` | `unused` | 328 | 0 | `63880acd0ec6c2248590cb3396b91eb51ea7ed8ac48bbeefe9167666c665000e` |

### 5.2 Approved Vocabulary Recordings (`public/audio/voz/vocabulario/*.mp3`, 161 files)

| Key | Path | Classification | Bytes | Duration (s) | Sample Rate | Bitrate (kbps) | SHA-256 |
|---|---|---|---:|---:|---:|---:|---|
| abanico | `public/audio/voz/vocabulario/abanico.mp3` | `connected-vocab-and-tutor` | 13085 | 2.14 | 24000 | 49 | `bf276de36789171dec29d8483243e1d054e00e801567ae65068becba7b2ecbfe` |
| abeja | `public/audio/voz/vocabulario/abeja.mp3` | `connected-vocab-and-tutor` | 10229 | 1.66 | 24000 | 49 | `da8c8bddb923a8a45f217920ca3c757fabf941773adbccc13927ecacf566b4a7` |
| abrigo | `public/audio/voz/vocabulario/abrigo.mp3` | `connected-vocab-and-tutor` | 10709 | 1.73 | 24000 | 49 | `d3025613688f631dcb2a7b4a13b6a54b7254f28cd69d224dfe9a2b138f247ad2` |
| águila | `public/audio/voz/vocabulario/águila.mp3` | `connected-vocab-approved` | 8597 | 1.37 | 24000 | 50 | `f3cb78ae4abeaff825afe47b7927d8e7913d5922eafbdd1216389f105c26ef18` |
| aguja | `public/audio/voz/vocabulario/aguja.mp3` | `connected-vocab-and-tutor` | 10589 | 1.73 | 24000 | 49 | `cec6e62a75ea88aadf9851e76b0808968ee103d20d2caad54e3b0793b6bd502d` |
| ajo | `public/audio/voz/vocabulario/ajo.mp3` | `connected-vocab-approved` | 7853 | 1.34 | 24000 | 46 | `2e6cd8b2b2afc195b08c9f38e5b9a8956e26dbb6299e4cc0786a22bb388c7e6a` |
| ala | `public/audio/voz/vocabulario/ala.mp3` | `connected-vocab-approved` | 7757 | 1.34 | 24000 | 46 | `cb87fc5dce6b1717dfcd83818587aad3b153a52b4a1bd257ce3c06d088339c01` |
| alas | `public/audio/voz/vocabulario/alas.mp3` | `connected-vocab-and-tutor` | 11189 | 1.78 | 24000 | 50 | `bc9d790b5a278fa40cc388f49d5ea8038e5928720be75af87700c16812949f44` |
| amo | `public/audio/voz/vocabulario/amo.mp3` | `connected-vocab-approved` | 8453 | 1.39 | 24000 | 48 | `14140f61cff12a4a1f1353db9edf4299c3f31e060cd7b92e63cb5f34903f2a46` |
| ana | `public/audio/voz/vocabulario/ana.mp3` | `connected-vocab-approved` | 7997 | 1.27 | 24000 | 50 | `1455c1979229376bf00f745cf545f777a9a891196add5fb09b8581711049b778` |
| anillo | `public/audio/voz/vocabulario/anillo.mp3` | `connected-vocab-and-tutor` | 10685 | 1.73 | 24000 | 49 | `7d2c09d85739a68753429e7ccf2eabfdd90d79b36dcb8fc90480f24e2e74fd18` |
| araña | `public/audio/voz/vocabulario/araña.mp3` | `connected-vocab-and-tutor` | 9725 | 1.58 | 24000 | 49 | `d35b8529dbb1e1c3c25efbda52866687cd2b075541e06cf08c7c1e841fbe93e8` |
| árbol | `public/audio/voz/vocabulario/árbol.mp3` | `connected-vocab-and-tutor` | 10061 | 1.68 | 24000 | 48 | `2137cbbc136d54e9a1e32e889997fa056bba03c012bdbf04f661804ef8f7319c` |
| ardilla | `public/audio/voz/vocabulario/ardilla.mp3` | `connected-vocab-and-tutor` | 11429 | 1.87 | 24000 | 49 | `1cabe368982b6774aa2f160e9c2faa42d614c19e819cb0065202f0126e19eddd` |
| aro | `public/audio/voz/vocabulario/aro.mp3` | `connected-vocab-and-tutor` | 7949 | 1.34 | 24000 | 47 | `bc9daeee4863af2ef6fbdf728825dea0eb99d0b38f4dae801edf891d686ea2fc` |
| arre caballito | `public/audio/voz/vocabulario/arre-caballito.mp3` | `connected-vocab-approved` | 24605 | 3.72 | 24000 | 53 | `52b7256696cca7a12f61ed144581d71ab563b9f4c4b31c4dfb44fd2de7bf5f99` |
| avión | `public/audio/voz/vocabulario/avión.mp3` | `connected-vocab-and-tutor` | 9629 | 1.58 | 24000 | 48 | `c6f4ea04b8eaed7a5314ea934c9d6a41b4e704f2dce4f68de882979c4eafb20a` |
| barril | `public/audio/voz/vocabulario/barril.mp3` | `connected-vocab-approved` | 10805 | 1.78 | 24000 | 48 | `308fdf3909c3891d66b8fdb00b25b468be636e16df263eb46552b54054a2fe43` |
| bate | `public/audio/voz/vocabulario/bate.mp3` | `connected-vocab-approved` | 8861 | 1.56 | 24000 | 45 | `de0c9eca19cacc581bc814cbbc0e31329499b6ac10b7cbf33122061eb649759f` |
| beba | `public/audio/voz/vocabulario/beba.mp3` | `connected-vocab-approved` | 11117 | 1.87 | 24000 | 47 | `97dded34197a2ab2d337de232818d79d65895f2e89ca3eabb55711d61a7aa03f` |
| bebé | `public/audio/voz/vocabulario/bebé.mp3` | `connected-vocab-approved` | 10157 | 1.66 | 24000 | 49 | `3351f87e505abdf96268e6dff37a1290642ecefd597969e147a13fe90712a8fe` |
| bebita | `public/audio/voz/vocabulario/bebita.mp3` | `connected-vocab-approved` | 11909 | 1.92 | 24000 | 49 | `b9159ae57089b3e0638c62184e6625bd10be73099b5f2bd83b86851209b6d080` |
| bota | `public/audio/voz/vocabulario/bota.mp3` | `connected-vocab-approved` | 10541 | 1.78 | 24000 | 47 | `794d1687c6299aac227fd00a4c6b680a0bc5cbee91c4b790ea2048054dc01309` |
| brujita | `public/audio/voz/vocabulario/brujita.mp3` | `connected-vocab-approved` | 11645 | 1.94 | 24000 | 48 | `c273ec9f5fba8fba4c40fbe88d1a3cac38aa941395251ffc3b632e5284384eb9` |
| bubi | `public/audio/voz/vocabulario/bubi.mp3` | `connected-vocab-approved` | 10733 | 1.78 | 24000 | 48 | `b28a26aee1e87da4c969de1a77ccdfa2eca76bda4bbfe79ed09cb7f4b4a9d1ef` |
| burro | `public/audio/voz/vocabulario/burro.mp3` | `connected-vocab-approved` | 9989 | 1.66 | 24000 | 48 | `39ce800f17b9b0b2c406a5ca72d1e0245009c647dcccb2aa1a7c90d18ae72b45` |
| carro | `public/audio/voz/vocabulario/carro.mp3` | `connected-vocab-and-tutor` | 8933 | 1.46 | 24000 | 48 | `9499110592d6b25611294dee6b2ee157d37a6d190e6687272bf62d0c30db5ebc` |
| carrusel | `public/audio/voz/vocabulario/carrusel.mp3` | `connected-vocab-approved` | 11597 | 1.73 | 24000 | 53 | `b45bab106012bbb929e4c2ac2c05295a206d88c5072abd00895bfe356b3246e8` |
| casa | `public/audio/voz/vocabulario/casa.mp3` | `connected-vocab-and-tutor` | 8909 | 1.44 | 24000 | 49 | `5ff480b64afcfffc27cdb6dd798b97d5f086d119ed93a485b76232a5e6a8d84b` |
| catalina | `public/audio/voz/vocabulario/catalina.mp3` | `connected-vocab-approved` | 10997 | 1.75 | 24000 | 50 | `b8c5e5ab2d3b19edaba1df06d94bd43445e3a213061f81896fd858b3aae9e61a` |
| conejo | `public/audio/voz/vocabulario/conejo.mp3` | `connected-vocab-approved` | 11861 | 1.87 | 24000 | 50 | `5c4be19d9347a21000ab99676c005e6ad93864c7d394455cb075b149120d4105` |
| cubo | `public/audio/voz/vocabulario/cubo.mp3` | `connected-vocab-approved` | 8957 | 1.46 | 24000 | 49 | `0812e558621d2f7e25f032af4a5c462f8c2a01e504a6547585dee83bf057ee1d` |
| cuna | `public/audio/voz/vocabulario/cuna.mp3` | `connected-vocab-approved` | 9365 | 1.54 | 24000 | 48 | `9e89cd1c8079b2994cb74998a1e952aea1feb13f09fc02225642d9cd8d918182` |
| dado | `public/audio/voz/vocabulario/dado.mp3` | `connected-vocab-approved` | 8093 | 1.34 | 24000 | 48 | `e79ac3f1a89e8418452ca097b8e8bb45b07e2858e6507162f2405030d6faa398` |
| dados | `public/audio/voz/vocabulario/dados.mp3` | `connected-vocab-approved` | 10925 | 1.73 | 24000 | 50 | `5de438e8ba133a83ec9c60d09742161d60ee97f1e6a37cf10d03d0bea3466b05` |
| dedo | `public/audio/voz/vocabulario/dedo.mp3` | `connected-vocab-approved` | 8429 | 1.39 | 24000 | 48 | `70808e03f7b7bc79cd6c6214878e45cefc3d45c23d3bf32d5b799734e2e89d2c` |
| didi | `public/audio/voz/vocabulario/didi.mp3` | `connected-vocab-approved` | 8621 | 1.46 | 24000 | 47 | `2f6833ee5ac3cabfacdfba519e33b7a12447ef119b02ea7953e870ba484bca41` |
| doce | `public/audio/voz/vocabulario/doce.mp3` | `connected-vocab-approved` | 10421 | 1.75 | 24000 | 47 | `3cc069327a05d26b1d3cf4c0d12345f66cc2bbdcf1acd095c2054368994901f4` |
| dulce | `public/audio/voz/vocabulario/dulce.mp3` | `connected-vocab-and-tutor` | 11357 | 1.87 | 24000 | 48 | `ecf139f996a121b116feb1c73265c3195a8939d03ed5481344410aba62fea288` |
| dunia | `public/audio/voz/vocabulario/dunia.mp3` | `connected-vocab-approved` | 12077 | 1.99 | 24000 | 48 | `217148e699ad9e6f7a56f360424abed1e5a3987d75a6e64c22503b132e52bcac` |
| elefante | `public/audio/voz/vocabulario/elefante.mp3` | `connected-vocab-and-tutor` | 13133 | 2.14 | 24000 | 49 | `ad9c36697a284150c3fc67d168f733dd85a28958ae8981948ddd594c632ff208` |
| ema | `public/audio/voz/vocabulario/ema.mp3` | `connected-vocab-approved` | 7757 | 1.27 | 24000 | 48 | `e15c391b3d1e159403934a338100501929f37ffca6defd5cb400991de67a167a` |
| erizo | `public/audio/voz/vocabulario/erizo.mp3` | `connected-vocab-approved` | 11525 | 1.87 | 24000 | 49 | `9b86ae6dbd559febb978c22e6855d21df703ef431146dea4d7dd3c9bae145ec4` |
| escalera | `public/audio/voz/vocabulario/escalera.mp3` | `connected-vocab-and-tutor` | 11237 | 1.78 | 24000 | 50 | `b582c7fe5045be284065ea63123616772aa8ec902384620b1b9c4b1dbee9040c` |
| escoba | `public/audio/voz/vocabulario/escoba.mp3` | `connected-vocab-and-tutor` | 11549 | 1.78 | 24000 | 52 | `cfd04fea55ed0196dd43766249d8c068cb94737680a8c7d538071646e685d800` |
| escuela | `public/audio/voz/vocabulario/escuela.mp3` | `connected-vocab-and-tutor` | 10733 | 1.78 | 24000 | 48 | `fe900a5a5a1c22fab64b5d8a1271e8ac4b509a0883975e5d4d309f5bb4fd0bf6` |
| espejo | `public/audio/voz/vocabulario/espejo.mp3` | `connected-vocab-approved` | 12101 | 1.97 | 24000 | 49 | `149ac9b802aadba0bd6efd37875b1bdb31b7d2a9ca293d0bc412f3b6a969844d` |
| estrella | `public/audio/voz/vocabulario/estrella.mp3` | `connected-vocab-and-tutor` | 11309 | 1.87 | 24000 | 48 | `d6efdf026fc5da58adb1adaa8405150c731f1b3c3e11f5042130e2c463cf7e63` |
| familia | `public/audio/voz/vocabulario/familia.mp3` | `connected-vocab-approved` | 9893 | 1.56 | 24000 | 50 | `d3df647bc50f9c6ebaad2630fd8e0b91590daf0ef20ce011187bc8a49f42b0f2` |
| felo | `public/audio/voz/vocabulario/felo.mp3` | `connected-vocab-approved` | 8453 | 1.34 | 24000 | 50 | `3570584db76cabd79f45d2cff3773926cb05c38a8ec7570acf95066e09f04658` |
| fideos | `public/audio/voz/vocabulario/fideos.mp3` | `connected-vocab-approved` | 13205 | 2.06 | 24000 | 51 | `0a5ccafacbacdb46780c6c65f0f1daa18add96d5b9a81c34d397a828ff17c3b2` |
| fiesta | `public/audio/voz/vocabulario/fiesta.mp3` | `connected-vocab-approved` | 11933 | 1.94 | 24000 | 49 | `ab06af4b8924fcee455e9d8470d0ab03af2cfd8c026c1c1824280eab5373b69d` |
| foto | `public/audio/voz/vocabulario/foto.mp3` | `connected-vocab-approved` | 8861 | 1.46 | 24000 | 48 | `2b3c80fd411fcb9edbc91cfba69f4fb7ca2312626a933a115eb1c9382ca532e4` |
| funda | `public/audio/voz/vocabulario/funda.mp3` | `connected-vocab-approved` | 10013 | 1.66 | 24000 | 48 | `bd494d216bfd20e66ec7f9884b3764aac5daa55f8ce40798c153d48eed88cc91` |
| gato | `public/audio/voz/vocabulario/gato.mp3` | `connected-vocab-approved` | 7781 | 1.34 | 24000 | 46 | `219118719219f24270936ee96d35d8cc622efb954c46e9b82b1c3d58bae406a0` |
| gaveta | `public/audio/voz/vocabulario/gaveta.mp3` | `connected-vocab-approved` | 9197 | 1.54 | 24000 | 48 | `01c5658f7a973a6483ac27f99625eed9af58427340ef31e3ba09b5ebd0db6eb4` |
| globo | `public/audio/voz/vocabulario/globo.mp3` | `connected-vocab-and-tutor` | 9221 | 1.54 | 24000 | 48 | `4a59d559512b99b493c37a7ba10b6fa2bcce266d743d0df5666f15e7218d2b77` |
| goloso | `public/audio/voz/vocabulario/goloso.mp3` | `connected-vocab-approved` | 14549 | 2.26 | 24000 | 51 | `69a163c896f0fedbc2162e549c8c09d0d07e5a3dcd000f905fb1c5a7cadb94f9` |
| gorra | `public/audio/voz/vocabulario/gorra.mp3` | `connected-vocab-approved` | 11645 | 1.92 | 24000 | 48 | `8a4ed3b3d3136a8357994e34d08c45631a7531b0a9eec76675844add840fc45e` |
| gusano | `public/audio/voz/vocabulario/gusano.mp3` | `connected-vocab-approved` | 11453 | 1.85 | 24000 | 49 | `1f35c783044c297fcbae120d869e973a5f2e2d7b7374e4a69fca3499ffbd483d` |
| hermanitas vocales | `public/audio/voz/vocabulario/hermanitas-vocales.mp3` | `connected-vocab-approved` | 21125 | 3.26 | 24000 | 52 | `02bc5dd1ebb882e1cc825a66bd5c39f9bbb6232e4f172033b437483da133ad60` |
| iglesia | `public/audio/voz/vocabulario/iglesia.mp3` | `connected-vocab-and-tutor` | 12005 | 1.94 | 24000 | 49 | `e44544523f41fd88a422a220c6f5a3d54cac299573dc21957a4fb527d4d2c94d` |
| iglú | `public/audio/voz/vocabulario/iglú.mp3` | `connected-vocab-and-tutor` | 10445 | 1.73 | 24000 | 48 | `87005e8f2c51086826951dc8b549390cd4721e0f962d1e8e795355e9c198e187` |
| igual | `public/audio/voz/vocabulario/igual.mp3` | `connected-vocab-approved` | 9725 | 1.58 | 24000 | 49 | `288b54f7096d28929d13ef90dc902e4ddb1052d01e56bf01255c282515b54565` |
| iguana | `public/audio/voz/vocabulario/iguana.mp3` | `connected-vocab-approved` | 10661 | 1.66 | 24000 | 51 | `34042ffa1b1a09bdcd531f844aa5bf6dafd09bd59990570bbccfc8ac529afc07` |
| imán | `public/audio/voz/vocabulario/imán.mp3` | `connected-vocab-and-tutor` | 10205 | 1.66 | 24000 | 49 | `4e356a305449b3a657348a55da22a40f9b9a407dcd19d213139172057498bc43` |
| indio | `public/audio/voz/vocabulario/indio.mp3` | `connected-vocab-and-tutor` | 9773 | 1.58 | 24000 | 49 | `e5953fc78997eeb2c90f2df085a80d0e589013cf3878dd7446fed10f1f50b95b` |
| insecto | `public/audio/voz/vocabulario/insecto.mp3` | `connected-vocab-approved` | 14741 | 2.45 | 24000 | 48 | `8c724476c9e11cf0e5d244a038e074665a60f255af44cff70c678129a3b8f97d` |
| invierno | `public/audio/voz/vocabulario/invierno.mp3` | `connected-vocab-approved` | 12269 | 1.97 | 24000 | 50 | `8079f35316d32a918d0743d7dbb6d90e5048700ee429601ca65c56b81e6cc4ae` |
| irma | `public/audio/voz/vocabulario/irma.mp3` | `connected-vocab-approved` | 9989 | 1.58 | 24000 | 50 | `d78cb8dd9ddc856f7aa2ee0e6aee93f1ee48e4fa7ba8ab0e40c50bee9ad799a1` |
| isla | `public/audio/voz/vocabulario/isla.mp3` | `connected-vocab-and-tutor` | 9293 | 1.58 | 24000 | 47 | `e569c1bec49019fa107317f5349a943a8b43deaa11b31d5bfcb754d7c7bd1f34` |
| jarra | `public/audio/voz/vocabulario/jarra.mp3` | `connected-vocab-approved` | 10421 | 1.73 | 24000 | 48 | `5ef292545ab647e5ebc1fb9fdea1dfdab7f887f6d470b9eb767762e466a37724` |
| jesús | `public/audio/voz/vocabulario/jesús.mp3` | `connected-vocab-approved` | 11621 | 1.85 | 24000 | 50 | `5f3c8bec8d9492e489e9be4e6a5ef3f48b051a6f52a9b07716250b7f899ca3a3` |
| jicotea | `public/audio/voz/vocabulario/jicotea.mp3` | `connected-vocab-approved` | 12701 | 2.06 | 24000 | 49 | `a34d5ad0fb1a6f81015c065755e8ab3a40aff2e92bbb4f90a84ec9f570c277b7` |
| jirafa | `public/audio/voz/vocabulario/jirafa.mp3` | `connected-vocab-approved` | 11813 | 1.87 | 24000 | 50 | `1d6aba80c656010a206a8e6722b95aabc46009cf0a1f061bb33d36cfa167d9f9` |
| jugo | `public/audio/voz/vocabulario/jugo.mp3` | `connected-vocab-approved` | 9101 | 1.54 | 24000 | 47 | `cd48418019f88190d54cabd8a037ba497fec967caf65dff5f35b473c01ee7a88` |
| lala | `public/audio/voz/vocabulario/lala.mp3` | `connected-vocab-approved` | 9701 | 1.58 | 24000 | 49 | `8e13ee0cf7c4eb687d86fe45ac411f854776f190bc944fe7b7605c5e35db2ad7` |
| lata | `public/audio/voz/vocabulario/lata.mp3` | `connected-vocab-approved` | 9029 | 1.46 | 24000 | 49 | `05e61816e81f81e5a9be3696dd5d849e5cf5d728d2136132ac62e1b4e78f308c` |
| libro | `public/audio/voz/vocabulario/libro.mp3` | `connected-vocab-and-tutor` | 8981 | 1.46 | 24000 | 49 | `4abd3646f35860e02690c827aebfe8c3bf5d7c0b30315baf63ababf747c8a24f` |
| loma | `public/audio/voz/vocabulario/loma.mp3` | `connected-vocab-approved` | 8621 | 1.39 | 24000 | 49 | `8c8faa8d7921a273d8ad7f2a5e0c6bedd97c3dd0f51ac24a344725a222b59eec` |
| luli | `public/audio/voz/vocabulario/luli.mp3` | `connected-vocab-approved` | 9173 | 1.54 | 24000 | 47 | `d12632a0ba8a2f2834874a6fbb9e9c48dd3b6f6c54b93dba980d01f4d57d8b48` |
| mago | `public/audio/voz/vocabulario/mago.mp3` | `connected-vocab-approved` | 10349 | 1.66 | 24000 | 50 | `b1d4ed438691c32398492f2a693df2962378d0da8ea589d7edfab8c487f16239` |
| maíz | `public/audio/voz/vocabulario/maíz.mp3` | `connected-vocab-and-tutor` | 11933 | 1.94 | 24000 | 49 | `a6ce00f0844ec304f5b9007aa767f188262772ba3f7ff59d6449c0890292cad5` |
| maleta | `public/audio/voz/vocabulario/maleta.mp3` | `connected-vocab-approved` | 11645 | 1.94 | 24000 | 48 | `ab3ba71e766b02bde461d197cff1e0c4998d6e667ffd2a444aa6e6984467fff3` |
| mamá | `public/audio/voz/vocabulario/mamá.mp3` | `connected-vocab-approved` | 9413 | 1.54 | 24000 | 49 | `7d217a14cb11013dd46822a2e2406ee3e48e3705088811957400ae4dfbf3da0c` |
| manzana | `public/audio/voz/vocabulario/manzana.mp3` | `connected-vocab-and-tutor` | 12989 | 1.97 | 24000 | 52 | `5e470b837e3fc8ae046b5038dbee2988c9848dce9b969c258732300c7e027559` |
| mayúscula | `public/audio/voz/vocabulario/mayúscula.mp3` | `connected-vocab-approved` | 13253 | 2.06 | 24000 | 51 | `1083d7fa056fb9c416b1b217068a949b2987957b5c5e57542460d9fcd112b115` |
| meme | `public/audio/voz/vocabulario/meme.mp3` | `connected-vocab-approved` | 8477 | 1.46 | 24000 | 46 | `c911b62a7645b024a6feb0506bdd0970b1a12310d623f0761081da0d924d72eb` |
| meñe | `public/audio/voz/vocabulario/meñe.mp3` | `connected-vocab-approved` | 9629 | 1.56 | 24000 | 49 | `ada4045b0ab3f44624730ce159c5cd4ee354f39fa737dc5e068ea78b79de763f` |
| mima | `public/audio/voz/vocabulario/mima.mp3` | `connected-vocab-approved` | 11813 | 1.92 | 24000 | 49 | `8ac5273b7a1ece0b34df25e103e31ef108793e06d7f943f2dacf28dedf9b6d92` |
| mono | `public/audio/voz/vocabulario/mono.mp3` | `connected-vocab-approved` | 8765 | 1.44 | 24000 | 48 | `04b7a49ad12d461fba1918cfb9cf08e96d7f4eb4c73bf20a547c40e33d171adb` |
| moño | `public/audio/voz/vocabulario/moño.mp3` | `connected-vocab-approved` | 9869 | 1.58 | 24000 | 49 | `2141e4cdbe96380871e01d27ef984b148c00d7e49f84f706eddb21288fea738e` |
| mumi | `public/audio/voz/vocabulario/mumi.mp3` | `connected-vocab-approved` | 12629 | 2.06 | 24000 | 49 | `5e2c16c51c732b171987161fd034afda6d067af86623702e088867c400cbd09d` |
| napi | `public/audio/voz/vocabulario/napi.mp3` | `connected-vocab-approved` | 10973 | 1.78 | 24000 | 49 | `2c71b97176ab81caf22619fe4faf79fa7908ecbd634ad0b66670ffad52163345` |
| nido | `public/audio/voz/vocabulario/nido.mp3` | `connected-vocab-approved` | 9701 | 1.58 | 24000 | 49 | `7c2c0116dd76c62dad9dc2e972331df9479e719e3e301217846a5b686339f58e` |
| nina enfermita | `public/audio/voz/vocabulario/nina-enfermita.mp3` | `connected-vocab-approved` | 20141 | 3.19 | 24000 | 50 | `b3e4d93eb9cbb9af21dbbd2f5e89f0144e069a78f813ae7127f9c0286c44ec90` |
| nina llorona | `public/audio/voz/vocabulario/nina-llorona.mp3` | `connected-vocab-approved` | 15437 | 2.38 | 24000 | 52 | `1351d12efe79b425609cf76f32e4bdc7f9c65c8c9713a2aa44d97a3e2b0a1973` |
| niñito | `public/audio/voz/vocabulario/niñito.mp3` | `connected-vocab-approved` | 10757 | 1.78 | 24000 | 48 | `8a569454091575d615fe38a73bd252070ea3e2c752d76e2441ae52e879ca4a40` |
| niño | `public/audio/voz/vocabulario/niño.mp3` | `connected-vocab-approved` | 10925 | 1.78 | 24000 | 49 | `e1f619c22708d4f4f33a00c18b46a12b9f56242c41f60c92a956097a24142809` |
| nudo | `public/audio/voz/vocabulario/nudo.mp3` | `connected-vocab-approved` | 9605 | 1.58 | 24000 | 48 | `5591afb87e3c885c57fce05d50d121e0f5756df89011b6da393d5f223fccd7ac` |
| ñuno | `public/audio/voz/vocabulario/ñuno.mp3` | `connected-vocab-approved` | 10517 | 1.73 | 24000 | 48 | `78e3aa6d59c2654d7161e1996802c022ce9359f0babd7ae79ed467e020f6dd3a` |
| ocho | `public/audio/voz/vocabulario/ocho.mp3` | `connected-vocab-and-tutor` | 8741 | 1.46 | 24000 | 47 | `2073854848b32d2935369e13a7c7e2b6a1fb2e3c0a3a73c7ed887b71e88f49e5` |
| ojos | `public/audio/voz/vocabulario/ojos.mp3` | `connected-vocab-and-tutor` | 10853 | 1.75 | 24000 | 49 | `1217d61f284e79e0d233d49f1d55224ebe98fe56d8514078cb9d5e90a2010941` |
| ola | `public/audio/voz/vocabulario/ola.mp3` | `connected-vocab-and-tutor` | 18533 | 2.74 | 24000 | 54 | `c872613f0644e657116d86adbf0fa8165afdbc9189827dd09b46bca989655654` |
| olla | `public/audio/voz/vocabulario/olla.mp3` | `connected-vocab-and-tutor` | 9077 | 1.54 | 24000 | 47 | `ec4ee54ac7c150ee4c7170c9a798cf72d67ef42dae35659a5bda5c169176f61f` |
| oreja | `public/audio/voz/vocabulario/oreja.mp3` | `connected-vocab-and-tutor` | 11669 | 1.92 | 24000 | 48 | `2b8ba5853420bc069407949442d32f69dc7e5df8fa841aab5998cb3ef2a50cfd` |
| oruga | `public/audio/voz/vocabulario/oruga.mp3` | `connected-vocab-and-tutor` | 11717 | 1.87 | 24000 | 50 | `ffe70192ea9e6f03fae781e34efa9d5c5c46ca7145e7af0022004a288ba3ff62` |
| oso | `public/audio/voz/vocabulario/oso.mp3` | `connected-vocab-and-tutor` | 9821 | 1.58 | 24000 | 49 | `49c2fd2c1336e1992e172d1f4232f68f5df9beb990bff96b38fbab34f9036b3c` |
| oto | `public/audio/voz/vocabulario/oto.mp3` | `connected-vocab-approved` | 8021 | 1.37 | 24000 | 46 | `67a501609f26325e59325196d38237729f47818789266809745eaeaa245e1ae6` |
| oveja | `public/audio/voz/vocabulario/oveja.mp3` | `connected-vocab-and-tutor` | 11021 | 1.8 | 24000 | 49 | `504402b0d328c6913b6244b9ea70d6ab3103a300c0699f88de79449f0f3c90e8` |
| pájaro | `public/audio/voz/vocabulario/pájaro.mp3` | `connected-vocab-and-tutor` | 10421 | 1.75 | 24000 | 47 | `9531324c382de650558d6fac30eec5cfa5134e2b2b9311575b7a988cdfad1af5` |
| papá | `public/audio/voz/vocabulario/papá.mp3` | `connected-vocab-approved` | 10709 | 1.8 | 24000 | 47 | `c22aca725d76ccb2708d16a2c8dd8e834db9091ec034a230d3fa6244d1ee3a8f` |
| pavo | `public/audio/voz/vocabulario/pavo.mp3` | `connected-vocab-approved` | 8525 | 1.37 | 24000 | 49 | `f6c51dc52a6544e007fbf8c1ef0a2cd7fe44ff67597426886c480dfa7ee480a7` |
| pepe | `public/audio/voz/vocabulario/pepe.mp3` | `connected-vocab-approved` | 8189 | 1.39 | 24000 | 47 | `68ed29a0c255516bcd578060dd4c193b5e0b64099375cbe38de1e7d76a4d1f41` |
| pera | `public/audio/voz/vocabulario/pera.mp3` | `connected-vocab-and-tutor` | 7877 | 1.34 | 24000 | 46 | `8db196c877a12f339785fa243da936a6b9af25bf3b9a1e4b6124266eaa4c5450` |
| perro | `public/audio/voz/vocabulario/perro.mp3` | `connected-vocab-approved` | 10349 | 1.73 | 24000 | 48 | `7a660c029a5f0fac4efb3ae65931c9daf4ad7027bbde27f5ffb6ab5ab1b1bb61` |
| pie | `public/audio/voz/vocabulario/pie.mp3` | `connected-vocab-approved` | 7493 | 1.25 | 24000 | 48 | `5a106485e6ab8d75dac71f9ef62ab361e7b6954a0f6ef63bd972e188e83c090a` |
| piñata | `public/audio/voz/vocabulario/piñata.mp3` | `connected-vocab-approved` | 13061 | 2.14 | 24000 | 49 | `8f2c7cb4847ec5d95daf9e12108c875001ea50ad6a4efdb5663e969e387f2396` |
| pisa | `public/audio/voz/vocabulario/pisa.mp3` | `connected-vocab-approved` | 8453 | 1.39 | 24000 | 48 | `b76b0e9c279440a9c63f2edb159895e23c6d7e6cb4aebb5b8aefa982233053a2` |
| pomo | `public/audio/voz/vocabulario/pomo.mp3` | `connected-vocab-approved` | 8021 | 1.34 | 24000 | 47 | `d788223b37848cc3527e86ef426685e689d0c4c944d96bc502be0c052a93200f` |
| puma | `public/audio/voz/vocabulario/puma.mp3` | `connected-vocab-approved` | 10805 | 1.73 | 24000 | 50 | `2542f4432353208c4c33c817762524250434f19b05672418b5fc194eb40a0e50` |
| rana | `public/audio/voz/vocabulario/rana.mp3` | `connected-vocab-approved` | 10397 | 1.68 | 24000 | 49 | `399f29bbd68bdca16cf3c3c1d1cc6b5fabcb465c7456a16a7e4fdbd7fcf397d1` |
| remo | `public/audio/voz/vocabulario/remo.mp3` | `connected-vocab-approved` | 9317 | 1.54 | 24000 | 48 | `c63cb89fd0c3e9515065bfe138987efb8695f412870bb376394025974e7e15cb` |
| remos | `public/audio/voz/vocabulario/remos.mp3` | `connected-vocab-approved` | 12341 | 1.87 | 24000 | 52 | `3b7c73280576cb8ea95779b479bea1158601c4367537614771379bafbc886961` |
| rita | `public/audio/voz/vocabulario/rita.mp3` | `connected-vocab-approved` | 9077 | 1.54 | 24000 | 47 | `15566ea25dee3bdeaba74887c99f152442edf49d59866585a71bff3806dad70e` |
| rosa | `public/audio/voz/vocabulario/rosa.mp3` | `connected-vocab-approved` | 11285 | 1.75 | 24000 | 51 | `1819d4e891fb263805a974cf880250fa98d80124045f7dddafcb638d2486ef65` |
| rueda | `public/audio/voz/vocabulario/rueda.mp3` | `connected-vocab-approved` | 9677 | 1.54 | 24000 | 50 | `c0eb936e0abb0b7a7c11bce935d8d2ee19051479d812b47a07e90bb92617abe9` |
| sapo | `public/audio/voz/vocabulario/sapo.mp3` | `connected-vocab-approved` | 9365 | 1.54 | 24000 | 48 | `c7ae356c9257ee3b045b505a2fae31ad744ac5379c9cd3708ecfb374a46f6cfe` |
| sesi | `public/audio/voz/vocabulario/sesi.mp3` | `connected-vocab-approved` | 9341 | 1.54 | 24000 | 48 | `5f27c7916876c9e3fbd71387fdcb7ec18800de2b23b39c46520a5aa0e4fa64cf` |
| sopa | `public/audio/voz/vocabulario/sopa.mp3` | `connected-vocab-approved` | 11645 | 1.87 | 24000 | 49 | `bdafb45df36199221c893c013d99e9ad290df490110ab9cc09b8afae6acf8a32` |
| susi | `public/audio/voz/vocabulario/susi.mp3` | `connected-vocab-approved` | 13229 | 2.14 | 24000 | 49 | `10c335d525a643bd5a6c087433de5be462dca054f6262b780953072d91666e52` |
| tapa | `public/audio/voz/vocabulario/tapa.mp3` | `connected-vocab-approved` | 7637 | 1.34 | 24000 | 45 | `ddf76475330ccb488f7bc13daf1ef87d6d38eb35de49f0661642f7539c3680b2` |
| taza | `public/audio/voz/vocabulario/taza.mp3` | `connected-vocab-and-tutor` | 8285 | 1.37 | 24000 | 48 | `06b5ca78a651e6c45a89e5259ae2678336c9422bbbb62e8ef2d5c26b720fb2dc` |
| tenedor | `public/audio/voz/vocabulario/tenedor.mp3` | `connected-vocab-approved` | 10181 | 1.58 | 24000 | 51 | `f8558172d330a59f3dff1746f2c9c3e28d569e0f354d1c4bff39bd16f05e99be` |
| tierra | `public/audio/voz/vocabulario/tierra.mp3` | `connected-vocab-approved` | 8597 | 1.37 | 24000 | 50 | `f71a30d9cebdfeea0dc2831005f1912285b86813c9d654c55682406cd7660634` |
| tipi | `public/audio/voz/vocabulario/tipi.mp3` | `connected-vocab-approved` | 7661 | 1.34 | 24000 | 45 | `ca6e6d60e76eb14f0917f3f5dde95a0be31e430124410451fc996841c5c71474` |
| tomate | `public/audio/voz/vocabulario/tomate.mp3` | `connected-vocab-approved` | 11813 | 1.94 | 24000 | 48 | `5dd4f749a3b15d1f7e662d9edb8d4d4525b73eb21f33818cf3f1734d9c6b14a3` |
| topo | `public/audio/voz/vocabulario/topo.mp3` | `connected-vocab-approved` | 7877 | 1.37 | 24000 | 46 | `58ec190771ca7096dc6a6e5c80c6d18bf85aa4528e44b826f76b882300f8afd9` |
| torre | `public/audio/voz/vocabulario/torre.mp3` | `connected-vocab-approved` | 10589 | 1.78 | 24000 | 47 | `fea4ca60c2f602ab8f4e6b7a8e5871323c4dd701e50e603746adffbcd7598e93` |
| tuto | `public/audio/voz/vocabulario/tuto.mp3` | `connected-vocab-approved` | 8501 | 1.44 | 24000 | 47 | `ac8762d00dd35e67e4127f8021973f9ed4652056b692e447cc2852ce08dacc72` |
| ulises | `public/audio/voz/vocabulario/ulises.mp3` | `connected-vocab-approved` | 12053 | 1.99 | 24000 | 48 | `b2d07accd29b77f186b1ed844db49ae5249822ed2e9d1bf8263eebdac7e3dceb` |
| uña | `public/audio/voz/vocabulario/uña.mp3` | `connected-vocab-and-tutor` | 8405 | 1.39 | 24000 | 48 | `f777fa6bd863afde4c190c81ec5808e55caf80347765e664fa75c39cd9651235` |
| unicornio | `public/audio/voz/vocabulario/unicornio.mp3` | `connected-vocab-approved` | 12869 | 2.04 | 24000 | 50 | `d230d1d5a1efc33cf57bfca4bd2350e0478e17f6444ba7cae90cf84c6f159d42` |
| uniforme | `public/audio/voz/vocabulario/uniforme.mp3` | `connected-vocab-and-tutor` | 12221 | 1.94 | 24000 | 50 | `f9493faee053fe61c6d6e9f24fdb57a5b0d248e7fca2c4a46c618e3f65848da4` |
| uno | `public/audio/voz/vocabulario/uno.mp3` | `connected-vocab-and-tutor` | 8117 | 1.34 | 24000 | 48 | `9394f8be0d29fa4e55b7411b8d385092e3a1f063490df76912c1ff43b00aae66` |
| urraca | `public/audio/voz/vocabulario/urraca.mp3` | `connected-vocab-approved` | 12053 | 1.87 | 24000 | 51 | `b8d1ac0f869fd308186ce42b8f4db673e294f3c0fc23a40260e91c6f3e54275c` |
| uva | `public/audio/voz/vocabulario/uva.mp3` | `connected-vocab-approved` | 8213 | 1.34 | 24000 | 48 | `04feb4599b4fdfe181a255183896aa0324638f1d995499e2017d7fb6ca2f3834` |
| uvas | `public/audio/voz/vocabulario/uvas.mp3` | `connected-vocab-and-tutor` | 11549 | 1.87 | 24000 | 49 | `86904e566b5ef218808735418e8517df2d41d90e156f663341cd3a4201061c7a` |
| vaso | `public/audio/voz/vocabulario/vaso.mp3` | `connected-vocab-approved` | 10325 | 1.66 | 24000 | 50 | `76ece959e96c37891d149f48b7d48cf2d6447e52b7ea57e1805d06cba81d0a62` |
| vela | `public/audio/voz/vocabulario/vela.mp3` | `connected-vocab-approved` | 9293 | 1.54 | 24000 | 48 | `3f822839d19fb340055660e043bfc6bed965f25bb837f2f7deb3ff44a75f99ea` |
| vita | `public/audio/voz/vocabulario/vita.mp3` | `connected-vocab-approved` | 9293 | 1.54 | 24000 | 48 | `30e1b095a13144bca8627d7e57ad920ffe7524919ed2aebce957ed396d630391` |
| vuli | `public/audio/voz/vocabulario/vuli.mp3` | `connected-vocab-approved` | 9149 | 1.54 | 24000 | 47 | `dfe504b57b515915ba0c0df6bd600e4df0a510aca590e70feaef247830eaf331` |
| yate | `public/audio/voz/vocabulario/yate.mp3` | `connected-vocab-approved` | 9221 | 1.58 | 24000 | 46 | `244e764919e83f7e1d1011080e9741997e0c346d3f3b47fd736c295000062d4e` |
| yayita | `public/audio/voz/vocabulario/yayita.mp3` | `connected-vocab-approved` | 11189 | 1.85 | 24000 | 48 | `7150af83ecd8d57d6768f6fb6487e65474ae791c8f2465d43e865d4bfac9c3e3` |
| yema | `public/audio/voz/vocabulario/yema.mp3` | `connected-vocab-approved` | 9797 | 1.58 | 24000 | 49 | `1658b25ad87a116b8f33f41c4b63f3ca81908010d44f44db80007dbf467c7b52` |
| yoyo | `public/audio/voz/vocabulario/yoyo.mp3` | `connected-vocab-approved` | 11717 | 1.94 | 24000 | 48 | `db25870af1dd84141e042ca10c3aa1ac81327e75e2088b1a7035653f0af2b872` |
| zapato | `public/audio/voz/vocabulario/zapato.mp3` | `connected-vocab-approved` | 11933 | 1.94 | 24000 | 49 | `f9ec6f377c3d5491f359ea728b02d66205371057256d16acf7c53568bdb20dc2` |
| zepelín | `public/audio/voz/vocabulario/zepelín.mp3` | `connected-vocab-approved` | 10901 | 1.78 | 24000 | 49 | `2b66aa0bc92f8e71dd154c1d6cbce1bc22f77d5b4e1f39c1946f6c2c9d006668` |
| zig-zag | `public/audio/voz/vocabulario/zig-zag.mp3` | `connected-vocab-approved` | 12197 | 1.94 | 24000 | 50 | `41e45d8ea25747e3abae3b301bf9be9137acfc8b3823cfd7b0979fbbbec44a0e` |
| zorro | `public/audio/voz/vocabulario/zorro.mp3` | `connected-vocab-approved` | 9821 | 1.58 | 24000 | 49 | `c4fa339a1a15e4429ef93356fa2929e73e9cde3ebb5c4153884b445bfab6f18a` |
| zulema | `public/audio/voz/vocabulario/zulema.mp3` | `connected-vocab-approved` | 11237 | 1.75 | 24000 | 51 | `b8af5e9b4bd7589118b9e860d67f8cbe0e87e3a06738988df27af6ffb3800ff1` |

### 5.3 Tutor Viseme Timelines (`public/audio/voz/tutor/leccion-1..3/*.visemes.json`, 43 files)

| Tutor Line ID | Path | Bytes | Mouth Cues | SHA-256 |
|---|---|---:|---:|---|
| `l1-model-abanico` | `public/audio/voz/tutor/leccion-1/l1-model-abanico.visemes.json` | 942 | 9 | `2f7a03ca9958ecfb03a5dbbade8460aa19f36c5df96fd522acbe7936c9b627ee` |
| `l1-model-abeja` | `public/audio/voz/tutor/leccion-1/l1-model-abeja.visemes.json` | 1086 | 11 | `c5084c4b09b24a0d8be0feddd527426cb293bbe0288d30df00e0d732f3c53d20` |
| `l1-model-abrigo` | `public/audio/voz/tutor/leccion-1/l1-model-abrigo.visemes.json` | 1083 | 11 | `c893b314080e1592f769e9db919b239d3b1d3c5c963d29a382484b43a704b3fc` |
| `l1-model-anillo` | `public/audio/voz/tutor/leccion-1/l1-model-anillo.visemes.json` | 727 | 6 | `44f1a9d69083dcc9126bb8885c8eb5171219c83554e051397bc1e7972654bbf2` |
| `l1-model-araña` | `public/audio/voz/tutor/leccion-1/l1-model-araña.visemes.json` | 655 | 5 | `035d4c3ff7a37ca87279aca9a3841b027e016ca85cb35ff0361a9f58ae80999a` |
| `l1-model-árbol` | `public/audio/voz/tutor/leccion-1/l1-model-árbol.visemes.json` | 799 | 7 | `09f31ee132130a20971cd7d62ba568225655caefe82357a768c027e6cb61d2a4` |
| `l1-model-aro` | `public/audio/voz/tutor/leccion-1/l1-model-aro.visemes.json` | 940 | 9 | `c2803f42868cbc4ebd7982ed4fb0cbf1ee79ad436e360e44aaa807a3407ff86c` |
| `l1-model-avión` | `public/audio/voz/tutor/leccion-1/l1-model-avión.visemes.json` | 1013 | 10 | `666d82d955c5e6fa987faf91ce25fe97d4a72601bc3360cca1e11059eaa6a804` |
| `l1-model-carro` | `public/audio/voz/tutor/leccion-1/l1-model-carro.visemes.json` | 654 | 5 | `b235f82d2e289e47c37da2c8a0a04b223d4c794b15003271ffbb9ada61926556` |
| `l1-model-casa` | `public/audio/voz/tutor/leccion-1/l1-model-casa.visemes.json` | 725 | 6 | `e48f22cb4f168b8711e390b33cf35165a44ee8ad3fe610763b6b658e36647529` |
| `l1-model-dulce` | `public/audio/voz/tutor/leccion-1/l1-model-dulce.visemes.json` | 870 | 8 | `ead676800b450b87fd2ecde819c867a1bbee1581faadad3d3336701cb55fa99a` |
| `l1-model-elefante` | `public/audio/voz/tutor/leccion-1/l1-model-elefante.visemes.json` | 1161 | 12 | `9a3fac196f5ff2dc81446fc4153bd3ddc20184cbec083cec5601e01243d63572` |
| `l1-model-escalera` | `public/audio/voz/tutor/leccion-1/l1-model-escalera.visemes.json` | 1299 | 14 | `e527a8798ccf5bb433e31fb7e465da3fafe1d6b95d66e1959d0a090cd0060ab2` |
| `l1-model-escoba` | `public/audio/voz/tutor/leccion-1/l1-model-escoba.visemes.json` | 939 | 9 | `ee404ac4215cbba492ebad7dca1c9b8265701a6488bec49d613ad8e71a989cfe` |
| `l1-model-escuela` | `public/audio/voz/tutor/leccion-1/l1-model-escuela.visemes.json` | 1224 | 13 | `8259241b98f6214ff45cc45ad94d30623be21b8e5e2a391c045b5e2c4c1d590d` |
| `l1-model-estrella` | `public/audio/voz/tutor/leccion-1/l1-model-estrella.visemes.json` | 1087 | 11 | `e5cef651e94bf3fbcc7a1c1bcc485b1d315b017734123369dfe1fb74258b1a34` |
| `l1-model-globo` | `public/audio/voz/tutor/leccion-1/l1-model-globo.visemes.json` | 1084 | 11 | `f1dfd3bfa90518f71372adcedbf4f6945a9936465aca0ac81b6df493f4cbc945` |
| `l1-model-iglesia` | `public/audio/voz/tutor/leccion-1/l1-model-iglesia.visemes.json` | 798 | 7 | `461b98d4e7dbe3dc53559a5714efc92300644b8dd8a43cbd0260c2f81bd31ade` |
| `l1-model-imán` | `public/audio/voz/tutor/leccion-1/l1-model-imán.visemes.json` | 726 | 6 | `ed16ad0c32938f28eccf4036f190f467b8b6af4d3da7e21d7b017d557e6c6afe` |
| `l1-model-indio` | `public/audio/voz/tutor/leccion-1/l1-model-indio.visemes.json` | 726 | 6 | `24da08e5e25a300d53402c4924999ea811f68a88ac0452c539b8de4642b6160d` |
| `l1-model-isla` | `public/audio/voz/tutor/leccion-1/l1-model-isla.visemes.json` | 867 | 8 | `12ac974f81452b4e3250dbc0f28a233cea06c0be37a17e92c908637058834be2` |
| `l1-model-libro` | `public/audio/voz/tutor/leccion-1/l1-model-libro.visemes.json` | 798 | 7 | `7edf97e723d47ec4c0139272e1cf193315dbc12ee514ace1e7ec8257780a372c` |
| `l1-model-maíz` | `public/audio/voz/tutor/leccion-1/l1-model-maíz.visemes.json` | 726 | 6 | `5ba150929ed1b40cc61bf24559a7726c927ecd17f871c29e70906c92d8b88cd4` |
| `l1-model-manzana` | `public/audio/voz/tutor/leccion-1/l1-model-manzana.visemes.json` | 1008 | 10 | `2c4e7777d7a78c58c51f41053b7b27c35d1d505073e611d60d954a899de430a1` |
| `l1-model-ocho` | `public/audio/voz/tutor/leccion-1/l1-model-ocho.visemes.json` | 795 | 7 | `902167bdb437ab45009d28da0fced8771cb5e52354786fb4c3c13489e3787812` |
| `l1-model-ojos` | `public/audio/voz/tutor/leccion-1/l1-model-ojos.visemes.json` | 869 | 8 | `5b064f59fe661a517335f3ace28fcdc47cabc9fe18044200fc083b596fbb12d2` |
| `l1-model-olla` | `public/audio/voz/tutor/leccion-1/l1-model-olla.visemes.json` | 939 | 9 | `bd10b29a1d79c58516faa1029db04ca37bd002e667bdbbdbcfc7d17bad1ecfba` |
| `l1-model-oreja` | `public/audio/voz/tutor/leccion-1/l1-model-oreja.visemes.json` | 870 | 8 | `117c900b7facdc954dc0a67064d3296d200ddada15e079a174364ff1aae6c428` |
| `l1-model-oso` | `public/audio/voz/tutor/leccion-1/l1-model-oso.visemes.json` | 1004 | 10 | `968ea431ba90d2ae1c997fa6d8f8c84abd44c03d69c85e7c5c428f37dc26fdd5` |
| `l1-model-oveja` | `public/audio/voz/tutor/leccion-1/l1-model-oveja.visemes.json` | 1010 | 10 | `39425278cc184f303fb82b66cda864fb9efc8a41dc3be42f1bafcec48c19cf90` |
| `l1-model-pájaro` | `public/audio/voz/tutor/leccion-1/l1-model-pájaro.visemes.json` | 872 | 8 | `a45bdfa417ea1cdb34c4ae5bc976764f684a4424d234b7d6c6e6f5158186847d` |
| `l1-model-pera` | `public/audio/voz/tutor/leccion-1/l1-model-pera.visemes.json` | 869 | 8 | `a6ed04ca120ddb4997e8bbcf550d05e384577472fe8063b2994cf8a2744e68e2` |
| `l1-model-taza` | `public/audio/voz/tutor/leccion-1/l1-model-taza.visemes.json` | 723 | 6 | `357ed6993d7401ff3229d352bd453e934181fe5570901f98a52a457659112dbe` |
| `l1-model-uña` | `public/audio/voz/tutor/leccion-1/l1-model-uña.visemes.json` | 797 | 7 | `d5409c24df1bb73dedae0fd070addb779f1905b0e50f23f38a5434e798a7a987` |
| `l1-model-uniforme` | `public/audio/voz/tutor/leccion-1/l1-model-uniforme.visemes.json` | 1161 | 12 | `6abbc69c211470223f7356cff21c19f9e4de1697e75d74af78cf7d402ec014a6` |
| `l1-model-uno` | `public/audio/voz/tutor/leccion-1/l1-model-uno.visemes.json` | 794 | 7 | `daaa9579e88b2d8f499d784784d1b1901d0a77fc5cd2606ac5289a554bce722e` |
| `l2-model-alas` | `public/audio/voz/tutor/leccion-2/l2-model-alas.visemes.json` | 725 | 6 | `ae10db864ebd2999c370a872c9349cfa0e4c6d9335770593f5b8d5d3fa13d4cf` |
| `l2-model-iglú` | `public/audio/voz/tutor/leccion-2/l2-model-iglú.visemes.json` | 868 | 8 | `6d55e5bfed00ce93f83817eefa8ce1d54d05517b0014dc1dede97092846c624f` |
| `l2-model-ola` | `public/audio/voz/tutor/leccion-2/l2-model-ola.visemes.json` | 864 | 8 | `81ea52e4aa6bbb92f29da3172648d7fda72848ec0f5fd5688d69e839d352c0c9` |
| `l2-model-uvas` | `public/audio/voz/tutor/leccion-2/l2-model-uvas.visemes.json` | 861 | 8 | `3ae41c43354d6fdb2183ab639b21df27f54b5f445b3c8032c88383bfb2d82a5e` |
| `l3-model-aguja` | `public/audio/voz/tutor/leccion-3/l3-model-aguja.visemes.json` | 1010 | 10 | `ea08d4758e92f7928d7e554ae9b0b20b0bfadbb5fad1a53d76a8c5c6d43fd5ea` |
| `l3-model-ardilla` | `public/audio/voz/tutor/leccion-3/l3-model-ardilla.visemes.json` | 1158 | 12 | `a70d9f5584c109a24139909b9a189e5c3f8e7f88d11b39dd66bd3427cc931e84` |
| `l3-model-oruga` | `public/audio/voz/tutor/leccion-3/l3-model-oruga.visemes.json` | 726 | 6 | `10b8c6a1f06d98c8cc6db7ff4144c8701642029b3cd6961d428fef243926905b` |

