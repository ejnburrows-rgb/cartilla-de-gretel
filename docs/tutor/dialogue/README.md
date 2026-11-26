# Gretel recording desk

The numbered catalogs are draft session turns, partitioned by lesson. File 00 contains universal and technical turns. They extend the existing tutor line bank for authoring. Only the existing approved bank is eligible for playback. The original master must be reconciled by heard content before requesting any recording. Current repository rules restrict new playback to transcript-matched excerpts of the approved original.

Run `python3 scripts/export-tutor-dialogue.py /path/to/empty-directory` from a checkout with ffprobe. The exporter produces clean spoken batches, a recording index, a dialogue manifest, the intent and curriculum matrix, a lesson summary, and the inventory of installed approved recordings. Identical text shares one clip across contexts. Never identify a clip from its position in a batch. Null media fields mean evidence is unavailable. Instructions and actions in draft eligibility are authoring notes and cannot execute commands.

Source references are printed Workbook pages in the two book transcriptions, original PDF sheet IDs in the reconstruction mapping, and sheet IDs from the teacher Flip Chart manifest with text from the three Flip Chart transcription files. Sheets 1 and 2 are front matter. Missing Workbook pages 86 and 87 have no scripted activities. Open responses require teacher review. Assessment source availability and runtime assessment are reported separately. An example of an error in the matrix describes a possible input, never an observation about a learner.

Recording estimates assume 115 words per minute and 64 kbit/s mono. Session setup, retakes, silence, visemes and container overhead are additional. Per-lesson figures count referenced speech, so shared text can appear in multiple lesson estimates. A whole-library recording uses each distinct utterance once.

## Local recording intake

Run `python3 scripts/intake-tutor-audio.py --private-directory /private/recordings --recording-index /private/export/recording-index.csv recording.m4a`. Multiple files can be passed together. FFmpeg and ffprobe must be on the path. The vault must be outside Git and accessible only to its owner. It holds content-addressed originals and a separate report for each pass. Exact installed audio is identified by checksum regardless of filename.

For unrecognized recordings, supply an unpacked local Spanish Vosk model using `--model` and the Python package `vosk`. Recognition runs locally. The program compares observed words with all expected lines, flags weak matches, detects repeated IDs and changed sequence, and extracts only private review copies for confident complete matches with space between adjacent words. Optional `--expected-batch` identifies missing lines even when no lines match. Clipping checks are on the decoded review copy. Music, stutter, sentence boundaries and voice rights still require review. Recognition confidence is used only for recording intake.

November 26 proof used all 43 installed files and the published original 43 viseme timelines. A private continuous test containing the approved words “abeja” and “elefante” yielded both IDs, held “abeja” for review and extracted one “elefante” candidate. No new line was approved. Run the existing viseme builder and both validators after eligible mapping and approval.
