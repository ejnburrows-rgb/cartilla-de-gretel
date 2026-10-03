# Verified picture vocabulary and recordings

The picture-name catalog comes from authored Workbook/Flip Chart content and verified art labels, never inferred filenames. Corrected page labels take priority over legacy art labels. Unknown or ambiguous names are not spoken. Run `python scripts/build-picture-vocabulary.py` to regenerate the catalog and missing list.

Current inventory: **199 unique pronunciation keys, zero approved recordings, 199 missing recordings**. [Missing final recordings](MISSING_PICTURE_RECORDINGS.csv) includes verified names, suggested paths and source references. Repeated vocabulary reuses one recording; accents and ñ remain meaningful. Suggested paths are planning entries, not existing audio assets.

Active `src/content/audio-manifest.ts` policy has `allowTts: false`. No approved pilot exception was found. Device speech fallback remains disabled. Existing effects, ambient sound and silent.mp3 are not vocabulary recordings. No assets were created, renamed or removed.

To supply a genuine recording, add the owner-approved audio file and an entry to `src/content/picture-name-recordings.json`: `{"key":"oso","src":"/audio/voz/vocabulario/oso.mp3","approval":"Owner approval reference"}`. The generator rejects unknown names, absent files, absent approval provenance and duplicate pronunciation entries. The runtime does not derive recording paths from filenames. This example is documentation only; the shipped approved list is empty.

The shared service prefers approved recordings. Its conditional device TTS path runs only if the active policy explicitly permits it. A missing recording under the current policy shows a gentle availability message. Actual audible pronunciation and recording quality remain blocked until approved recordings are supplied.
