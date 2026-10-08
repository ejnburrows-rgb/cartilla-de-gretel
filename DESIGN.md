# DESIGN — La Cartilla de Gretel

## Latest owner direction — 2026-10-07

The uploaded second eight-panel image is the repeating main-page archetype.
Main lesson pages center the clean workbook itself, with navigation below;
Gretel must not occupy a default side column. Reuse existing content, approved
artwork, activity state and completion gates. Pages grow instead of clipping
content in nested scroll areas. Flipchart uses a clean paper surface with no
background images; source instructional foreground scenes and useful motion
remain. This explicit direction supersedes older side-companion and scenic
Flipchart presentation statements below. Reference title bars are annotations.


> **Finish contract:** Read PROJECT_FINISH_DEFINITION.md before planning or declaring Cartilla work complete. It is the canonical definition of what must be true for the entire project to be finished. Compare current verified reality against it and close only real remaining gaps.


**Status:** CANONICAL DURABLE VISUAL SYSTEM  
**Owner direction locked:** 2026-10-06

This file records reusable visual decisions for the digital Student Workbook and teacher Flip Chart. It does not override the source books on structure/content, `ASSET_FIDELITY_POLICY.md` on artwork, or `STUDENT_INTERACTION_STANDARD.md` on student behavior.

## Design thesis

**The physical Cartilla has gently come alive.**

The product should feel like a carefully preserved Latin American schoolbook translated into a premium digital surface—not a generic children's app, game, dashboard, or scanned PDF.

## Visual world

Use the book's established country/tole folk-art DNA and school-material vocabulary:
- warm cream paper;
- sienna/brown structure and outlines;
- deep Cartilla blue/cobalt accents in broader brand/teacher surfaces;
- canonical teal accents on repeated Student Workbook activity archetypes;
- restrained warm gold;
- graphite marks;
- classic wood pencil;
- nostalgic muted-red school eraser;
- source-faithful illustrations;
- scenic environments only where the surface benefits from them: the Student Workbook uses a clean, quiet digital canvas for dense learner exercises, while the teacher Flip Chart may retain richer source-appropriate scenery.

Digital chrome should recede. The book/page is the main object. Do not surround the learner page with dashboard-like cards, developer status panels, or ornamental app chrome; production controls should stay quiet and subordinate to the Workbook/Flip Chart surface.

## Shared school-tool family

There is one canonical classic wooden pencil and one matching physical school eraser treatment across student activities.

The same family must drive:
- marks and circles;
- line matching;
- retry erase;
- drawing tools;
- pencil-written completions;
- handwriting-adjacent feedback.

Do not create screen-local pencil variants, cartoon-faced tools, generic flat eraser icons, glossy game controls, or unrelated animation styles.

### Pencil presence

Outside the drawing-tool activity, the pencil behaves like a physical **actor**, not permanent UI chrome: it appears near the learner's action, performs one clear mark/draw/erase action, then settles or leaves the active area. It must not float continuously while the child is thinking or cover source lesson content. The drawing activity is the exception because the pencil is an explicitly selected tool.

## Motion language

Motion represents real physical actions with restrained mass.

- one purposeful action, then settle;
- no continuous decorative motion while the learner works;
- no cheap bounce, spin, sticker pop, rope/lasso physics, or arcade feedback;
- use coherent timing/easing tokens rather than activity-local magic numbers;
- reduced motion preserves state clarity without decorative 3D motion.

### Signature page transitions

**Workbook:** side-bound right-hand page curl across the spine, right-to-left on advance; reverse on back. Use a subtle paper underside and moving shadow. Target 0.75–0.85 s.

**Flip Chart:** top-bound sheet lifts from the lower edge and flips upward over the binding/rings on advance; reverse on back. Target 0.9–1.05 s.

Neither should resemble a card flip or cube rotation. The destination page is already present beneath the moving sheet.

## Page composition

Preserve the physical book's element identity, relative placement, sequence, and reading order. Modernization belongs in rendering quality, spacing, responsiveness, accessibility, interaction, and restrained motion—not structural redesign.

### Canonical Student Workbook archetypes

`WORKBOOK_ARCHETYPE_STANDARD.md` is the owner-locked visual system for recurring Student Workbook exercise families. It defines eight reusable visual archetypes and their approved treatment.

The shared Workbook treatment uses warm off-white clean paper, the source teal wave/outline, bold `Instrucciones:` hierarchy, teal target emphasis, white rounded teal-framed work/picture surfaces, restrained mint halo/elevation, a stronger raised treatment only for the active target, restrained lesson pill, and the original star/diamond page marker.

The numbered teal title bars on the archetype reference board are annotations only and never belong in production pages.

Do not create a new family-specific visual language when one of the eight archetypes applies. Reuse the archetype system while preserving the exact source page's wording, artwork, order, markers, and spatial relationships.

### Surface distinction

**Student Workbook:** use a clean digital canvas as the default page surface. Dense exercises must not sit on full scenic wallpaper. The source page still controls the exercise structure, wording, ordering, and foreground illustration identity. Instruction text should read as native digital hierarchy, not as an opaque white patch pasted over scenery. Existing scenic assets remain preserved; they are not automatically rendered behind Workbook activities.

**Teacher Flip Chart:** may retain the richer scenic presentation where appropriate because it is presentation-first. The same source-fidelity and readability rules still apply.

Do not solve the Workbook/Flip Chart distinction by creating unrelated app-card layouts. The page remains recognizable as the book page on both surfaces.

## Responsive behavior

The page remains the dominant object on laptop, tablet, phone, and projector.

- Scale/reflow without moving lesson elements into unrelated app-card layouts.
- Avoid nested page scrolling when the activity can fit through responsive scaling/layout.
- Keep child touch targets and teacher presentation controls comfortably usable.
- Preserve portrait/landscape intent from the source surface.

## Accessibility

- visible keyboard focus;
- keyboard-equivalent paths for interactive student actions;
- sufficient contrast;
- touch-friendly targets;
- reduced-motion support;
- feedback not conveyed by color alone;
- no animation that must finish before accessibility users can understand state.

## Visual proof

For every visible implementation lane, capture milestone screenshots before final completion:
- resting/normal state;
- correct/success state;
- incorrect/retry state;
- distinctive tool/motion state;
- representative responsive view(s).

Screenshots must show the actual implementation, not mockups.
