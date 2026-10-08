# WORKBOOK ARCHETYPE STANDARD — La Cartilla de Gretel

## Latest owner direction — 2026-10-07

The uploaded second eight-panel image is the repeating main-page archetype.
Main lesson pages center the clean workbook itself, with navigation below;
Gretel must not occupy a default side column. Reuse existing content, approved
artwork, activity state and completion gates. Pages grow instead of clipping
content in nested scroll areas. Flipchart uses a clean paper surface with no
background images; source instructional foreground scenes and useful motion
remain. This explicit direction supersedes older side-companion and scenic
Flipchart presentation statements below. Reference title bars are annotations.


> **Status:** CANONICAL OWNER-LOCKED STUDENT WORKBOOK VISUAL SYSTEM  
> **Owner direction:** 2026-10-06  
> **Scope:** recurring Student Workbook exercise families only

This file is the durable source of truth for how repeated Student Workbook exercise families must look. It complements the physical Workbook source, `CARTILLA_DIGITAL_DIRECTIVE.md`, `STUDENT_INTERACTION_STANDARD.md`, `DESIGN.md`, and `UX-CONTRACT.md`.

## Non-negotiable interpretation

The physical Workbook page remains authoritative for **content and page identity**.

Every digital page must remain immediately recognizable as its exact physical source page. Preserve:
- exact wording;
- exact approved artwork;
- exact exercise structure;
- original content order;
- original page outline/wave;
- lesson/page markers;
- major spatial relationships;
- educational objective.

The repeated digital **presentation** is not open-ended agent judgment. For each recurring exercise family, use the matching canonical archetype below.

The owner-supplied eight-panel reference board from 2026-10-06 is the visual source for this standard (source image SHA-256: `66dadbc0bca8dab6548421a3eadac351bb93546b4a197a4597261c305fa6ef3d`). Its production interpretation is transcribed below so agents do not depend on chat history.

**Important:** the numbered teal title bars at the very top of each panel in that reference board are annotation labels only. They are **not** part of the original Workbook and must never be added to production pages.

Everything below those annotation bars is the approved visual direction for the matching repeated exercise family, while page-specific wording, artwork, options, lesson/page numbers, and source structure always come from that exact physical source page.

## Shared Workbook visual treatment

Across all eight archetypes:
- warm off-white / very subtle clean paper surface;
- preserve the original teal source-side wave/outline;
- friendly rounded early-reader typography;
- bold `Instrucciones:` hierarchy;
- teal emphasis on target letters/syllables;
- white picture/work surfaces with rounded teal frames;
- restrained mint halo and soft elevation;
- stronger raised treatment only for the main active letter/syllable/target;
- restrained lesson pill;
- original star/diamond-style page marker;
- clean premium K–2 e-learning polish;
- no scenic Student Workbook wallpaper behind dense learner exercises;
- no generic SaaS/card-dashboard redesign.

Do not regenerate, redraw, recolor, or replace source artwork outside the narrow permissions in `ASSET_FIDELITY_POLICY.md`.

## The eight canonical visual archetypes

### 1. Picture grid / circle-X
Use for source pages built around a picture grid where the child circles or marks matching pictures.

Canonical structure:
- instruction at top;
- source-faithful picture grid;
- each picture sits on a clean white rounded teal-framed surface;
- source row/column relationships remain recognizable;
- use the shared Pencil/Eraser mark behavior.

Representative source family includes page 1 and vowel picture-grid pages.

### 2. Vowel/letter + row choices
Use for source pages with one target letter/vowel at the left of each row and picture choices across that row.

Canonical structure:
- source letter/vowel remains the row anchor;
- choices remain in their original row relationship;
- rounded white/teal picture surfaces;
- selected/correct work uses the shared Pencil/Eraser language.

Representative source page: page 2.

### 3. Multi-pair matching / connect
Use only when the physical source is genuinely a multi-source / multi-target matching layout.

Canonical structure:
- preserve the source columns/rows and correspondence geometry;
- draw direct learner connectors between the source endpoints;
- do not convert it into a central-target layout.

Representative source page: page 3.

### 4. Single target + surrounding pictures
Use when one central letter/vowel/object is surrounded by picture choices.

Canonical structure:
- one clearly raised central target;
- surrounding pictures retain the source-faithful 3–2–3 or exact physical arrangement;
- direct teal pencil connectors originate from the central target;
- surrounding targets highlight on approach;
- correct lines remain; incorrect lines retract/erase for retry.

Representative vowel pages: **5, 8, 11, 14, 17**.  
**Page 17 Uu is the canonical visual reference for this archetype.**

This archetype may use the same underlying Pencil Line interaction behavior as matching activities. Visual archetype classification and interaction-adapter ownership are separate concepts.

### 5. Handwriting / tracing + open drawing
Use for pages combining letter formation/tracing/writing with an open drawing prompt.

Canonical structure:
- preserve the original writing-line order and relative proportions;
- large checkpoint/stroke-order tracing is the desktop default where applicable;
- optional freehand tracing remains available;
- open drawing area stays source-faithful and uses the existing drawing canvas/tools.

Representative source page family begins with page 6.

### 6. Syllable recognition / circle
Use for repeated syllable rows where the learner circles/selects the correct word/syllable response.

Canonical structure:
- syllable anchor remains visually prominent;
- word choices preserve source row/grouping;
- use shared real Pencil/Eraser circle behavior;
- no generic quiz cards.

Representative source page: page 20 and equivalent consonant syllable pages.

### 7. Phonics / reading practice
Use for letter/syllable/vocabulary/sentence reading pages.

Canonical structure:
- preserve the original reading hierarchy and order;
- keep letter/syllable emphasis visually strong but restrained;
- vocabulary and sentences remain source-faithful;
- valid existing audio may be attached to words/sentences without changing layout.

Representative source page: page 21 and equivalent reading pages.

### 8. Complete-the-word + sentence writing
Use for pages combining syllable/word completion and open sentence writing.

Canonical structure:
- preserve the original word boxes, blanks, choices, and writing lines;
- existing syllable choices may be draggable into the original blank with click/tap fallback;
- sentence writing defaults to typed input on digital handwriting lines with optional freehand mode;
- preserve existing persistence/completion state.

Representative source family includes page 22 and later equivalents such as page 50.

## Source-first classification rule

Before changing any Workbook page:
1. open that exact physical Workbook source page;
2. classify its actual source structure into the matching archetype(s);
3. do not infer one page from a neighboring page;
4. mixed pages may use more than one archetype when the physical source genuinely contains multiple activity families;
5. source-blocked pages remain blocked.

Current known blocked pages: **86–87**. Do not infer their text, artwork, region types, or archetype.

## Interaction ownership

`WORKBOOK_ARCHETYPE_STANDARD.md` owns the repeated **visual/source-layout family**.

`STUDENT_INTERACTION_STANDARD.md` and `UX-CONTRACT.md` own the shared behavior/state system:
- Circle/X → shared Pencil + Eraser;
- line matching / central-target connectors → shared Pencil Line behavior;
- matching/placement → existing drag/drop with click/tap fallback;
- tracing → existing tracing templates/state;
- handwriting → existing writing state;
- complete-word → existing placement/writing state;
- drawing → existing freehand canvas/tools;
- reading → existing audio/focus behavior where valid.

Do not build a second interaction engine merely because two visual archetypes use related gestures.

## Reuse rule

Build one definitive implementation for each recurring archetype, then reuse that implementation across all source-equivalent pages.

Do **not** manually redesign every page.  
Do **not** make every page identical.  
The reusable archetype supplies the visual/interaction system; the exact physical source page supplies the page-specific content and spatial relationships.

## Focus mode

For precision-heavy interaction regions — line matching, drag/drop, tracing, drawing, handwriting, sentence writing — the existing source activity region may temporarily expand into a larger working area.

The underlying page remains unchanged. Preserve content, order, relationships, and source identity. Completion returns to the source-faithful page.

## Verification

For every archetype implementation:
- compare the rendered result against the exact physical source;
- verify desktop and tablet;
- verify normal / active / success / retry states where applicable;
- verify persistence/reload and completion gating;
- verify mouse/touch/keyboard paths as applicable;
- show actual rendered proof, never a mockup.

A page is not complete merely because its code maps to an archetype. The rendered page must still look like that exact page from the physical Workbook.
