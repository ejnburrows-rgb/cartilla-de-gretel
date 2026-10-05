# Verified picture vocabulary and recordings

The picture-name catalog comes from authored Workbook/Flip Chart content and verified art labels, never inferred filenames. Corrected page labels take priority over legacy art labels. Unknown or ambiguous names are not spoken. Run `python scripts/build-picture-vocabulary.py` to regenerate the catalog and missing list.

Current inventory: **199 unique pronunciation keys, 154 approved recordings, 45 missing recordings**. All Workbook picture names have approved recordings; the missing entries are Flip Chart-only (8 real words — bebé, dado, fiesta, gato, jirafa, niño, perro, remo — queued for a second recording batch, plus scene/descriptor labels). [Missing final recordings](MISSING_PICTURE_RECORDINGS.csv) includes verified names, suggested paths and source references. Repeated vocabulary reuses one recording; accents and ñ remain meaningful. Suggested paths are planning entries, not existing audio assets.

Active `src/content/audio-manifest.ts` policy has `allowTts: false`. No approved pilot exception was found. Device speech fallback remains disabled. Existing effects, ambient sound and silent.mp3 are not vocabulary recordings. No assets were created, renamed or removed.

To supply a genuine recording, add the owner-approved audio file and an entry to `src/content/picture-name-recordings.json`: `{"key":"oso","src":"/audio/voz/vocabulario/oso.mp3","approval":"Owner approval reference"}`. The generator rejects unknown names, absent files, absent approval provenance and duplicate pronunciation entries. The runtime does not derive recording paths from filenames. The shipped list contains the 154 owner-approved Candidate B recordings (approved 2026-10-04).

The shared service prefers approved recordings. Its conditional device TTS path runs only if the active policy explicitly permits it. A missing recording under the current policy shows a gentle availability message. Names without an approved recording stay silent with the gentle availability message.
