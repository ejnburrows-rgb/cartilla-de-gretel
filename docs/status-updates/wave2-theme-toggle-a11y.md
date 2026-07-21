# Wave 2 — Theme-toggle accessibility (issue #163)

`ThemeToggle` now has a 44x44px tap target (`h-11 w-11`) and a Spanish `aria-label`
("Cambiar a modo claro/oscuro"). Added `src/test/theme-toggle-a11y.test.tsx`
asserting the accessible name and tap-target classes.

Proof: `pnpm exec vitest run theme-toggle-a11y ui-features` → 4 passed; typecheck clean.
Completed directly (Wave 2, option B).
