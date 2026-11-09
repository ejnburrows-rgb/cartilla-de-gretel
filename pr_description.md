🎯 **What:** Removed the deprecated `illustrationWord` field from the `PageRegion` interface in `src/lib/book-faithful.ts`. Replaced its fallback usage in components and updated pilot data files to rely strictly on canonical `caption` and `illustrationSrc`.

💡 **Why:** `illustrationWord` was a legacy field mapped to invented vector drawings, which conflicted with the project's goal of maintaining faithful digitization of the source material. Removing this technical debt ensures future developers avoid mistakenly implementing logic around this non-canonical field and guarantees the codebase solely targets verified transcriptions.

✅ **Verification:**
Ran the full test suite and code quality checks successfully:
- `pnpm run typecheck` - passed
- `pnpm run lint` - passed (after standard fixes)
- `pnpm run test` - passed (210 suites, 2111 tests passed, 2 expected fail)
All related assertions in `src/lib/__tests__/book-faithful.test.ts` were updated and confirmed to pass.

✨ **Result:** Cleaned canonical type definitions, reduced fallback complexity in `FaithfulPageRenderer` and `WorkbookPageRenderer`, and eliminated a deprecated data structure from the codebase without affecting active functionality.
