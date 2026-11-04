# Accessibility & Keyboard Preflight Proof (#561 Excluded Scope)

## Overview
This preflight suite verifies that non-Workbook product surfaces meet accessibility, keyboard reachability, visible focus, semantic naming/roles, and reduced-motion bar before final release.

*Note: Student Workbook page navigation and keyboard behavior are owned separately by #561 and excluded from this spec.*

## Executed Suite & Result
- **Playwright Spec**: `tests/e2e/accessibility-preflight.spec.ts`
- **Result**: `6 passed (17.4s)`
- **Proof Screenshots Directory**: `docs/proofs/accessibility-preflight/`

---

## Non-Workbook Surface Coverage & Findings

### 1. Welcome & Primary Entry Actions
- **Routes Tested**: `/`, `/entrar`
- **Proof Artifacts**: `01-welcome-primary-entry.png`, `01b-entry-entrar.png`
- **Findings**:
  - Main heading `h1#lc-welcome-title` ("La Cartilla de Gretel") provides clear document hierarchy.
  - Primary entry links (`Comenzar` - `[data-testid="wc-entrar"]`, `Soy maestro`) are semantically `<a>` tags with non-empty accessible text.
  - Keyboard focus via `Tab` produces a distinct visible focus outline on both actions.

### 2. Teacher Shell & Navigation
- **Routes Tested**: `/cartilla/teacher/crm`
- **Proof Artifact**: `02-teacher-shell-navigation.png`
- **Findings**:
  - Sidebar navigation landmark (`aside.crm-sidebar`) contains semantic links (`Tablero`, `Alumnos`, `Progreso`, `Lecciones`, `Reportes`, `Arte`, `Ayuda`).
  - Topbar notifications bell has explicit `aria-label="Ver progreso de la clase"`.
  - Class selector dropdown is keyboard focusable and accessible.
  - Sequential `Tab` traversal navigates through all interactive shell elements without focus traps.

### 3. Guide Tabs & Sections
- **Routes Tested**: `/cartilla/teacher/guia`, `/cartilla/teacher/guia/1`
- **Proof Artifact**: `03-guide-tabs-sections.png`
- **Findings**:
  - Folder selection cards (`Guía del profesor`, `Tablas`, `Tareas`, `Evaluaciones`, `Poemas`) are rendered as focusable `<button>` elements with distinct visible focus.
  - Lesson guide view (`/cartilla/teacher/guia/1`) renders accessible tab controls (`Objetivos`, `Procedimiento`, `Recursos`, `Estructura`) that switch active guide content on keyboard `Enter`.
  - Mobile viewports (< 1024px) expose accessible select dropdowns for guide navigation.

### 4. Progress & Report Controls
- **Routes Tested**: `/cartilla/teacher/progreso`, `/cartilla/teacher/reportes`
- **Proof Artifacts**: `04a-progress-controls.png`, `04b-reports-controls.png`
- **Findings**:
  - Progress table utilizes semantic HTML `<table>`, `<thead>`, `<th>`, and `<tbody>` structure with horizontal scroll container support.
  - Reports panel exposes focusable `Exportar CSV` and `Imprimir` action buttons with proper accessible names and focus rings.

### 5. Flip Chart Presenter Controls
- **Routes Tested**: `/cartilla/presentar/1`, `/cartilla/presentar/7`
- **Proof Artifact**: `05-flipchart-controls.png`
- **Findings**:
  - Presenter header buttons carry explicit `aria-label` attributes (`Volver al panel del docente`, `Alternar puntero láser`, `Modo proyección sin cromo`, `Alternar pantalla completa`).
  - Navigation controls (`Lámina anterior`, `Lámina siguiente`) have explicit `aria-label` attributes and visible focus rings.
  - Multi-sheet lessons (e.g. Lesson 7) render `role="tab"` buttons for thumbnail strip tabs with `aria-label="Ir a hoja N"`.
  - Keyboard `ArrowRight`/`ArrowDown` and `ArrowLeft`/`ArrowUp` key bindings smoothly navigate between sheets.

### 6. Reduced Motion Preference
- **Routes Tested**: `/cartilla/presentar/1` with `prefers-reduced-motion: reduce`
- **Proof Artifact**: `06-reduced-motion-chrome.png`
- **Findings**:
  - `data-reduced-motion="true"` attribute is applied to the `FlipchartHdPanel`.
  - Global CSS rules in `a11y.css` and `styles.css` reduce transition durations to instant (`<= 0.001s`), respecting user motion preferences.

---

## Summary Defect Report
- **Defects Found**: `0` blocking product defects identified on tested non-Workbook surfaces.
- **Verification Status**: PASSED.
