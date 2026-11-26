## 2024-05-18 - Added toggle button accessibility
**Learning:** Found that custom toggle buttons designed to look active/inactive visually lacked semantic `aria-pressed` states, which is a common a11y pitfall for custom toggle groups. Also enforced `type="button"` to prevent accidental form submission if these components get reused inside forms.
**Action:** Always check interactive buttons that represent on/off states for `aria-pressed` attributes during accessibility reviews.
