# Piano Hablador — grand piano samples

The notes in `piano-samples.ts` (C4, D♯4, F♯4, A4, C5, D♯5) come from the
**Salamander Grand Piano** (Yamaha C5 grand) by **Alexander Holm**, licensed under
**Creative Commons Attribution 3.0** (https://creativecommons.org/licenses/by/3.0/),
from the MP3 copies published by the Tone.js project
(https://tonejs.github.io/audio/salamander/).

Changes: each note trimmed to 3.2 s with a 1.2 s fade-out and re-encoded as MP3
(96 kbps stereo), then stored as base64 text. Notes in between re-pitch the
nearest sample by at most ±1.5 semitones; the room reverb is generated in the
browser. Used only by the Piano Hablador (`piano-sound.ts`).
