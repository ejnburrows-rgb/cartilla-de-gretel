# Lesson 3 isolated prototype

## WORKS

The unlinked /prototype/lesson-3-a route renders authentic printed pages7,8,9 from current page-layouts and verbatim book transcription, cream/teal PageFrame, unchanged current original artwork, and the existing pencil/eraser, connector, source handwriting-line renderer, drawing canvas and physical PageCurl. No artwork or voice generated. Historical pez.webp remains correctly identified as avión.

Actual full walkthroughs pass at375×900,768×900,1280×900. Page7 requires all8 correct marks; wrong red circle is erased. Page8 retains4 learner lines plus the printed bee example, retracts the wrong line and gates Next. Page9 accepts4 ungraded handwritten lines and a free drawing; all5 require actual strokes and Listo. Completed preview drawings are retained as immutable images in React memory, preserving them across page returns and resizes. The optional retention prop defaults off for production. All5 decoded images contain real ink before and after returning to the page. The destination paper contributes stage height so navigation stays below the curl.

No application storage writes, global activity events, page errors, mutating network requests or horizontal overflow in these walkthroughs. Existing learner work remains unchanged. The SDK makes a transient lswt storage-availability probe at bootstrap; this is separately recorded and not presented as an activity write or database request. The isolated ActivityContext blocks production reporting and persistence, including the connector's direct legacy progress store. Normal production event/storage behavior is covered by regression checks.

Validation:18 checks in5 focused suites passed; TypeScript passed. Prior reuse checks also passed. Reproduce with scripts/proofs/check-lesson-three-prototype.mjs [375 768 1280], PLAYWRIGHT_CHROMIUM_PATH and optional PROTOTYPE_PROOF_DIR. This workspace Chromium requires software2D canvas to capture its actual pixels; the checker declares that flag. Screenshots, three-width decoded-ink checks and the375px normal-motion recording are saved with the owner evidence.

## DOES NOT WORK

Automated pointer selection was unreliable during the normal-motion pencil close-up. The final375px picture-grid recording uses native keyboard selection; connector/drawing use pointer input. This is not represented as a successful finger-only physical-device test. Earlier accelerated-canvas captures could be blank; those captures are not accepted as final proof.

## NOT VERIFIED

Finger-only physical phone use, Safari, whole-project readiness, owner visual acceptance, independent approving review, assembled main integration and deployment. No main merge or deployment. No lesson/teacher/learner backend data written. This candidate remains draft for visual review and outstanding input validation.
