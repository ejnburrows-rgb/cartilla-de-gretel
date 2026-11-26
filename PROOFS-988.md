# Proofs for Issue #988: Lesson 16 page-number diamond

These screenshots verify that the Lesson 16 page-number diamond is fully visible at a phone-width viewport (390px wide) and is not clipped by or hidden behind the page edge, as specified by the `#988` rule in `src/styles/lesson-fit.css` which moves the diamond inwards to `11%` at `<=600px`.

- `proofs/lesson-16-diamond/lesson-16-odd-390px.png`: Renders an odd page (Lesson 16 page 55) at a 390px viewport width, showing the diamond positioned on the left side, clearly visible.
- `proofs/lesson-16-diamond/lesson-16-even-390px.png`: Renders an even page (Lesson 16 page 56) at a 390px viewport width, showing the diamond positioned on the right side, clearly visible.
