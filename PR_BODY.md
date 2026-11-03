🎯 **What:** Extracted the inline `onKeyDown` and `onBlur` logic for renaming students in `StudentTable.tsx` into named helper functions `handleInputKeyDown` and `handleInputBlur`.

💡 **Why:** Deeply nested conditionals and inline callbacks increase cognitive load. Pulling this out into well-named functions makes the render block significantly easier to read and maintain, addressing the code health issue.

✅ **Verification:** Verified by ensuring the application type checks successfully with `pnpm run typecheck`, passes ESLint analysis for the modified file, and that the existing test suite completes its execution. The visual regression/performance budget tests failed, but that was due to pre-existing threshold limits and mock missing configurations inside the original repo.

✨ **Result:** Improved maintainability of `StudentTable.tsx` by reducing nesting and enhancing readability, while retaining identical UI and logic behavior.

Tests result: 217 passed, 1 failed (performance budget issues unrelated to changes).
