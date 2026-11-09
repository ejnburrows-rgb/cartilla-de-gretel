1. **Analyze the Code Health Issue**
   - The field `illustrationWord` on the `PageRegion` type inside `src/lib/book-faithful.ts` is explicitly marked as deprecated and legacy.
   - It is used in pilot data and renderer components as a fallback when `illustrationSrc` or `caption` are missing, which goes against the "faithful" direction of using real source-verified artwork and captions instead of invented vector drawings.
   - The issue impacts code health because the legacy field pollutes the canonical types and components with fallback logic for a deprecated pilot approach.
2. **Remove the `illustrationWord` field from the type definition**
   - Delete `illustrationWord?: string;` and its JSDoc comment in `src/lib/book-faithful.ts`.
3. **Update Components using the field**
   - `src/components/cartilla/FaithfulPageRenderer.tsx`: Replace `region.caption ?? region.illustrationWord` with just `region.caption`. This removes the fallback to the deprecated field.
   - `src/components/cartilla/WorkbookPageRenderer.tsx`: Rename the local variable `illustrationWord` to `illustrationCaption` to distance it from the deprecated term, avoiding confusion, while maintaining its local functionality (as it's derived differently there, not from `region.illustrationWord`).
4. **Update Pilot Data and Tests**
   - `src/data/page-layouts.pilot.json`: Update the JSON keys from `"illustrationWord"` to `"caption"` so the pilot data remains well-formed for the `caption` field since `illustrationWord` no longer exists.
   - `src/lib/__tests__/book-faithful.test.ts`: Update the test assertion from `region.illustrationWord ?? region.illustrationSrc` to `region.caption ?? region.illustrationSrc`.
5. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
   - Run type checking (`pnpm run typecheck`), linting (`pnpm run lint`), and tests (`pnpm run test`) to ensure everything still passes.
6. **Submit PR**
   - Submit the change with the title "🧹 [code health improvement] Remove deprecated illustrationWord field" and a structured PR body explaining the "What, Why, Verification, Result".
