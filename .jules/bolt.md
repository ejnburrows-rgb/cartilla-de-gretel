## 2024-05-18 - Improve local filtering lag with deferred queries
**Learning:** Immediate state updates for search queries driving large list filtering can block the main thread and make input laggy.
**Action:** Use `useDeferredValue` to defer the search query string passed to computationally expensive filtering, ensuring typing remains responsive.
