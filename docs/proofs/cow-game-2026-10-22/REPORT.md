# Cow Game — current scoped proof (2026-10-27)

## WORKS

- Actual phone375×844 and desktop1280×900: wrong mu→mo rejected with the mouth card retained; all five correct pairs finish; completion dialog and reset succeed.
- Cow/card lean uses one viewport-based distance and600ms timing. Walking animations use transform; the synchronized lean owns translate, preventing animation/transition collisions.
- Browser-side mid-lean displacement: phone card2.78086px/cow2.73711px; desktop card6.38290px/cow6.33446px. Both durations0.6s.
- Source pixels unchanged. Existing slot labels/head split/counter-flipped text are retained.
- [Real recordings, screenshots, geometry and raw checks](https://chatgpt.com/library?file_id=libfile_657b59b9a1ec8191a272dfb23aad43cc&account_id=personal). Tested code commit73e7c6221b4bd2c28a1c4eb50c584fc9ddda7d3d, material treecdfa9cdb3a952e6328ef9e66f47f83f156c01a31.

## DOES NOT WORK

- The older16cqw distance resolved against different containers, and walking animations interrupted the same lean property. Both defects were observed during scoped checking and repaired. The new runnable check catches them.

## NOT VERIFIED

- Audio/moo playback is not certified; videos are silent. Earlier text claiming that playWord(undefined) proves a moo was incorrect. No new recording or voice was generated.
- The old15-case all-games report does not cover this Cow route and is not Cow acceptance proof.
- Final independent approval/integration remains open. No main merge or deployment.
