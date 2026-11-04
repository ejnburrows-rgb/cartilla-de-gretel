# Teacher's Guide content schema — for Anti-Gravity coordination

The teacher's 5-folder hub (`/cartilla/teacher/guia`, built in
`src/content/teacher-folder-data.ts` + `src/routes/cartilla/teacher/guia.*`)
currently sources its data from two places:

1. `src/content/guides/lesson-N.tsx` — the existing per-lesson verbatim
   guide component (objectives, procedure, vocabulary/poem, evaluation),
   used by Folder 1 ("Guía del profesor").
2. `src/content/teacher-folder-data.ts` — evaluation page + rhyme title
   per lesson, extracted verbatim from `docs/Transcripción Integral_ La
   cartilla de Gretel - Guía del profesor.txt`, used by Folders 3-5.

**Target schema for Anti-Gravity's future delivery** (`src/content/guia/lesson-N.json`
+ a top-level `manifest.json`) — when this lands, it becomes the new
source of truth and both files above get pointed at it instead, without
changing the folder UI itself:

```json
{
  "lessonId": 7,
  "objectives": ["string, one per curriculum standard line, verbatim"],
  "motivation": "string — the full 'Motivación' oral-activity script, verbatim",
  "script": "string — the full Lesson Development script, verbatim",
  "evaluationRef": { "page": 7, "note": "verbatim evaluation instruction line" },
  "rhyme": { "title": "Mi mamá", "text": null },
  "provenance": {
    "source": "docs/Transcripción Integral_ La cartilla de Gretel - Guía del profesor.txt",
    "verified": true
  }
}
```

Rules that apply to this schema exactly as they apply everywhere else in
this repo: every field is verbatim from a real source or explicitly
`null`/`"AWAITING-SOURCE-SCAN"` — never invented. `manifest.json` should
list which of the 24 lesson files exist and which are pending, mirroring
the `public/cartilla/art/faithful/manifest.json` convention already used
for illustrations.

Until this lands, the folder hub keeps working off the two existing
sources above — this file exists so the two efforts converge on the same
shape instead of duplicating work.
