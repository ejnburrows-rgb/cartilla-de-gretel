# Current-Main Performance & Image-Loading Report

## Overview
This report documents local performance measurement and image-loading optimizations across representative student workbook and teacher flip chart routes in accordance with performance budget requirements.

## Tested Routes
1. **Student Workbook Route**: `/cartilla/leccion/1`
2. **Teacher Flip Chart Route**: `/cartilla/teacher/paginas/1`

## Measured Metrics

| Route | LCP (ms) | Total Load Time (ms) | Budget (LCP) | Status |
|---|---|---|---|---|
| `/cartilla/leccion/1` | ~2416ms | ~3543ms | < 2500ms | PASS |
| `/cartilla/teacher/paginas/1` | ~2348ms | ~3588ms | < 2500ms | PASS |

## Key Optimizations & Fixes

1. **`src/components/cartilla/BookPageImage.tsx`**:
   - **Render-body State Mutation Fixed**: Removed state update inside render phase (`if (src !== prevSrc)`), replacing with `useEffect` state reset to prevent react lifecycle warnings and unnecessary render churn.
   - **Eager Loading & Priority Props**: Introduced `priority?: boolean` prop that sets `loading="eager"`, `decoding="auto"`, and `fetchPriority="high"` on critical above-the-fold book page images.

2. **`src/components/perf/ImageOptimized.tsx`**:
   - **404 Network Request Churn Fixed**: Removed unconditional `<source srcSet={avifSrc} type="image/avif" />` tags which caused browser 404 network churn (no `.avif` assets exist in repo).
   - **Optimized Picture Source Fallbacks**: Restricted `.webp` source fallback generation to raster image formats (`.png`, `.jpg`, `.jpeg`).
   - **Priority Loading**: Applied `fetchPriority="high"` and `decoding="async"` when priority flag is enabled.

3. **`src/components/perf/ErrorBoundary.tsx` & `SuspenseFallback.tsx`**:
   - Added custom `fallback` callback/ReactNode support in `ErrorBoundary.tsx`.
   - Enhanced `SuspenseFallback.tsx` with customizable `message` and `compact` section mode.

4. **`tests/e2e/performance-current-main.spec.ts`**:
   - Corrected test route URLs from 404 endpoints (`/cartilla/lecciones/1` and `/profesor/rotafolio/1`) to active, representative main routes (`/cartilla/leccion/1` and `/cartilla/teacher/paginas/1`).
   - Refined performance timing filters to track primary content images cleanly.

## Proof Artifacts
- `docs/proofs/performance-current-main/lesson-1-loaded.png`
- `docs/proofs/performance-current-main/teacher-lesson-1-loaded.png`
- `docs/proofs/performance-current-main/report.json`
- `docs/proofs/performance-current-main/teacher-report.json`
