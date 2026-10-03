# Batch 2 — feedback and honest progress

Based on accepted PR #434, main `6585ce020cfb03dd91d5db15a53db530bcc89e60`. Completion foundation, image assets, backgrounds, handwriting and page mappings are preserved.

## Feedback

Multi-answer checks retain validated correct selections, mark wrong selections, count remaining targets, and allow correction without revealing missing answers. Completa responds immediately to each choice, including implicit distractors. Every syllable letter has the same initial treatment; either valid `pa` occurrence in `papá` satisfies that word. Gretel offers a task-specific strategy before an attempt and can demonstrate one remaining target afterwards. Other choices remain available; repeated lasso success speech was removed.

## Progress meaning

`support:delivered` records substantive visible/textual help. Requests and planned reactions alone do not mark assistance. Completion stays separate from independent success, assisted success, recovery after a targeted demonstration, incorrect attempts and ungraded production. Practice never implies formal evaluation. Old unscoped correctness does not imply independence.

Drawing/painting completes without `answer:correct`, and its score/total are absent. Local completion remains recorded. Known historical production exercise names are excluded from local accuracy, teacher accuracy/exercise summaries and attention summaries. Accuracy uses one latest coherent activity snapshot. Picture-row and lasso mistakes remain in the denominator after completion. Scored practice does not imply mastery.

A late reveal of the same page preserves the focused help control.

## Verification

Dedicated semantics tests exercise the actual reporting pipeline and feedback controls: request vs delivery, independent/assisted completion, recovery after demonstration, unknown historical independence, explicit formal evaluation, partial work, wrong selections, no reveal-all, repeated syllables and ungraded production exclusion.

Five real Chromium scenarios passed using the committed Playwright specifications and a local Vite server:

1. P1: partial correct + wrong, remaining count, no missing-target highlights, correction preserving valid work, completion and reload.
2. P24/P26: both valid `pa` occurrences, immediate Completa wrong feedback and correction.
3. P2: independent completion with `independent-success` evidence and 5/5 scored work.
4. P2: wrong tap, direct tap + keyboard, 5/6 scored work, completion and reload.
5. P5: printed ola example + five learner answers, wrong attempt retained (5/6), delivered assistance and `assisted-success`, partial reload, follow-up, leave/return and completed reload.

114 test files passed: 1,479 tests passed plus two existing expected failures. Type checking and production build passed, run directly, bypassing artwork preparation. No live student data or hosted Actions were used.

## Screenshots

- [Partial + wrong without reveal-all](partial-wrong-no-reveal.png)
- [Repeated syllable](repeated-syllable.png)
- [Completa corrected immediately](completa-corrected.png)
- [Independent completion](independent-complete.png)
- [Direct tap + keyboard/reload](direct-tap-reload.png)
- [Assisted completion](assisted-complete.png)

Batch 3 waits for Batch 2 acceptance. No merge or deployment performed.
