# DESIGN — La Cartilla de Gretel

**Status:** CANONICAL DURABLE VISUAL SYSTEM  
**Owner direction locked:** 2026-10-03

This file records reusable visual decisions for the digital Student Workbook and teacher Flip Chart. It does not override the source books on structure/content, `ASSET_FIDELITY_POLICY.md` on artwork, or `STUDENT_INTERACTION_STANDARD.md` on student behavior.

## Design thesis

**The physical Cartilla has gently come alive.**

The product should feel like a carefully preserved Latin American schoolbook translated into a premium digital surface—not a generic children's app, game, dashboard, or scanned PDF.

## Visual world

Use the book's established country/tole folk-art DNA and school-material vocabulary:
- warm cream paper;
- sienna/brown structure and outlines;
- deep Cartilla blue/cobalt accents;
- restrained warm gold;
- graphite marks;
- classic wood pencil;
- nostalgic muted-red school eraser;
- source-faithful illustrations and scenic backgrounds.

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
