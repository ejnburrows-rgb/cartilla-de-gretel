# Living book entrance — 2026-11-02

Implemented in the existing feat/living-cover-welcome-redesign working project; no merge or deployment.

- Authentic WB Cover HD.png (1086×1448), SHA256 91072a05638d464a127cb4d88448afaabce3f81b9626cd29ec3107bc1df8cfb7.
- Single responsive book stage on / and /cartilla, no split layout or separate standing Gretel.
- Original pixels animate in place using a small WebGL displacement shader for butterfly wings/hover, dragonfly wings/hover, and Gretel's breath. Contoured eyelids and a restrained golden halo remain aligned to the same source coordinates. No generated replacement artwork.
- Reduced motion draws the unmodified static cover; unavailable WebGL keeps the CSS cover; a missing cover exposes the existing approved Gretel media fallback and working entry links.
- Cover and Comenzar are native keyboard-accessible links to lessons. Teacher entry remains separate. All original 14 contract tests passed unchanged against the implementation; the current working project's three newer tests were reconciled with the requested single cover and native link.
- Typecheck and production Vite build exited 0. See typecheck.txt, build.txt and tests.txt.
- browser-results.json: real / and /cartilla routes at 1366×768 and 390×844, no overflow, active motion canvas, two successful entry paths, reduced-motion zero running animations, missing-cover fallback. 60fps is Chrome emulation, not a physical-phone measurement.
- built-results.json: production build at 1366×768, 390×844 and 320×568 without overflow; keyboard Enter navigation; actual decoded audio playing at volume 0.8 and not muted.
- Motion recordings desktop.webm and phone.webm are silent browser recordings. Audio playback is independently verified in built-results.json.

## Recorded paper sound

The old public/audio/page-turn-soft.mp3 was an invalid 84-byte placeholder; both ffprobe decoding and actual Chrome playback proved the failure. Replaced only that soft sound with a real 1.85-second recording: Page Turn (2), OwlStorm / Ashe Kirk, https://freesound.org/people/OwlStorm/sounds/151221/ . The author's page explicitly dedicates the recording to CC0: https://creativecommons.org/publicdomain/zero/1.0/ . Source preview: https://cdn.freesound.org/previews/151/151221_140737-hq.mp3 . Hosted locally; no paid service, runtime external request, or Gretel voice substitution.

## Remaining

Physical-phone performance validation and separately authorized production deployment. Existing unrelated work was preserved; before/ contains the entrance files as found before this change.
