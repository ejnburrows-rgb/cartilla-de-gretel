# Existing PR1022 verification recovery

Exact reviewed source fed42a7899d1c540c842608bfe973220aad69597, not current main. No product source changed. Existing capture/verify scripts reused with localhost port5199 and system Chromium; videos recorded for interaction runs.

WORKS
87 focused tests and typecheck passed. Existing capture script visited all44 phone pages23-66 without page errors/document horizontal overflow. 20 existing interaction cases passed across two bounded runs (7+13): wrong/correct occurrence and reload, pencil/eraser cycle, canvas erase/undo/save, typed sentence reload, guided trace restore, fill/sentence completion gate, freehand sentence persistence, all11 circle-page touch, all66 fill choices, navigation, adjacent page styles, and4 pages at each landscape/desktop size. Logs attached. This is functional evidence of these checks, not visual acceptance of all pages.

DOES NOT WORK
Fresh p23/p41 pixels show clipped lesson labels at the left ('ección'). The existing source-layout CSS sets white portrait pages, not the cream/wide format asked for elsewhere. It intentionally bypasses Lesson16 garden-letter styling on these44pages. These need scope reconciliation before integration, not silent selection of a competing design.

NOT VERIFIED
All44 visual source comparisons, current-main integration, worker/full release build, audio, original-scan identity, owner acceptance of white portrait exception, production. Do not merge the old full tree: current main's p7/p8 renderer props and later art/fit changes must be preserved.
