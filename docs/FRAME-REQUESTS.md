# FRAME-REQUESTS — hand-drawn / photo frames for living art

**Policy:** Ambient life uses **existing faithful pixels** only (transforms, true
alternate frames from source crops, or soft lid overlay when no true frame).
Never invent characters, restyle proportions, or text-to-image from scratch.

**Status as of production (post-#177):** G-01…G-04 and S-01…S-04 wired.
F-01 remains optional/skipped (full-page flipchart breath only).

---

## Gretel (mascot) — primary path is GretelPresence (#178/#181), NOT corner sticker

| ID | Need | Status | Asset | Wiring |
|----|------|--------|-------|--------|
| **G-01** | Closed-eye idle | **SATISFIED** | `public/cartilla/images/gretel/poses/gretel-closed-idle.webp` | `GretelPresence` blink layer; legacy `gretel-blink.webp` rejected (wrong canvas 1024² vs idle 666×1000) |
| **G-02** | Settle / land | **SATISFIED** | `…/gretel-settle.webp` | FSM `settling` after boot (GretelLiveAvatar path); Presence uses enter CSS settle |
| **G-03** | Exit / wave goodbye | **SATISFIED** | `…/gretel-wave-exit.webp` (from `gretel-wave-2.webp`) | FSM `exiting` |
| **G-04** | Point-left | **SATISFIED** | `…/gretel-point-left.webp` | `pointingLeft` when bubble on right |

**Do not regenerate:** idle, wave×3, point, cheer×2, talk×3 under `public/cartilla/images/gretel/poses/`.

---

## Student workbook (LivingIllustration true blink map)

| ID | Character | Status | Open crop | Blink frame |
|----|-----------|--------|-----------|-------------|
| **S-01** | oso | **SATISFIED** | `/cartilla/art/faithful/vocal-o/oso.webp` | `…/oso-blink.webp` |
| **S-02** | mono | **SATISFIED** | `/cartilla/art/faithful/leccion-7-m/mono.webp` | `…/mono-blink.webp` |
| **S-03** | pollito/gallina | **PARTIAL → papa** | No pollito crop in repo; layouts use `papa.webp` | `…/leccion-8-p/papa-blink.webp` |
| **S-04** | serpiente | **PARTIAL → sapo** | No serpiente crop; folder has sapo/silla/sol/sopa | `…/leccion-9-s/sapo-blink.webp` |

Map: `src/lib/living-blink-map.ts` → `LivingIllustration` prefers true frame while blinking.

---

## Teacher flipchart

| ID | Status | Notes |
|----|--------|-------|
| **F-01** | **SKIPPED (optional)** | No clean hero isolation without restyle; whole-page breath only |

---

## Out of scope

- Walk cycles, head turns, invented visemes
- Vectorization / recolor / proportion changes
- AI “same character” replacements for missing pollito/serpiente crops
