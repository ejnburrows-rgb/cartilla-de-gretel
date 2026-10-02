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

## Owner-corrected scope — 2026-09-30

Emilio clarified: one splash-screen welcome clip with a simple waving loop.
The earlier 31-video production plan is superseded. Existing lesson scripts do
not create a requirement to produce lesson, milestone or completion videos.

## Simplest welcome experience

- Produce **one 5–6 second MP4** from the approved left Gretel source: warm smile,
  a gentle hand wave, natural blink and subtle breathing. Keep face, outfit and
  proportions identical. Begin and end in the same resting pose for a seamless loop.
- Loop silently on the welcome splash until **Comenzar** is tapped. No repeated
  spoken greeting, soundtrack, progress countdown or forced watching period.
- Comenzar enters the app immediately, without a second how-to video.
- Keep the welcome text as ordinary screen text: “¡Bienvenido a La Cartilla de Gretel!”
- Reuse the same clip for everyone; no personalized or lesson-specific renders.
- One responsive video is enough; separate portrait copies and WebM versions are
  not required. Fit the entire character on phone, tablet and desktop.
- Reduced-motion or data-saving preference, slow loading and errors show the
  approved still, while keeping Comenzar available.

## Integration status and remaining work

Approved master: complete. Produced welcome clip: **0/1**.
The existing media player now supports the silent welcome loop, static fallback, reduced-motion/data-saving behavior and bounded load/stall failures. Comenzar enters the lesson path immediately in one step. The approved still is installed unchanged. The future approved MP4 can be registered without another player implementation.

The existing optional registry is `src/data/gretel-approved-clips.json`.
Register only the produced welcome asset under `master-welcome` with its MP4
and poster. Existing static lesson content can remain; it does not need videos.
No new character design, video service, paid API or multi-video pipeline is required.
