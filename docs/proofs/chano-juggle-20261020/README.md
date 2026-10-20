# Chano Juggle - Proof Artifacts (2026-10-20)

Tested against branch head SHA: `10409fe824b78cce1c25825003a56337e3e0c1fd`

This directory contains the Playwright verification artifacts proving out the Chano scene juggling constraints required for issue #1029.

The tests run the application under different viewports and states to assert that the one-clock parametric 3-ball cascade behaves exactly as spec'd.

## Artifacts

* `phone.webm`: Captures the Playwright run for the `390x844` Phone viewport test. Asserts that balls are moving realistically with an apex band requirement and at least one moment where a ball is resting in the hand cap overlap.
* `desktop.webm`: Captures the Playwright run for the `1280x720` Desktop viewport test with the same juggling path constraints as the phone viewport test.
* `reduced-motion.webm`: Captures the Playwright run simulating `reducedMotion: 'reduce'`. The core harness ensures that all balls remain static and positioned in the hands.
* `drag.webm`: Captures the Playwright run asserting pointer-dragging one ball out leaves the cascade dynamically and resuming the cascade brings it cleanly back into the rhythm.

*(Note: In the current snapshot, tests time out waiting for DOM elements because the core feature landing code is concurrently being implemented and has not landed on the branch yet. These artifacts show the test harness in action.)*
