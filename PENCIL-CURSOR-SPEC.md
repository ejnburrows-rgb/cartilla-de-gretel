# OFFICIAL SOURCE OF TRUTH — PENCIL CURSOR & WRITING MECHANICS (`PENCIL-CURSOR-SPEC.md`)

> **Execution policy:** [AGENTS.md](AGENTS.md). **Current assignments and approval status:** [GitHub #877](https://github.com/ejnburrows-rgb/cartilla-de-gretel/issues/877). **Authoritative Status:** THIS DOCUMENT IS THE SINGLE **OFFICIAL SOURCE OF TRUTH** FOR THE PENCIL CURSOR VISUALS AND WRITING MECHANICS ACROSS THE ENTIRE REPOSITORY.

**Status:** OFFICIAL OWNER-APPROVED SOURCE OF TRUTH  
**Approved by:** Emilio  
**Approved on:** 2026-11-18 (amended 2026-11-20: exact `74ccee59` cursor pencil photo + Oct 11 `74d904ec` classic wooden pencil with pink eraser)  

> **Supersedes & Retires Rejected Redraws:** The Nov 17 cartoon `owner-eraser.svg` redraw, added synthetic barrel extensions, checkerboard screenshots, skinny SVG toothpicks (`scale(0.65)`), standalone pink eraser bricks (`PinkEraserBlock`) on non-canvas modes, and duplicate secondary flying pencil sprites are permanently retired and prohibited.

---

## 1. Visual Identity (Two Exact Owner-Approved Sources)

1. **Cursor / Writing Pencil (`74ccee59` / `b402cde8`):**
   - Exact owner-selected photographic sharpened wooden pencil (`owner-pencil-tip.webp` embedded byte-for-byte in `public/cartilla/images/ui/owner-pencil-tip.svg` and `ownerPencilPhotoAssets.ts`, `600×497`, `38,250` bytes, transparent background).
   - Shown **exactly as approved**: no added synthetic barrel extension, no clipping, no checkerboard background.
   - Sharp dark graphite point sits at exact `(0, 0)` hotspot (`transform-origin: 0px 0px`).

2. **Eraser End (`74d904ec` #692 / `b402cde8` `PencilShape`):**
   - When erasing a wrong mark (or in manual eraser mode), the single cursor switches to the owner-approved classic wooden pencil (`PencilShape` / `ClassicWoodenPencil` in `WorkbookPencilMark.tsx`), flipping `180°` onto its **pink eraser dome and ribbed silver ferrule** (`ERASER_POSE`).
   - Standalone pink eraser bricks (`PinkEraserBlock`) and the Nov 17 cartoon `owner-eraser.svg` are permanently prohibited.

---

## 2. Orientation & Hotspot (**Prototype B** Reference)

- **Direction:** The sharp graphite point faces **up and to the left**; the yellow-painted barrel extends **down and to the right** (`45°`).
- **Exact `(0, 0)` Hotspot:** The very tip vertex of the dark graphite point sits at pixel `(0, 0)` in cursor coordinates (`transform-origin: 0px 0px`).
- Hovering and writing keep this exact same appearance, orientation, and sharp zoomed-in scale:
  - Desktop / fine pointer head size: `252 × 209` CSS px (extended seamlessly to viewport edge)
  - Mobile / coarse pointer head size: `168 × 139` CSS px (extended seamlessly to viewport edge)

---

## 3. Hand-Guided Lowering & Zero-Offset Writing Mechanics

1. **Natural Lowering Without Showing a Hand:**
   - Before each mark begins (`approachMs = 300ms`), the pencil glides toward the stroke start point slightly raised above the page (`lift > 0` and subtle wrist pivot around `transform-origin: 0px 0px`) and lowers smoothly onto the page so touchdown hits `0.00px` lift and `0.00px` offset (`ms === first.begin`).
   - Do **not** render any hand holding the pencil.

2. **Continuous Tip-Locked Reveal (Zero Gap or Offset):**
   - Keep the same close-up scale and crisp detail throughout every action.
   - The very end of the graphite point is always the exact pixel where the ink/graphite mark forms (`0.00px` gap or ahead-of-tip overhang).
   - **Circle Action (`2000ms`):** As the pencil guides clockwise around the picture, the charcoal `#3a3a38` line (`3.3–6.4px` velocity-modulated + `#charcoal-paper-grain` filter) reveals continuously behind the moving graphite tip via a `strokeLinecap="butt"` mask synced to `getTipFlight()`, closing smoothly without an overlap club/lump.
   - **X Action (`850ms` per stroke + `260ms` hop):** The pencil draws Diagonal 1 continuously from its moving tip, gently lifts across the `260ms` hop, lowers onto Diagonal 2 at `0.00px` offset, and draws Diagonal 2 sequentially from its moving tip.
   - **Hold & Grading:** Hold the finished charcoal mark for `400ms` (`PENCIL_CONTRACT.holdMs`), then transition to Forest Green (`#258351`, stays) or Crimson Red (`#c4320a`, wrong mark erased with 12 pink SVG crumbs).

---

## 4. Official Runtime Implementation Files

| Responsibility | Canonical File |
| :--- | :--- |
| Photographic `74ccee59` cursor pencil asset | [ownerPencilPhotoAssets.ts](src/components/StudentBook/ownerPencilPhotoAssets.ts) |
| Shared unclipped SVG renderer (`74ccee59` photo only) | [OwnerPhotoPencilSvg.tsx](src/components/StudentBook/OwnerPhotoPencilSvg.tsx) |
| Single pointer-following & flight-choreography host (writing photo + Oct 11 `PencilShape` eraser) | [ContractPencilCursor.tsx](src/components/StudentBook/ContractPencilCursor.tsx) |
| Legacy `?cursor=tip` pointer renderer | [PencilTipCursor.tsx](src/components/StudentBook/PencilTipCursor.tsx) |
| Synchronized `butt`-capped reveal mask, Oct 11 `PencilShape` eraser & loop geometry | [WorkbookPencilMark.tsx](src/components/cartilla/WorkbookPencilMark.tsx) |
| Shared timing, easing & flight coordinates (`PENCIL_CONTRACT`) | [pencil-contract.ts](src/lib/pencil-contract.ts) |
| Default cursor mode (`contract`) & head dimensions (`toolSize`) | [cursor-mode.ts](src/lib/cursor-mode.ts) |
| Cursor layer styles & system pointer hiding rules | [workbook-pencil.css](src/styles/workbook-pencil.css) |
| Exact `74ccee59` / `b402cde8` SVG file asset on disk | [owner-pencil-tip.svg](public/cartilla/images/ui/owner-pencil-tip.svg) |
