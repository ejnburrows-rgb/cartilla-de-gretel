# Platform design options - draft only

Two design studies for the exact two supplied screens. Nothing is wired into lesson routes or installed live. No source curriculum, shared renderer, styles, audio or pictures changed.

## 1. Learning studio
A full learning workspace. Vocabulary and syllables sit beside a substantial reading card on desktop. Reading is 28px, with an A+ control. Exercise rows are independent white cards, with generous word buttons. Garden-color top lettering stays. On phones the cards stack at readable type sizes. This option requires vertical phone scrolling rather than reducing the entire page to fit.

## 2. Focus mode
One task at a time. Syllables, words and reading are tabs, with the reading panel selected by default. The circle activity presents one syllable group at a time with much larger targets. All original text remains available, but not all at once. This is the stronger platform direction for phones. Reading is 28px desktop / 24px phone. Garden-color top lettering stays.

## Source and scope
- Printed p69 is Lesson 19; printed p72 is Lesson 20 in the repo and source sequence. The incoming assignment called the second screen Lesson 21. These mockups follow the supplied screenshot's printed p72, not an invented L21 variant.
- The story, syllables, vocabulary, instruction and all 30 matching words come from protected page-layouts.json, compared against the original p69/p72 scans. No original words changed. Printed line breaks in the story reflow into a paragraph.
- New UI labels such as Lectura, Palabras and Reiniciar are interface labels, not additions to the story.
- Prototypes use the existing Andika/Fredoka font files and garden letter palette. No pictures, illustration, fabricated audio or new art.
- Option 2 selection circles the matching syllable. This is local mockup state, not a correctness engine. It intentionally does not pretend to save progress, speak, or validate answers.

## Preview locally
From repository root: `python3 -m http.server 8327`
Open `/docs/mockups/platform-C-20261020/?option=1&page=69`.
Options 1/2, pages 69/72. These are local relative paths, not public links.

## Checks and evidence
- `node --check mockups.js` passed.
- Automated local-browser checks: both page render paths at four sizes, all focus tabs, word selection count, reset and A+ control passed.
- `metrics.json`: 16 renders, no horizontal page overflow. Both designs allow vertical scroll when needed to protect readable type. This is a deliberate proposed change from the old fit-everything-on-one-screen constraint, not an approved implementation.
- Renders at 1440x900, 1280x800, 390x844 and 844x390. Contact sheet, direct desktop/phone images and PDF comparison inspected.
- App typecheck/build/full tests were not rerun for this isolated static mockup. Prior workbook checks are documented separately.

## Review
PDF contains current-versus-option desktop comparisons for each option and each page, then three-column current/1/2 phone comparisons. The current is pushed C draft c802939, not a claim about production. Full-resolution captures are in renders/.

Owner choice and visual approval are still pending. No deploy, merge, PR or main change.
