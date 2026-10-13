# Piano Hablador — design prototypes A and B (reference copy)

Standalone, offline copy of the two interactive Piano Hablador prototypes that
the owner (EJN) reviewed on 2026-10-13 before approving **both** designs:

- **A · Original refinado** → shipped as the **Piano** design (`PianoDesignA`).
- **B · El cancionero** → shipped as the **Cancionero** design (`PianoDesignB`).

The approved, production version lives in `src/components/cartilla/PianoPronunciation.tsx`
and `src/components/cartilla/piano/` (merged in #733). The production version
adds the Piano / Cancionero switch and the phone/tablet/laptop auto-choice;
this prototype does not.

## How to open

Download `piano-hablador-prototipos-A-B.html` and open it in a current browser
(Chrome, Edge, Safari 16.4+ or Firefox 113+). It needs no internet and no server.
Optional URL parameters: `?d=a|b` (design) and `&l=1|7|9` (vowels, syllables
ma–mu, or book words).

## What is simulated

- The purple **SIMULACIÓN** buttons imitate what the microphone would hear.
  They exist only in this prototype.
- The real microphone turns on only if the browser confirms on-device speech
  recognition; otherwise touch / keyboard mode is used. It never falls back to
  an online speech service.
- Escuchar uses the browser's voice, except "sapo", which uses the approved
  recording.

## Notes

- Reference only: this file is **not** part of the app build and is not served
  by the website (it lives under `docs/`, not `public/`).
- The file's CSS and JavaScript are gzip + base64 compressed so it stays small;
  the browser unpacks them on open.
- Not tested with a real microphone, children's voices or physical devices.
