# Existing cream scope, reconciled on main 2026-10-23

Base d775995bdb3ab8fc4b15b50b164e94f5b9bbf83f. Restores only existing PR1005's shared cream/teal styling, not its old toolbar changes. Preserves the main page7/8 CSS introduced by PR1152. No content, art, audio, drawing logic or routes changed. No merge or deploy.

Original user WhatsApp October 19 2026 14:18:42 EDT: "What about the cream color we agreed upon?"; 14:18:54: "Yes and fix color". Original merge policy October 22 03:16:40 and 03:19:26 recovered separately. This patch is for serialized review, not permission inferred from PR descriptions.

WORKS
Fresh browser captures in this folder show first pages of lessons 1,3,8,13,16,21,24 with shared cream paper and teal spine. Typecheck passed. Focused book-fidelity and native coverage tests run separately; see parent report for actual totals. Screenshot set tests only these pages, not every page or interaction.

DOES NOT WORK
Existing phone writing areas still clip toolbar controls on lessons 11,12,16. This predates the cream patch and belongs to fit lane. Document scrollWidth is not sufficient to detect clipping inside page bounds. Do not claim all responsive layouts pass.

NOT VERIFIED
Whole-book visual sweep, audio, animation, full build, all interactions, production deployment and other pending wide branches. This one-file patch does not certify those items. PR937's old L16 source edits are already in main, but current phone issue remains open separately.
