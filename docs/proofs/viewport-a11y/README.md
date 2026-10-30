# Track C: Viewport Ergonomics & Accessibility Verification (375px–1280px)

## 1. Overview & Scope
This test run and evidence package verifies viewport ergonomics and accessibility standards across the workbook and native lesson viewer for mobile, tablet, and desktop viewport sizes (375px to 1280px).

### Exclusive File Boundaries Enforced
- `src/styles/lesson-cutoff-fixes.css` [MODIFIED: >= 44px touch targets on cutoff-fix writing pages & reduced motion dampening]
- `src/styles/native-lesson.css` [MODIFIED: viewport overflow prevention, >= 44px minimum touch targets for toolbars, tracing toggles, navigation controls, and prefers-reduced-motion static dampening]
- `tests/e2e/workbook-a11y.spec.ts` [NEW: 14 deterministic Playwright E2E verification tests]
- `docs/proofs/viewport-a11y/` [NEW: video recordings, screenshots, and evidence artifacts]

---

## 2. Verification Criteria & Results

### A. Viewport Ergonomics (Zero Horizontal Page Scroll)
Tested across:
1. **375px** (iPhone SE: 375x667)
2. **390px** (iPhone 13: 390x844)
3. **768px** (iPad: 768x1024)
4. **1280px** (Desktop / Laptop: 1280x800)

**Results:**
- `document.documentElement.scrollWidth <= window.innerWidth` across all viewports and all tested lessons (Lesson 7 Archetype 5, Lesson 8 Syllables & Fill-in-the-blank, Lesson 11 Cutoff writing page 35).
- `document.body.scrollWidth <= window.innerWidth` verified with zero overflow (`scrollX === 0`).
- No clipping or horizontal scrollbars observed.

### B. Minimum Touch Target Discipline (WCAG 2.5.5 / 2.5.8 >= 44px)
- **Drawing Toolbar (`.am-dibuja__toolbar`):**
  - Swatches (`.am-dibuja__swatch`): >= 44px width, >= 44px height.
  - Eraser (`.am-dibuja__tool--eraser`): >= 44px width, >= 44px height.
  - Undo & Clear tools (`.am-dibuja__tool`): >= 44px width, >= 44px height.
  - Done button (`.am-dibuja__done`): >= 44px width, >= 44px height.
  - Page 35 Cutoff-fixes scope: verified all drawing toolbar controls strictly maintain >= 44px minimum touch targets.
- **Tracing Controls (`.fp-trace__mode-toggle`):**
  - Mode toggle button: >= 44px width, >= 44px height.
  - Reset button: >= 44px width, >= 44px height.
- **Navigation Controls (`.native-lesson-viewer__navigation button`):**
  - "Anterior" and "Siguiente": min-width >= 44px, min-height >= 48px.

### C. Reduced Motion (`prefers-reduced-motion: reduce`)
- 3D curling animation (`.native-page-curl`) and corner peel visual indicators (`.native-corner-peel`) are completely suppressed.
- Pulsing activity outlines are disabled (`animation: none`).
- State transitions are immediate (< 200ms) with zero disorienting movement or animation loops.

### D. Keyboard Accessibility
- **Enter/Space Button Activation:**
  - Navigation buttons ("Anterior", "Siguiente") activate via both `Enter` and `Space`.
  - Tracing toggle mode button activates via both `Enter` and `Space`.
  - Syllable word buttons (`.native-syllable__word`) activate via keyboard `Enter` and `Space`, placing approved pencil marks.
- **Arrow Key List Navigation:**
  - Dibuja swatch listbox navigates between color options using `ArrowRight` and `ArrowLeft` with active focus tracking.
  - Native lesson viewer supports `ArrowRight` and `ArrowLeft` for turning completed pages.

---

## 3. Video Proof Artifacts
Recorded Playwright video sessions demonstrating real browser execution across viewports:
- [viewport-375px.webm](./viewport-375px.webm) (iPhone SE: 375x667)
- [viewport-768px.webm](./viewport-768px.webm) (iPad: 768x1024)
- [viewport-1280px.webm](./viewport-1280px.webm) (Desktop: 1280x800)

## 4. Screenshot Proof Artifacts
- `375px-iphone-se-lesson7.png`
- `375px-iphone-se-lesson8.png`
- `375px-iphone-se-lesson11.png`
- `390px-iphone-13-lesson7.png`
- `390px-iphone-13-lesson8.png`
- `390px-iphone-13-lesson11.png`
- `768px-ipad-lesson7.png`
- `768px-ipad-lesson8.png`
- `768px-ipad-lesson11.png`
- `1280px-desktop-lesson7.png`
- `1280px-desktop-lesson8.png`
- `1280px-desktop-lesson11.png`
- `reduced-motion-static-p24.png`
