# Student reader physical-contract correction — 2026-07-29

- Lesson worksheet slices now use soft paper leaves instead of mislabeling page 1 as a hard cover.
- The reader uses the verified printed trim ratio, 612 × 792, for both single pages and desktop spreads.
- Responsive single/spread remounts preserve the live page instead of resetting to saved initial progress.
- Desktop pagination names both visible leaves; stale saved page indexes are clamped.
- The blanket saturation/contrast filter was removed from the interactive page DOM; source art remains unchanged.
- Regression coverage pins physical proportions, page labels, index clamping, breakpoint policy, and soft-page semantics across all 24 lessons.
