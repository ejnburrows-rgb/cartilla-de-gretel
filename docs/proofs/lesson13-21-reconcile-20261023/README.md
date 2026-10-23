# Existing981/961/927 source-delta test

Base d775995b. Recovered981 appended L13/L21 CSS and components, L21 empty-sight-word omission, instruction rendering and route classes. Preserved current L16 route/renderer and p7/p8 props. Typecheck passes.24 settled screenshots cover all8 pages at desktop/phone/sideways.

WORKS
L21p77 phone shows complete reading body, lesson and page number. No empty sight-word frame. L13 cream/garden instructions appear with its exact original lesson-13-wide class.

DOES NOT WORK
L13p43 phone writing canvases/toolbars clip at right. L13p45 sideways reading body extends below viewport. This was not resolved by styling. These screenshots do not prove activities working. No merge recommendation for combined981.

NOT VERIFIED
Functional tests/audio/all source comparisons/final visual acceptance/full build/deploy. Original CSS only styles some L13 surfaces, leaving phonics reading rose styling. Do not invent additional design changes without first reconciling current requested scope. No closures or deploy.
