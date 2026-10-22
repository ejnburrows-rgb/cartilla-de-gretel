## 2024-10-22 - Missing aria labels for input fields
**Learning:** Found an inline input field for editing student names in StudentTable.tsx that lacked an explicit label or aria-label, making it inaccessible to screen readers.
**Action:** Added `aria-label="Nuevo nombre del alumno"` to the input element.
