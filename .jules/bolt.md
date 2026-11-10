## 2024-05-20 - Memoization of Workbook Components
**Learning:** High-level rendering components in the `cartilla` folder like `WorkbookPageRenderer`, `MonochromeDrawing`, `SVGWorkbookLine`, `SVGTracingLetter` are not currently memoized using `React.memo`. These appear in potentially complex lists or interactive contexts, so memoizing them could save unnecessary re-renders.
**Action:** When working on generic, pure presentational components, consider wrapping them in `React.memo` to prevent unnecessary re-renders.
