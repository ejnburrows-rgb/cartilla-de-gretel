# Selected sample styling on our page layout - working draft

Nothing live. No lesson route, canonical curriculum, shared app style or audio file changed.

## Latest owner direction applied
Sample look, OUR page structure, no tabs: p69 has syllables, then the original three-column vocabulary, then the story. P72 keeps all five fa/fe/fi/fo/fu groups visible, with the source's two rows of three words. Original word content and order are retained. The sample supplies chunky controls, edge depth, teal/yellow colors and rounded type. Garden-color top lettering stays.

## Real
- All p72 word-part taps evaluate the source target syllable. Wrong taps show retry, correct taps circle the target and increment progress once. A repeated correct tap cannot inflate progress.
- All 30 words work, with per-group and overall counts. Per-group repeat clears that group and decrements overall progress. Siguiente sílaba scrolls to the next group without hiding other groups.
- P69 has selectable syllables, word review controls, A-/A+ type size controls, and a manual reading-finished control. Word review counts distinct vocabulary cards. It does not score pronunciation, imply comprehension, or claim a recording.
- Four existing repo audio files play: gato, gorra, mago, gusano. Their bytes were not generated or changed. The files were inspected: their transcripts match those names (gusano transcribed as gussano). Human-voice provenance is not independently established here. Historical approval claims in repository metadata were not treated as authority.
- No fake points, reward stars, completion scores or fabricated player. Header is the actual current-session count. Story audio and syllable audio are visibly unavailable.
- Session state only; reload resets. No account or backend interaction.

## Missing audio
No existing story recording or ga/go/gu/fa/fe/fi/fo/fu syllable recordings found under public/audio. Eleven of the fifteen p69 vocabulary names lack a matching file. To add sound honestly requires real recordings of the exact full story, missing words and syllables, matched and reviewed before wiring them. No TTS or voice generation was used.

## Checks
`node --check mockups.js` and exact protected source snapshot checks passed.
Automated browser checks passed at 320x844, 390x844, 1280x800, 1440x900, 844x390. 25 final full captures have no horizontal document overflow. Tests exercise all 30 correct targets, wrong taps, duplicate-count safety, clearing a group, word review, A-/A+, manual finish/reset, sound-selection disclosure and all four existing audio file play calls.

The prototype deliberately scrolls vertically so readable text and all groups remain visible. It does not claim the old fit-everything-with-no-vertical-scroll requirement. No production build/full app test run for this standalone HTML/JS/CSS draft.

## Evidence
- renders/: before-use p69/p72 and wrong/right/complete states, every size.
- phone-interaction-proof.mp4: actual phone browser screen recording from the test sequence, including interactions and vertical movement. It is a silent screen recording, not a claim that recorded sound was captured.
- sample-style-review.pdf: last Focus mockup vs selected sample styling, desktop and phone; feedback state proof.
- metrics.json: dimensions and checks.
- Before images refer to the last delivered Focus design, not production. Draft source belongs only in docs/mockups/ludica-C-20261020/.

## Tappable phone link
Two private standalone-hosting build attempts failed with a build infrastructure error before a preview existed. No usable phone link was published or verified. Do not send the unbuilt File URL as a working prototype. Local preview works from repo root with `python3 -m http.server 8327`, then /docs/mockups/ludica-C-20261020/?page=69 or ?page=72. These are local paths, not phone links.

Owner choice/approval and production integration remain pending. No PR, merge, deploy or main change.
