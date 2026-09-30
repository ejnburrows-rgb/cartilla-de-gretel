# Gretel: candidates and Flow motion contract

Status: **Exact Gretel 2.0 master confirmed by Emilio on 2026-09-30**.
Emilio selected **A / the left image** from the presented side-by-side candidates.
The approved original is **Folk Art Girl with Red Bow.png**, Google Drive file
`1UDgi3wPfKhrp9P_fovYisN5E0G0Wnw6W`:
https://drive.google.com/file/d/1UDgi3wPfKhrp9P_fovYisN5E0G0Wnw6W/view

This exact image is the source for all Gretel stills, poses and 31 animation clips.
The right candidate is not the selected master. Preserve the approved face,
hair, red bow, striped blouse, blue dress, floral trim and proportions; never
create a third character style. The machine-readable source identity is recorded
in `src/data/gretel-approved-master.json`. Selection does not certify existing
poses as matching or imply that any clip has been produced.

## What exists today (20 files)

| File | Size | Background | Style | Viable as master? |
|---|---|---|---|---|
| `public/art/hd/gretel-authentic.jpg` | 768×1024 | opaque, painted garden, holds the book | book cover | Reference only (has scenery) |
| `cartilla/images/gretel/gretel-autentica.png` | 1086×1448 | **opaque black** | book cover (striped sleeves, knee socks) | Yes, after a clean cut-out |
| `cartilla/images/gretel/gretel-autentica.jpg` | 768×290 | opaque | head crop | No |
| `poses/gretel-idle`, `-point`, `-point-left-flip`, `-talk`, `-talk-0`, `-cheer` (.webp) | 666×1000 | real transparency | painted doll | Yes (one consistent family) |
| `poses/gretel-settle.webp` | 666×1000 | near-white box | painted doll | Needs clean-up |
| `poses/gretel-closed-idle`, `-point-left` | 666×1000 | **black box** | painted doll | Needs clean-up |
| `poses/gretel-blink`, `-cheer-1`, `-talk-1`, `-talk-2`, `-wave`, `-wave-1`, `-wave-2`, `-wave-exit` | 1024×1024 | **fake checkerboard baked in** or black | mixed; `-wave` is off-model (white blouse, teal skirt) | No |

The master must match the approved Gretel 2.0, including her striped blouse,
blue dress, floral trim, blonde hair and red bow. Existing files do not become
approved merely because they have real transparency.

## Where it plugs in

- Scene list: `src/content/gretel-cinematics.ts` (`GRETEL_CINEMATICS`, 31 scenes).
- Player: `src/components/gretel/GretelCinematic.tsx` with `GretelSceneMedia.tsx`.
  `src/data/gretel-approved-clips.json` maps scene IDs to
  `{ mp4, webm?, poster }` for produced, approved clips. The catalog reads this
  registry; it is currently empty. No placeholder video URLs are registered. The player runs each clip
  once, restores the poster on completion, supports explicit replay, and falls
  back after load/play errors or a two-second startup timeout. Reduced motion
  and data-saving requests prevent video loading. Browser speech is temporary;
  the final owner-supplied voice remains deferred.
- Live helper: `src/components/gretel/GretelLiveAvatar.tsx` (poses above; respects reduced motion).

## Motion contract (for Google Flow clips)

1. **31 clips**, one per scene id: `master-welcome`, `how-to`, `lesson-01-intro` … `lesson-24-intro`,
   `milestone-6`, `milestone-12`, `milestone-18`, `milestone-24`, `cartilla-final`.
2. Length = the scene's `durationSeconds` (7–10 s). 16:9 and 9:16 masters, 1080p, H.264 MP4 + WebM,
   no burned-in text (captions stay live text), no background music.
3. Every clip **starts and ends on the same master still** (first and last frame identical to the
   master pose), so it can hand off to the still without a jump.
4. **Plays once**, then settles on the still. Never loops. "Repetir" replays it on request.
5. **Reduced motion** (`prefers-reduced-motion`): no video; show the still + caption + voice.
6. **Static fallback**: if the clip fails to load within 2 s, or on slow data, show the still.
7. Gretel never covers instructional content: clips play only in the intro/celebration dialog,
   and the child can always press "Comenzar" to skip.
8. Same outfit, face and proportions as the chosen master in every clip.

## Still to produce (master choice complete)

- 1 clean transparent master still (PNG/WebP, ≥1400 px tall) + 4 matching poses
  (idle, point, talk, cheer) in the same family.
- 31 Flow clips per the contract above (62 files with both aspect ratios), plus a poster frame each.
- Register only produced and visually approved files in the existing optional
  `video` field per scene. Playback integration is implemented; media production
  remains unfinished. The exact-master confirmation is complete.
