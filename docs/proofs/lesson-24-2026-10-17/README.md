# Lesson 24 check — 2026-10-17

Checked application commit: `474495d3cdfaed16dd09986d89bd4a8797cba2a5` on draft PR #884. This evidence commit changes documentation/media only.

Actual runtime: local Vite worker at `http://127.0.0.1:5173/cartilla/leccion/24`, real headed Chromium. Desktop viewport requested1366x900; phone390x844. PNG dimensions exclude the browser scrollbar gutter; these are full-height page captures, not single-screen images. Original source columns are preserved with a960px horizontal page on phone. Left/middle/right captures document the horizontal page; phone-fit/owner acceptance is UNVERIFIED.

## VERIFIED — opened and inspected
- All12 screenshots in this folder were opened and visually inspected. Desktop88/89/90 show full source content; phone headers/navigation remain within the viewport. Page89 no longer cuts off its vocabulary/story; vowel64px/red/border0; words30px; navigation64px. `runtime-metrics.json` records the measured final DOM. Page88 zi retains two columns. No overflowing word/fill cells detected in the sampled final DOM.
- Video `lesson24-interaction.webm`: real49.56s browser recording, decoded and inspected at representative frames. Shows phone horizontal scrolling/keyboard pan on89, actual Siguiente navigation89→90, incomplete-page hint, three wrong answers returning for retry, then correct za and typed source-related sentence. No completion state was seeded for this video; initial page89 opened using an ordinary saved-page bookmark. Screenshot pages were likewise opened using diagnostic bookmarks; screenshots alone do not prove navigation or completion.
- Page90 separately exercised all six correct fill choices and writing Listo: actual blanks became `za pato`, `ze ta`, `zu mo`, `la zo`, `a zu les`, `Zi ta`; Siguiente's aria-disabled cleared. This separate sequence was local, not a production or final lesson completion claim.
- TypeScript compilation after repairs: exit0, no diagnostics.
- Page87 source-blocked in canonical layout, empty regions; first actual lesson page88. No invented source content or art changes.

## UNVERIFIED / limits
- Phone fit is unresolved: horizontal panning is necessary to preserve both original columns and required teaching sizes. This is not owner-approved phone acceptance.
- Audio click did not produce an observed clip request in the recorded run (`audioInitial/final=idle`, no zorro resource entry); audible playback and spoken identity/quality remain UNVERIFIED. The video has no audio track and does not certify genuine audio. No voice synthesized/substituted. Missing recordings remain as listed on #884.
- Existing optional Piano adds a fourth activity entry. Its microphone behavior and whole-lesson final completion are not checked here; physical workbook pages checked are88–90 only.
- Desktop pages grow vertically at full teaching sizes; this is not a no-scroll1366x768 certification.
- Native touch device, drag operation, full reload/progress regression, every possible feedback/zoom state, final owner visual/voice approval and production are not certified by these captures. The observed input path was real mouse/keyboard in a phone-sized browser, not a physical touchscreen.
- Amber wrong-answer proposal remains pending and not implemented.

PR remains DRAFT. No merge, production deployment, alias promotion or paid option requested. Temporary Vercel preview status is recorded on #877 and #884; a URL is VERIFIED only after browser opening.

## Screenshots

| Page | Desktop | Phone left | Phone middle | Phone right |
|---|---|---|---|---|
|88|[desktop](final-desktop-88.png)|[left](final-phone-88-left.png)|[middle](final-phone-88-middle.png)|[right](final-phone-88-right.png)|
|89|[desktop](final-desktop-89.png)|[left](final-phone-89-left.png)|[middle](final-phone-89-middle.png)|[right](final-phone-89-right.png)|
|90|[desktop](final-desktop-90.png)|[left](final-phone-90-left.png)|[middle](final-phone-90-middle.png)|[right](final-phone-90-right.png)|

[Watch/download the real interaction video](lesson24-interaction.webm).
