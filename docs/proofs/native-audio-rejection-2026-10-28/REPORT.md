# Native playback failure — October 28

WORKS: The actual Flip Chart route /cartilla/presentar/13 was exercised at phone 390×844 and desktop 1366×900. Tapping nido invokes a real HTMLAudioElement and its native play(). A deliberately invalid audio/mpeg response makes Chromium reject the actual playback promise with NotSupportedError / MEDIA_ERR_SRC_NOT_SUPPORTED (code 4). The real application emits recorded then failed; the element is paused and the student sees no playback-error message. No answer/completion events and no learner-storage changes occurred. See checks.json, phone.png, desktop.png and corresponding .webm recordings.

This uses no fake Audio class and dispatches no synthetic status events. The wrapper only observes and returns the original native play promise. Only the media response is a deliberate failure fixture. No voice excerpt is installed or approved by this test.

DOES NOT WORK: The invalid fixture intentionally cannot play. No additional product failure observed in this bounded check.

NOT VERIFIED: Audible output, correct source phrase, original-master recovery, mute/stop/page-change acoustic behavior, physical phones and Safari. Earlier status-event UI evidence is separate and reusable; this adds native rejection proof only. No main integration or deployment.

Tested product head: e7b21bfd0bdab35f2def26c4d2d2e7764544a463. Run `node scripts/proofs/check-native-audio-rejection.mjs` from repository root against worker mode on localhost:5173 with system Chromium. Proof-only follow-up; product code and audio files are unchanged.
