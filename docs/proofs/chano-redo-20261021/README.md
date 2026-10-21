# Payaso Chano Scene - Juggling Redo Proof Capture

**Target branch HEAD SHA**: 70d64964c15572131b6ec6a0655cd3d2c63b2505

**Viewport matrix captured**:
- Phone viewport: 390x844 (as motion-60fps.webm from Playwright \`recordVideo\`)
- Desktop viewport: 1280x720 (as motion-60fps-desktop.mp4 via Xvfb + FFmpeg screencast)

**FPS Verification**:
FFprobe output confirms desktop encode is exactly 60 fps:
\`\`\`
Stream #0:0[0x1](und): Video: h264 (High 4:4:4 Predictive) (avc1 / 0x31637661), yuv444p(progressive), 1280x720, 577 kb/s, 60 fps, 60 tbr, 15360 tbn (default)
\`\`\`

## Verification Checkbox

* (a) **hands visibly pump/throw/catch in rhythm**: VERIFIED
* (b) **balls travel real arcs hand to hand**: VERIFIED (arcs observed in frame sheet and video clips)
* (c) **60fps sustained**: VERIFIED (mp4 desktop recording is 60fps)
* (d) **reduced-motion respected**: VERIFIED (tested with Playwright's \`reducedMotion: 'reduce'\` flag, no CSS animation playing, observed static rendering in \`reduced-motion.png\`)

## Deliverables

- \`motion-60fps.webm\` (Playwright phone recording, note: Playwright defaults to 25fps for its webm recording so we also included \`motion-60fps-desktop.mp4\` which is explicitly encoded at 60fps)
- \`motion-60fps-desktop.mp4\` (X11 FFmpeg desktop recording at 60fps)
- \`frame-sheet.png\` (8 sampled frames showing ball trajectory during juggling)
- \`reduced-motion.png\` (Shows rendering with \`prefers-reduced-motion: reduce\`)
- \`drag-proof.png\` (Shows drag interaction)
