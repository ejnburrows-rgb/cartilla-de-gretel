# Existing elephant/sheep motion candidate on current main — October 29, 2026

## WORKS

- Existing candidate 82f1b5216615ac748824d9f4933b92e9f775dc4c reconciled with protected main a0f29db335e427b09f31cf5c9e46c40003a09007 at 0de7783e0d1e365b8d43c01a2cd78a664ab52ad9. No still image changed; all six approved still files remain identical. Only existing motion derivatives, their part coordinates/source hashes and the six resolved stale holds differ from main.
- Frozen install passed. Existing unchanged freshness tests (3) and LivingIllustration tests (13) pass, 16 total. TypeScript/Vite production build pass. Existing art preparation reports FINISHED_ART_PRESERVED 108 groups; 584 asset checks pass with zero errors. See source and build logs.
- Independently decoded all six moving images' full original base layers and compared every RGBA sample to the approved stills: exact equality at native base dimensions. The normalized rendered base bounds also match, preserving Workbook elephant's 5.5px top/bottom padding. ViewBox origin 0/-5.5 and image y=5.5/0 are equivalent coordinate representations, not changed source padding. See results.json pixels.
- Actual built preview at http://127.0.0.1:5189 passes 24 normal/reduced-motion placements at 390 and 1366 widths across Workbook lessons 1/2/4 and teacher presentations 2/4. Normal mode selects each rebuilt SVG; reduced mode selects the corresponding approved static picture/delivery tier. Every selected currentSrc response matches local qualified bytes and loads with nonzero dimensions; no page errors. Each normal placement is recorded for over one 4.8-second blink cycle. See four continuous normal/reduced recordings, 24 screenshots and results.json. This does not claim a still frame proves movement.
- No original art was regenerated or resampled. Source pixel verification reads the original full base image (including WebP), not the smaller motion-part PNG overlays. The proof helper's resume selection is constrained to the actual lesson's pages; resume pointers only are fixtures, no activity answers/completion.

## DOES NOT WORK

- No runtime failure observed in these scoped checks. An initial manual viewBox-string comparison failed because the coordinate origins differ; comparing actual normalized base placement verifies the unchanged padding. That probe is not counted as a product failure or passing test.
- Unrelated bee motion holds remain explicitly stale. They are not silently unblocked by this batch.

## NOT VERIFIED

- Independent review of the original material was requested on existing #1204; integration remains held until eligible. Generic freshness tests and other source restrictions were not relaxed.
- Physical phone/Safari, broader activity correctness, microphone/acoustics, original Gretel voice alignment and full-product release are not established. This candidate is not deployed; live production remains Mariposas-only.
