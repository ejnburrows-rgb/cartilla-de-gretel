# Fix 1 — unavailable lesson leaves

Runtime source: a1df2173f32768e4c48a8a1964f25699f203332a (tree 36574681ce606127e60484215ac8fc9e92467cd9).

## WORKS
- At 375×812 and 1280×900, actual lesson navigation renders 83 → 84 → 85 for Lesson 23 and 88 → 89 → 90 for Lesson 24, with no missing-page placeholder or unsupported empty Piano leaf. See navigation-375.mp4 and navigation-1280.mp4 and per-page PNGs.
- Both viewports reject Next on incomplete page 83, then navigate using seeded local completion, go backward and forward, and finish Lesson 24 through its existing final celebration to the lesson list. results.json records the assertions; zero browser page errors.
- 31 focused tests pass (native-workbook-coverage, release-integration, usePianoListening); TypeScript passes. Logs attached.

## DOES NOT WORK
- None observed within the tested navigation slice. Earlier capture failures were headless speech-probe crashes, Playwright refusing an intentionally disabled click, and assertions shorter than the physical turn/celebration. The final capture disables recognition to represent an unsupported device and waits for actual transitions; no product completion gates were relaxed.

## NOT VERIFIED
- Real phone hardware, microphones, on-device recognition and actual Piano speech sessions. Available-Piano page entries and capability transitions have unit coverage, not new hardware proof.
- Exercise answer correctness and handwriting persistence are not certified by seeded completion. The videos test navigation, not real exercise completion. Anonymous local mock data only; app outbound requests blocked, no real student/backend writes.
- No full release build, merge or deploy. Other eight handoff fixes have not been executed in this first fix session. No art/audio was generated or changed.
