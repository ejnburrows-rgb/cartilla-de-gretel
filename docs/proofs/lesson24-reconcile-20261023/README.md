# Existing Lesson24 reconciliation, not eligible for integration

Base d775995b. Existing978 scoped CSS plus959 p89 landscape-clearance change were tested with current main, preserving later props/imports. Scope is existing946/959/978, not a new design. Typecheck passed. Current source only CSS/import/data attribute. No merge/deploy.

WORKS
Three pages88/89/90 captured in settled state at1366x900,390x844,844x390. Correct printed pages preserved. Scoped pill anchoring repair prevents full-width lesson pill covering number89. Viewer padding subtraction keeps sheet within viewport. Real pixels inspected.

DOES NOT WORK
Portrait88 is crowded, instruction very small and bottom choices close to lesson pill. Landscape89 text is tiny. Landscape90 words break across lines within syllables. These inherited branch CSS problems remain. The proposed scoped reconciliation is evidence of current behavior, not accepted product.

NOT VERIFIED
Functional interactions/voice under this CSS, all source-fidelity/answer ordering, final visual acceptance and release. Do not merge or close original946/959/978 as completed based on this branch.
