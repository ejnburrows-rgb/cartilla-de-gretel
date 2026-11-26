# Phone CRM entry comparison: failure retained

One approved sequential entry-only packet at test-repairs 7898df49b263dc6c5b4d276bd2fbbf1c79a0ea44. This does not exercise or replace the original complete CRM phone journey. No application, assertion, timeout, dependency, or build change was made.

## Result and clocks

Built preview: FAIL original 5,000 ms heading-visible assertion. Node expect start 2026-11-03T21:21:27.710Z; deadline 21:21:32.710Z; return 21:21:32.787Z. Browser timeOrigin 1793740886648.9 ms; first sampled heading at +5739.2 ms = approximately 21:21:32.388Z, 322 ms before the Node deadline. One heading was then connected and natively visible, bounds x57/y278/276x36. No hidden/inert/aria-hidden ancestor or observed remount. Accessible heading count after the failed assertion was one; this is not a passing assertion. Sampling every50ms records changed states, so it does not establish an exact insertion instant or sample during a blocked event loop.

All built JS/CSS fetches completed by +1303.4ms (favicon +1303.6ms), while fonts started +5627.1ms and first sampled heading was +5739.2ms. Twenty-four trace requests all completed200; none targeted backend. This narrows the recorded gap to post-fetch execution/mount/readiness. The packet has no CPU profile or application phase marks and does not establish which source operation or host scheduling caused it.

Installed Playwright1.63.0 coreBundle.js23989 uses retry backoff20,50,100,100,500ms then repeats500ms. A heading sampled only322ms before deadline is compatible with a polling-window miss, but the trace records no individual polls and therefore does not prove that explanation. The actual visibility assertion remains FAIL.

Development: original-default30,000ms page.goto timed out waiting for load, before the heading assertion; classify NOT REACHED. Trace178requests,69unfinished when stopped. HTML response waited7341.834ms; subsequent requests include eager workbook, game, intro and drawing modules. The diagnostic catch preserved the trace but did not export the in-page lifecycle after navigation failure. No second run was performed to fill that gap.

## Artifact and isolation identity

Existing production dist was served from integration, without rebuilding. All456 index/assets files matched the supplied post-build manifest before launch and remained unchanged after both legs. Manifest raw SHA256 a5491bc6557dd693e2ffa5d5abc157c4afada7690f10f061e91c5b40cfc9df83. This is a post-build capture linked to the completed unit gate and frozen source, not an at-build cryptographic attestation. The legacy build-version.txt marker remains stale and explicitly nonauthoritative. Both app/config source diffs against324b1383 were empty.

Each leg owned exactly one server and fresh full Chromium profile, viewport390x844. Both REST/auth abort routes were installed before navigation. Preview/browser closed before development started; both closed at completion21:22:15.654Z. Network trace audit found localhost-only requests and no Authorization/Cookie/API-key/token header names. Raw traces are preserved unmodified with hashes in TIMING-SUMMARY.json. No authentic audio/source approval or full CRM phone success is claimed.

Pending reservation decision was checked structurally before actual child spawn. Accepted receipt records local_failure/evidence_accepted=true; it is preserved, not reused as authorization. The copied script files are exact executed-source provenance, not a new launch instruction. No additional job or repair follows this packet without a concrete classified change.
