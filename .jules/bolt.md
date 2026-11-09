## 2024-05-18 - Memoizing exercise kinds calculation in ReportCard

**Learning:** Computations derived from the entire class progress object (like finding all unique exercise kinds using Object.values and flatMap) can be surprisingly expensive in React when dealing with many students. Calculating this unconditionally on every render is a clear performance bottleneck.

**Action:** When a computed value depends on a potentially large object like `classProgressData`, wrap the calculation in a `useMemo` hook to prevent recalculation on every render.
