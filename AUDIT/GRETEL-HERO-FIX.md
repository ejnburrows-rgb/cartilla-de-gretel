# GRETEL-HERO-FIX

**Worker:** E (presentation)  
**Branch:** `grok-swarm/presentation`  
**Date:** 2026-07-12  
**Status:** `GRETEL_HERO_PREMIUM`

## Source inspection

| Asset | Verdict |
| --- | --- |
| `public/cartilla/images/cover.png` | Prototype text cover (LANY) — **not** character art |
| `public/cartilla/images/original/cover.jpg` | Authentic book cover — small seated Gretel (canon clothing) — usable provenance, too small as hero |
| `public/cartilla/images/gretel/gretel-original.png` | **Primary hero source** — full-scene Gretel holding book; golden hair, red bow, blue eyes, pink blush, orange stripes + blue overalls |
| `public/art/hd/gretel-authentic.jpg` | Garden/background plate (not full-body cutout) |
| `public/cartilla/images/gretel/poses/*` | Owner-supplied cutouts; valid for living poses |
| `public/gretel/frames` | **Absent** on this base — presentation pack created under `public/gretel/poses/` instead |
| `public/cartilla/art/living` | **Created** `living/gretel/idle.webp` + `blink.webp` |
| `public/cartilla/art/hero` | **Created** hero pack |

## Rejected sources

- `gretel-wave.webp` — white tee + teal skirt (clothing mismatch vs canon overalls). Not used in wave cycle.
- AI-generated children / dragonflies / stubs — none used.

## Deliverables

| Path | Notes |
| --- | --- |
| `public/cartilla/art/hero/gretel-hero.webp` | 640×853, from `gretel-original.png` |
| `public/cartilla/art/hero/gretel-hero@2x.webp` | 1280×1707 |
| `public/cartilla/art/hero/gretel-hero-cutout.webp` | Idle cutout companion for help/splash chrome |
| `generated/gretel-hero/BEFORE-gretel-hero.webp` | Prior state snapshot |
| `generated/gretel-hero/AFTER-gretel-hero.webp` | Post-fix 1× |
| `generated/gretel-hero/AFTER-gretel-hero@2x.webp` | Post-fix 2× |

## Wiring

- Splash (`/cartilla`) uses `GRETEL_HERO.src` + `srcSet` 2× (replaces broken `gretel-book-right.png` path).
- Help page uses cutout as decorative header art (empty alt; text carries meaning).

## Blink

- **Enabled.** `gretel-blink.webp` is a valid half-lid frame of the same character (canon clothing, matching style). Not defective.
- Reduced-motion: blink timer skipped in `useGretelAnimation`; avatar holds static idle.

## Terminal

```
GRETEL_HERO_PREMIUM
```
