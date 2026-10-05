# Verified picture vocabulary and recordings

The picture-name catalog comes from authored Workbook/Flip Chart content and verified art labels, never inferred filenames. Corrected page labels take priority over legacy art labels. Unknown or ambiguous names are not spoken. Run `python scripts/build-picture-vocabulary.py` to regenerate the catalog and missing list.

Current inventory: **199 unique pronunciation keys, 162 approved recordings, 37 missing recordings**. Every Workbook picture name and every plain vocabulary word has an approved recording. The 37 missing entries are Flip Chart letter-tagged pictures (for example `ternero n`, `toro m`, `serpiente s`) and scene labels; they stay silent until recordings are supplied.

Active `src/content/audio-manifest.ts` policy has `allowTts: false`. No approved pilot exception was found. Device speech fallback remains disabled. Existing effects, ambient sound and silent.mp3 are not vocabulary recordings. No assets were created, renamed or removed.

To supply a genuine recording, add the owner-approved audio file and an entry to `src/content/picture-name-recordings.json`: `{"key":"oso","src":"/audio/voz/vocabulario/oso.mp3","approval":"Owner approval reference"}`. The generator rejects unknown names, absent files, absent approval provenance and duplicate pronunciation entries. The runtime does not derive recording paths from filenames. The shipped list contains the 162 owner-approved Candidate B recordings (approved 2026-10-04; files merged in #503).

The shared service prefers approved recordings. Its conditional device TTS path runs only if the active policy explicitly permits it. A missing recording under the current policy shows a gentle availability message. Names without an approved recording stay silent with the gentle availability message.
