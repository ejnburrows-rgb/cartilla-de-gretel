# Gretel Avatar Video Integration — Scoping Plan (not started, needs approval)

Research-only doc. **No code changed.** Per CLAUDE.md's hard rule, nothing in
`src/components/gretel/` (the animation state machine) gets touched until the
owner explicitly approves a specific approach below.

## Where things stand today

- Gretel is currently a **procedurally-animated** character: `GretelLiveAvatar.tsx`
  moves/scales/rotates an illustration via Framer Motion, driven by
  `gretelMachine.ts` (states: idle, waving, pointing, cheering, talking) and
  fed by real student-action events through `gretel-bus.ts` (already
  event-driven, not hardcoded to pages — see CLAUDE.md status).
- There are **no video files in the repo yet** and only one static image
  (`public/cartilla/images/gretel/gretel-original.png`). The owner has real
  Gretel avatar videos + a transparent-background pose set made separately,
  not yet uploaded.

## Proposed event → clip mapping

Reuses the exact events already firing in `gretel-bus.ts` — no new event
types needed:

| gretel-bus event | Current procedural pose | Proposed video clip |
|---|---|---|
| `mount` / `lesson:start` | wave → idle | `wave.mp4` → loop `idle.mp4` |
| `answer:correct` | cheer 2s → idle | `cheer.mp4` |
| `answer:wrong` | point 2s → idle | `encourage.mp4` (gentle, not "wrong buzzer") |
| `hint:show` | point, held | `point.mp4`, looped/held on last frame |
| `hint:hide` | idle | loop `idle.mp4` |
| `lesson:complete` | cheer 3s → idle | `celebrate-big.mp4` |
| `activity:complete` | cheer | `cheer.mp4` |
| `talk:start` / `talk:stop` | talking loop | `talk-loop.mp4` (mouth movement) ↔ `idle.mp4` |
| `nudge` (10s inactivity) | point | `point.mp4` |
| `page-flip` | (no current pose) | optional `page-flip.mp4`, else skip |

## Proposed file contract (mirrors the faithful-art manifest pattern already in use)

```
public/cartilla/gretel/video/
  idle.mp4          (loop, silent, transparent or matte background)
  wave.mp4
  point.mp4
  cheer.mp4
  celebrate-big.mp4
  encourage.mp4
  talk-loop.mp4
```

- Format: H.264 MP4 with alpha is not broadly supported in browsers — recommend
  **WebM with VP9 + alpha channel** as primary, MP4 (matte/green-screen removed
  via CSS `mix-blend-mode` or a solid-color background matching the app shell)
  as fallback. Owner should confirm which export their video tool produces.
- Each clip: short (1-3s for reaction poses), loud/silent as appropriate (all
  should ship **silent** — `speak.ts` already handles voice separately).

## Proposed integration approach (for approval, not built)

1. New component `GretelVideoAvatar.tsx` alongside (not replacing)
   `GretelLiveAvatar.tsx`. Subscribes to the same `useGretelEvents()` hook —
   zero changes to `gretel-bus.ts` or `gretelMachine.ts`.
2. Per event, swap the `<video>` `src` to the matching clip; fall back to the
   existing procedural `GretelLiveAvatar` animation for any event with no
   clip yet (so partial video delivery never breaks the experience).
3. Feature-gated behind a single flag (e.g. `hasGretelVideo(pose)` checking
   file existence via a small manifest, same pattern as
   `public/cartilla/art/faithful/manifest.json`) so this ships incrementally,
   exactly like the faithful-pages art pipeline.
4. `GretelCelebration.tsx` (the bigger celebration overlay) would get the
   `celebrate-big.mp4` clip; everyday reactions stay small/inline.

## Open questions for the owner (answer when ready to start)

1. Which pose/event list from the table above matches the videos you already
   have vs. still need to record?
2. Video export format — can your tool output WebM+alpha, or only a matte
   background we need to key out?
3. Should video reactions be short one-shots (a few seconds, then return to
   idle) for all of them, or should any loop indefinitely (e.g. idle itself)?
4. OK to build `GretelVideoAvatar.tsx` as a new, separate component (safest,
   fully reversible) rather than modifying `GretelLiveAvatar.tsx` in place?

## Explicitly out of scope for this doc

- No changes to `gretelMachine.ts`, `useGretelAnimation.ts`, or
  `GretelLiveAvatar.tsx`.
- No video files added (none exist yet).
- No component built yet — this is the plan to approve first.
