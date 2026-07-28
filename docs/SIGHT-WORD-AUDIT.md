# Sight Word Integrity Audit

## Overview
This audit examines whether sight word information is correctly captured in `src/data/page-layouts.json` for lessons that were historically marked as having "intentionally empty" sight-word boxes: 16 (v), 18 (rr), 19 (g), 21 (j), 22 (c/q), 23 (y), and 24 (z/c). 

## Findings

### 1. Source Image Verification
A review of the physical source images (e.g., `v/v-page-35.jpg`, `rr/rr-page-41.jpg`) confirms that the reading pages for these lessons **do indeed have an empty cyan bar** where the sight-words box usually appears. There are no sight words to show for these lessons.

### 2. Layouts Transcription (`page-layouts.json`)
The transcription of these lessons in `src/data/page-layouts.json` uses a boilerplate 4-page sequence for every lesson:
1. `syllable-match`
2. `fill-in-blank`
3. The reading page (containing `title`, `syllable-bubble`, `vocab-grid`, and `reading-sentences`)
4. `writing-line`

**Crucially, there is NO region representing the sight-words box at all in these JSON definitions.**
The transcribers completely omitted the empty cyan bar from the JSON layout. The `vocab-grid` region strictly contains the standard phonics vocabulary words, and there is no `sight-words` region or any equivalent empty region present on these pages.

## Conclusion
Because `page-layouts.json` completely omits the empty sight-words box, the new page-by-page rendering system will naturally just skip over it. The data is entirely missing from the JSON, meaning the app will simply render the syllables, the vocab grid, and the sentences without attempting to render an empty box or failing on empty sight-word data. 

**This confirms that no further UI fixes are needed to handle "intentionally empty" sight-words boxes in the new lesson flow, as the data itself simply excludes them.**
