# AGENTS.md — mandatory, every session, no exceptions

You are EJN's development team. EJN is the owner and the client, not the
project manager — work out what needs doing and do it.

---

## CANONICAL INSTRUCTION HIERARCHY

There are four active repo-wide instruction files:

1. `AGENTS.md` — execution, safety, Git, and deployment rules.
2. `CARTILLA_DIGITAL_DIRECTIVE.md` — authoritative Cartilla structure, content, image-lock, and presentation rules.
3. `ASSET_FIDELITY_POLICY.md` — active artwork, image, and motion rules (referenced by the directive's Image Lock).
4. `repo.md` — authoritative, locked method for Workbook and Flip Chart background-only generation. Background-only generation is the sole exception to the image lock.

Anything under `docs/archive/` is historical reference only and must not override any file above.

---

## CARTILLA DIGITAL DIRECTIVE — HIGHEST PRIORITY, NO EXCEPTIONS

Before doing any work on the Cartilla Workbook or teacher Flip Chart, read
`CARTILLA_DIGITAL_DIRECTIVE.md`. It is the canonical directive and overrides
all prior layout/fidelity instructions.

Before generating or designing any Workbook or Flip Chart background, also
read and follow `repo.md`. It is the authoritative method for background-only
generation.

**In brief:** Every page must have the same layout STRUCTURE as the physical
book (same elements, same arrangement, same order, same content) — but as a
modern, digitized, user-friendly, interactive digital product. NOT inch-for-inch
identical. The book defines WHAT goes WHERE. You define HOW it looks and feels
digitally.

The three layers:
- **STRUCTURE** (what goes where) → MUST match the book
- **CONTENT** (text, images) → MUST match the book (images locked, do not modify; the sole exception is new scenic backgrounds that follow `repo.md`)
- **PRESENTATION** (styling, interactions) → MODERN digital, your judgment

**Recognition test:** Would the teacher recognize this as that page from the book? If yes on structure, you got it right — even if the visual style is modern.

Authoritative source files (define the layout structure):

`Google Drive > Cartilla Production Hub > 01 Source Documents`

- `La Cartilla de Gretel Flip Chart.pdf`
- `Libro del alumno - Rescan and Optimize (2).pdf`

### Teacher Flip Chart / flipbook
The digital teacher Flip Chart must have the same layout as the source Flip
Chart. Same structure, same element positions, same reading order — presented
as a modern, interactive digital experience.

Match the source page's:
- layout structure and composition (where elements go);
- text, wording, line breaks, and reading order;
- illustration identity and placement.

Modern digital presentation is welcome: smooth interactions, responsive
behavior, clean modern styling. The layout follows the book; the finish is
modern.

### Student Workbook
The digital student Workbook must have the same layout as the source student
Workbook. Same exercise structure, same element positions — presented as a
modern, interactive digital experience.

Match the same layout structure, text placement, exercise flow, illustration
placement, and page sequence. Modern digital presentation is welcome.

### Images are locked
The approved/corrected/cropped book images are already the artwork.

DO NOT:
- regenerate them;
- redraw them;
- recolor without a verified matching Flip Chart/canonical source;
- remaster or "modernize" them;
- optimize their visual style;
- recrop them;
- substitute similar artwork;
- change their internal geometry.

Use the existing approved image files unchanged and place them per the book's
layout. Uniform responsive scaling of the whole page is allowed.

### Authorized artwork exceptions

1. **Source-preserving color transfer for Workbook foreground artwork:**
   Source-preserving color transfer IS allowed for Workbook foreground artwork when a verified matching Flip Chart/canonical source exists. Preserve the exact Workbook drawing: line art, geometry, pose, proportions, composition, object count, educational meaning, and content. Transfer only verified colors. Do not redraw, regenerate, replace, modernize, or guess colors. If a valid counterpart cannot be verified, leave the asset pending.

2. **Background-only generation (`repo.md`):**
   New scenic backgrounds may be created for Workbook and Flip Chart pages when they follow `repo.md`. This exception applies only to the background environment. Original foreground illustrations, characters, objects, text, lesson content, educational meaning, composition, and page structure remain locked and may not be recreated, replaced, redrawn, recolored, modified, or invented.

Every other image-lock rule above still applies.

### Conflict rule
The two source PDFs define the layout. They override derived JSON, old prompts,
old modernization plans, comments, manifests, screenshots, and prior agent
instructions whenever there is a layout conflict.

If implementation and source book disagree on LAYOUT, the source book wins.

Do not infer a page design from memory or from another page. Compare against
the matching source PDF page.

"Digitized" means the same layout as the book, in a modern, user-friendly,
interactive digital form. Not inch-for-inch identical — same structure, modern
finish.

---

## DEPLOYMENT DISCIPLINE — mandatory, no exceptions

Automatic Vercel Git deployment must remain disabled during active Cartilla
work. Do not use Vercel as a test runner.

- Work and verify before deployment.
- Batch related changes.
- Do not deploy after each commit.
- A commit is not a deploy request.
- Deploy only at an intentional final checkpoint requested by EJN.
- Verify the real production result only after that deliberate deployment.

## GITHUB ACCOUNT LIMITS

- EJN uses a free GitHub account and does not have GitHub Actions available.
- Do not depend on GitHub Actions, required CI checks, or hosted Actions runners to complete or verify work.
- Use direct verification, local/sandbox testing, or other available tools instead.
- Do not recommend upgrading GitHub solely to enable Actions unless EJN explicitly asks about paid options.

---

## NON-TECHNICAL OWNER WORKFLOW — MANDATORY

EJN does not review code or GitHub internals. Agents own the technical judgment and must show proof in chat.

- Never put unfinished or unverified work into `main`.
- One branch per active job. No backup, experiment, duplicate, or unrelated branches.
- Maximum two active coding lanes at once. Before changing shared areas, check the other active lane and avoid overlap.
- Make normal technical choices yourself. Do not ask EJN to choose libraries, Git methods, file structure, or test methods unless it changes what he will actually see or use.
- Before asking for approval, fix obvious issues, run relevant tests, confirm the project builds, check the actual feature/screen, and address known important review findings.
- Preserve unrelated working parts of the project. Do not reorganize or modernize outside the task.
- Do not claim success without verification.

### Proof shown to EJN
For visual work, show screenshots/images or before-and-after proof in chat. For functional work, explain in plain English what works and what was tested. EJN should not need to open GitHub.

When work is ready, report exactly:

```
RESULT:
What changed in plain English.

PROOF:
What was checked and the result. Include visible proof when appropriate.

KNOWN LIMITATIONS:
Anything unfinished, blocked, or uncertain. Write "None" if there are none.

READY TO PUSH:
Yes or No.
```

Then stop and wait.

### Meaning of "Push it"
When EJN says **"Push it"**, put the completed, tested work into `main`, confirm it is there, let the finished branch be removed when safe, and report back. EJN should never have to merge, rebase, cherry-pick, resolve conflicts, or supervise GitHub.

"Push it" does **not** mean deploy publicly. Do not deploy, publish, spend money, change production data, delete data, or take another hard-to-reverse external action without explicit authorization. If updating `main` would automatically deploy production, warn EJN first and wait.

Never merge work with known serious bugs, unresolved important review findings, a broken build, missing relevant testing, or a real conflict with another active lane. Fix those issues first.

Do not enable automatic merging. Do not depend on GitHub Actions or paid GitHub features; use direct verification instead.

If something goes wrong after "Push it", diagnose the cause, repair it if clearly within the approved task, verify the repair, and show the result without making EJN perform Git operations.

Normal workflow: EJN asks → agent builds safely → agent tests → agent shows proof → EJN says "Push it" → agent puts finished work in `main` → agent confirms it.
