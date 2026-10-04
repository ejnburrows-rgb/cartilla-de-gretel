# Cartilla PR execution gate

## Scope
- Issue:
- Current `main` SHA used as baseline:
- Owner/controller:
- Allowed files/area:
- Forbidden scope:

## Material change
- Previous reviewed head/tree:
- Current head:
- Material tree/diff change since prior review: YES / NO
- If NO, this PR must not claim remediation or trigger a new completion review.

## What changed
- User-visible/behavioral result:
- Why this is the smallest root-cause fix:

## Verification
- Focused tests:
- Test coverage for changed behavior:
- Typecheck:
- Full tests:
- Build:
- `pnpm verify:release`:
- Browser/visual proof:
- Responsive proof:
- Reduced-motion proof:

## Independent review
- Controller exact-head review:
- SonarQube Cloud:
- Confirmed findings:
- False positives/deferred findings:

## Merge gate
- Reviewed head SHA:
- Head unchanged since review: YES / NO
- Dependencies satisfied: YES / NO
- `DUAL REVIEW VERIFIED FOR THIS HEAD`: YES / NO

Do not merge if any required executable/visual proof is missing, the reviewed head changed, or the PR exceeds its declared scope.
