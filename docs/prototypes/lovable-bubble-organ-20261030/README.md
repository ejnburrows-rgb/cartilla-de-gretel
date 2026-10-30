# Lovable Bubble Organ — original source snapshot

Source: https://lovable.dev/projects/2562016f-bb7e-430e-b5a3-6c7898e68d6a
Source commit: a71453acfd78ca1a4f080029d58f1ee2c1b6415b (2026-10-29)
Preview: https://id-preview--2562016f-bb7e-430e-b5a3-6c7898e68d6a.lovable.app
Target repository: ejnburrows-rgb/cartilla-de-gretel
Imported: 2026-10-30

## Scope
Preserves the source as read from the existing Lovable project without using Lovable AI/build credits. The original app is a standalone TanStack Start prototype for the Mm syllable bubble organ, not the production Cartilla route. This import does not overwrite any Cartilla app code or activate a game. The owner requested an isolated repository branch.

## Included
Original React route, style sheet, test, package manifest, roadmap and Lovable-specific instructions, byte-for-byte for the UTF-8 source as returned by Lovable.

## Missing / explicitly not production-integrated
The Lovable connector's binary file reader returns images decoded as text with replacement characters; this does not preserve binary bytes. Therefore these image assets have **not** been copied: public/book-spread-m.jpg, src/assets/book-spread-clean.png, src/assets/book-spread-meadow.png, src/assets/book-spread-noblue.png, src/assets/book-spread-nocat.png, src/assets/gretel-25d.png, src/assets/gretel-bubble.png. The original code imports book-spread-noblue.png and gretel-bubble.png. Recover exact files from the original project before activating the feature; do not regenerate or substitute unapproved art.

The Lovable prototype uses window.speechSynthesis / SpeechSynthesisUtterance in src/routes/index.tsx. **Do not activate device TTS in Cartilla**. Migrate to approved original owner recordings, or remain silent until authorized recordings are available, before integrating its logic.

The standalone TanStack Start root and whole-project dependencies should not replace the Cartilla Vite app, routes, lockfile, styles or other games. Integrate only a scoped component after original assets and source fidelity are verified; keep Tutor #1073 and other ongoing work untouched. No new game route, PR, deployment or main-branch merge was performed in this source-only import.

No runtime build or tests were run as part of this GitHub/API-only snapshot.
