# Cow game: cancel prior-round timers on restart

Baseline: d775995bdb3ab8fc4b15b50b164e94f5b9bbf83f.

WORKS: Wrong/retry and correct card placement run at phone 390x844 and desktop 1280x800. Reset now cancels pending timers and clears transient feedback before starting the new round. Both viewport regressions pass. TypeScript passes.

DOES NOT WORK before this patch: Reset during a walk lets the previous round complete its scheduled drop, adding a card to the newly reset board after 6.5 seconds. Reproduced at both viewports. After patch both stay empty.

NOT VERIFIED: Overall owner acceptance, reference art mapping, eight-cow mockup versus five-cow gameplay, approved moo/narration, premium physical motion, and deployment. The existing cow can be hidden behind another cow near its destination. No artwork, motion style, syllable set, or head-split changes are included.

The existing board artwork already contains destination labels. Adding duplicated DOM labels solely because `.cg-slot-text` is absent is not justified by the inspected pixels.

This is a narrow follow-up to the cow review queue, not closure or approval of the held game/art branches. Do not merge the older full game trees on the strength of this test.
