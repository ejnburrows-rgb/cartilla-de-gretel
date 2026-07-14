# FRAME-REQUESTS fulfillment STATUS

Branch: `feat/frame-requests-fulfillment` · Production target: main  
Animation timing / page-turn / flipchart **not redesigned**.

| ID | result | asset path | method | wired? | notes |
|----|--------|------------|--------|--------|-------|
| G-01 | **SATISFIED (replacement)** | `public/cartilla/images/gretel/poses/gretel-closed-idle.webp` | source-image-edit from `gretel-idle.webp` | **yes** → `GRETEL_POSES.blinking` | Legacy `gretel-blink.webp` **REJECTED**: 1024×1024 square vs idle 666×1000 portrait; different crop. Not overwritten (do-not-regenerate rule). |
| G-02 | **SATISFIED** | `public/cartilla/images/gretel/poses/gretel-settle.webp` | source-image-edit from idle | **yes** → `settling` state after boot INIT | Enter settle ~680ms then idle |
| G-03 | **SATISFIED** | `public/cartilla/images/gretel/poses/gretel-wave-exit.webp` | existing-verify (copy of `gretel-wave-2.webp`) | **yes** → `exiting` + unmount EXIT | Clear arm-raised goodbye from wave series |
| G-04 | **SATISFIED** | `public/cartilla/images/gretel/poses/gretel-point-left.webp` | source-image-edit mirror of point | **yes** when `bubblePosition==="right"` | Pure flip backup also at `gretel-point-left-flip.webp` (not primary) |
| S-01 | **SATISFIED** | `public/cartilla/art/faithful/vocal-o/oso-blink.webp` | source-image-edit from `oso.webp` | **yes** via `TRUE_BLINK_FRAMES` | page-layouts illustrationSrc match |
| S-02 | **SATISFIED** | `public/cartilla/art/faithful/leccion-7-m/mono-blink.webp` | deterministic-edit closed-lid composite on `mono.webp` | **yes** | image-edit rate-limited; sampled fur-tone lids (not cream sticker) |
| S-03 | **PARTIAL** | `public/cartilla/art/faithful/leccion-8-p/papa-blink.webp` | source-image-edit from `papa.webp` | **yes** for papa | **No pollito/gallina crop** in repo; page-layouts uses `papa.webp` for L8 |
| S-04 | **PARTIAL** | `public/cartilla/art/faithful/leccion-9-s/sapo-blink.webp` | source-image-edit from `sapo.webp` | **yes** for sapo | **No serpiente crop** in `leccion-9-s/` (only sapo/silla/sol/sopa) |
| F-01 | **SKIPPED** | — | unresolved / optional | no | Isolation of full HD flipchart pages would require messy hero masks; leave whole-page breath |

## Contact sheets

- `generated/frame-requests/contact-sheet-gretel.webp`
- `generated/frame-requests/contact-sheet-student-blinks.webp`
