# Existing roster rename repair on assembled teacher route — October 29, 2026

## WORKS

- Existing restored candidate b6133ed140eebefe04a3d5a47ea00e0504228c5f reconciled with main a0f29db335e427b09f31cf5c9e46c40003a09007 at f0eab635b748dbe6a2014ccf8c6ae1ef07f6209a. Application changes remain confined to the delivered ClassRoster/StudentTable repair; no replacement implementation.
- Four current rename regression checks pass; TypeScript and production Vite build pass. Original committed fixture tests preserve deferred/pending-request and duplicate-submission proof; that is component/fixture evidence, not live remote-service coverage.
- Actual built /cartilla/teacher/roster passed at 390 and 1280 widths with the app's synthetic demo students: a deliberately stale synthetic local record makes saving fail, the visible editor/error retains the typed name, restoring that local fixture permits retry, the actual row updates, reload preserves the name, and Escape does not save a later draft. Two full recordings, screenshots, results.json and browser.txt retain the mounted-route proof. No real backend or real child record was modified. No page errors.
- Independent Codex review of b6133ed completed with no major issues (receipt in existing #1071). Effective main approval count is zero; this technical review is not described as a formal APPROVED review.

## DOES NOT WORK

- Deliberately induced synthetic failure is shown in failed-draft-retained screenshots and recordings, followed by successful retry. It is not mislabelled as an unexpected production failure.

## NOT VERIFIED

- Actual remote-auth/Supabase service failure, real student data, physical phone/Safari and full teacher/classroom readiness remain unqualified. This candidate has not been deployed.
