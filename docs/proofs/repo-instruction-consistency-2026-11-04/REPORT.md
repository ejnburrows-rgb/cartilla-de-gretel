# Repository instruction consistency — verification receipt

**Evidence only; not a new task authority.** Current work and open blockers remain in issue #877.

Verified: 2026-11-04T05:33:11-05:00. Source baseline: `a13f0553959e251337104e08f219b9269bc8d0df`.

## Follow-up — November 4 pencil-contract correction

The original receipt and hash tables below describe candidate `631ad90ce6d693cce00b34e91fa641adf6819a78`; they are preserved as historical evidence, not current-byte claims after this follow-up. The approved execution handoff exposed a pre-existing omission: neither main nor that candidate contained the November 1 single-cursor/charcoal-first rules. The three existing standards now record that contract and replace the conflicting immediate-color, teal-line and separate-pencil instructions. No runtime, original artwork, voice, Tutor, Mariposas or deployment configuration is changed. Current runtime compliance remains unverified and source inspection still finds older connector behavior.

Follow-up document SHA-256:

- `STUDENT_INTERACTION_STANDARD.md`: `8724bd3648fd19314c2a355ba06ca0518913b9699f0e79c86f4bb6c519515207`
- `UX-CONTRACT.md`: `f5d0607f1fb1515809f76e41598a4a3dd567832ed75e1e8aade9d1d2f7317544`
- `WORKBOOK_ARCHETYPE_STANDARD.md`: `9592273cd60eab5ffbf8ba8f67ebe35f2edfc46943eaa57b5bb6ab81a661d719`

## Original result and limits

- The known conflicting active instructions identified in this review have been reconciled. The independent reviewer examined instruction-bearing text in all 35 active documents.
- The existing policy regression suite passes 95 tests, zero failures or skips. The expanded document/configuration check reports zero errors.
- The document check discovers every tracked `.md`, `.mdx` and `.txt` file: 197 pre-existing documents, classified as 35 active and 162 historical/evidence files. This receipt adds one evidence document, so the final staged discovery is 198 total / 35 active / 163 evidence.
- Repository inventory at the baseline: 5,813 tracked files. A bounded policy-word scan read 1,319 selected textual source/configuration/document files; other files, including original media and artwork, were not semantically audited. The newly added upstream error-capture test was read from its Git object because it is outside the sparse checkout. `src/index.css` was byte-scanned with a Latin-1 fallback for ASCII policy terms because it is not valid UTF-8.
- This is a bounded instruction consistency review, not mathematical proof about arbitrary prose, an asset audit, a complete app regression, or live publication verification.
- **One confirmed runtime-policy conflict remains open:** the browser-voice audition route selects browser TTS, and the shared Gretel voice library can synthesize without enforcing `AUDIO_POLICY.allowTts:false`. This report does not claim the entire app is policy-compliant.

## Reconciled conflicts

| Conflict | Correction / preserved authority |
| --- | --- |
| Source extraction assigned unavailable pages 86–87 to Y/Z; the ops standard inferred a lesson identity | Y uses 83–85; Z/lesson 24 uses supplied 88–90. Missing 86–87 remain SOURCE_BLOCKED, excluded from navigation until authentic scans are supplied and verified. No inferred content. |
| Old Workbook/Flip Chart timings contradicted newer owner timing | Digital directive now references UX-CONTRACT: 2.0 s turn plus approximately 0.3 s corner zoom; gesture/reduced-motion rules retained. |
| Piano document retained an older placement hold | October 30 owner-approved PR #1224 remains the later placement standard; the older hold is retained explicitly as history. |
| Eight exercise families and two official views looked like competing standards | Both documents now identify their distinct scopes; both approved requirements remain. |
| Old issue ownership/reporting text competed with current rules | Current ownership is #877; visual handbacks/status labels defer to AGENTS. Historical assignments and reporting examples are retained as history. |
| Cleanup and force flags could be read as permission to delete/overwrite | Exact-path owner approval is an explicit prerequisite; no assets were deleted. |
| Mapping was described as permanently immutable | Preserve the existing mapping; only authorized, authentic-source-verified row corrections with evidence are allowed. |
| Old voice default/audition description contradicted original-recording policy | Actual default is recorded-audio; old provider material is historical; the active runtime violation is explicitly recorded as unresolved. |
| Audio/package and motion snapshots implied current absence/readiness | Snapshot/candidate context is explicit; owner-supplied assets are not declared nonexistent from a local package listing. |
| Research suggested an embedded guide forbidden by current UX rules | Research is explicitly nonbinding; current no-guide-on-lesson/Cuaderno decision prevails. |
| Schema provenance implied a current Anti-Gravity worker | Provenance is historical and grants no dispatch authority; source fidelity remains required. |

## Reproducible checks

```text
node --test scripts/__tests__/check-merge-policy.test.mjs
95 passed / 0 failed / 0 skipped

node scripts/check-merge-policy.mjs --docs
ok: true; errors: []
coverage after staging this receipt: documentation 198 / active 35 / evidence 163

git diff --check
exit 0
```

The 26 added regressions cover the seven reproduced bypasses in previously unchecked active files, discovery/classification, explicit-history handling, missing/unreadable tracked files, retained mandatory governing files, and literal disabled automatic deployment. Mandatory shared-owner contract text is required in AGENTS only; scoped specifications are scanned for explicit conflicting instructions.

## Open runtime finding — source inspection, not browser execution

- `src/routes/cartilla/voces.tsx` lines 138–147 selects `browser-tts` for an audition. The route remains registered in `src/routeTree.gen.ts`.
- `src/lib/gretel-voice.ts` lines 199–243 reaches `SpeechSynthesisUtterance` and `synth.speak` for that provider, without checking the manifest policy.
- `src/content/audio-manifest.ts` sets `allowTts:false`. In contrast, `src/lib/speak.ts` and `src/lib/picture-audio.ts` have explicit policy guards. Presence of a synthesis call alone was not classified as a violation.
- Documentation corrections do not disable this code. Runtime repair is outside the original management-only correction and must remain an explicit blocker in the central work record. An attempted #877 body update was blocked by automatic approval review, so this receipt does not claim that update succeeded. No audio, Tutor, Mariposas, curriculum, runtime code or deployment settings were changed here.

## Changed-file identities

| Existing path | SHA-256 of reviewed content |
| --- | --- |
| `ARTWORK_REPORT_VERIFICATION_AND_SINGLE_SOURCE_CLEANUP.md` | `a0edab190746b6026bafc69f64fb08fae54cb87e71b94163e161db1260e10b2e` |
| `ASSET_FIDELITY_POLICY.md` | `719263e8b27a0766fcf41cafc1c55e80b3aa5aac9034bb2ea218d7e05ed4c899` |
| `CARTILLA_CI_ACTIVATION_HANDOFF.md` | `44c10ddcd54220af828f5f8dc8b51edcf90ff6dbe622d36d2833a52b24d1da3c` |
| `CARTILLA_DIGITAL_DIRECTIVE.md` | `f9ec59c221b5fa1cc9127bbb4a02a3c6482e018167c7663734d6cd7c31704fe8` |
| `PERMANENT_PROJECT_INTEGRITY_WORKFLOW.md` | `c7f5595856e73723dbca0bce6d18bd7dd7410a92931cbb11cfd349ad01431426` |
| `UX-CONTRACT.md` | `412a60c8ce95689a8481bbbeda07ad8c336b63ad629c3bcf44df5b3ec40aa773` |
| `WORKBOOK_ARCHETYPE_STANDARD.md` | `a9015d27015a8fb069deadd833ef9dfe54ca64a41170b3ae820cd5ace4e2807b` |
| `docs/ARTWORK_MAPPING_CANONICAL.md` | `ed25839029d22b642c90cdc971ee4925dce2880016fcfc4aa0058a9b98e0cec1` |
| `docs/GRETEL_VOICE_DECISION.md` | `78cc3a27e72579e0c5f9a3f68d45377f64bfb80968c69c315b42214b3ef3902d` |
| `docs/OWNER_ART_INTAKE.md` | `198daa6466c97063faa259610e0d4b619bbffd73fc138e130c84286ba42e8482` |
| `docs/PIANO_LESSON_INTEGRATION.md` | `c02cd2294c853cd7044008d68856550cecf1779095d04f2123d2100a883bd754` |
| `docs/curriculum/NOTEBOOKLM_SOURCE_EXTRACTION.md` | `bd505115815b6da83bff4ce355c8d3c4914c8873073480386e6a037a0b505cf4` |
| `docs/curriculum/SOURCE_STATUS.md` | `1c8a046608002968eb3f630abc7a58493df8b1fe798e091d8de51f18296110a8` |
| `docs/gretel/GRETEL-MOTION-CONTRACT.md` | `90731dbed141ce258b5502c81cb916dcb7d64081b4d3ea47233b116291b811b5` |
| `docs/ops/WORKBOOK_ARCHETYPE_STANDARD.md` | `f858e7f936829bb13fb5d902704302ec615df77bb83642a55ed2e1a803f66fa9` |
| `docs/research/NOTEBOOKLM_COMPETITIVE_DIFFERENTIATION.md` | `166310a056bb44acdb2889f7046202984a382853d6894d574c9fc0849f178c58` |
| `scripts/__tests__/check-merge-policy.test.mjs` | `c7112ceb550985d29468202501c9abeaec5bb24337dbe7e624c8a10688fd55f9` |
| `scripts/check-merge-policy.mjs` | `e2e2bf834286e95bd432f06dffe143a0d16504f5776bb1038b65cdcb7959671b` |
| `src/content/guia/SCHEMA.md` | `af48a1fd7b5800d39a09ca744d4716ba9c1a61adacd03768c45023cefe90a270` |

## Complete pre-existing document inventory

Every pre-existing tracked document is accounted for below. Evidence classification preserves history without treating old directives as active instructions. A mention of a forbidden feature does not by itself establish a conflicting authorization.

<details><summary>197 documents: classification and reviewed content hashes</summary>

| Path | Role | SHA-256 |
| --- | --- | --- |
| `.agents/PROJECT_MEMORY.md` | evidence | `41c580faa79e1096539fd8edc9a340b61ad2057a095f5b4b0a44bcd1d3bca3c3` |
| `AGENTS.md` | active | `e200503db3e35347a34d0e2790b941b9cb47021954f456da1e3b7202dd6d8fd0` |
| `ARTWORK_REPORT_VERIFICATION_AND_SINGLE_SOURCE_CLEANUP.md` | active | `a0edab190746b6026bafc69f64fb08fae54cb87e71b94163e161db1260e10b2e` |
| `ASSET_FIDELITY_POLICY.md` | active | `719263e8b27a0766fcf41cafc1c55e80b3aa5aac9034bb2ea218d7e05ed4c899` |
| `CARTILLA_CI_ACTIVATION_HANDOFF.md` | active | `44c10ddcd54220af828f5f8dc8b51edcf90ff6dbe622d36d2833a52b24d1da3c` |
| `CARTILLA_DIGITAL_DIRECTIVE.md` | active | `f9ec59c221b5fa1cc9127bbb4a02a3c6482e018167c7663734d6cd7c31704fe8` |
| `CHANGELOG.md` | evidence | `704102cdfbd812fb413eccbb7e9cb8542d4c92bade55b26f7aff375f7cd1c353` |
| `CONTRIBUTING.md` | active | `ec0e16b009bd8de305458a81ad1a4a75e47545da475b8b15272d5897252e390a` |
| `DESIGN.md` | active | `7e39a3c0bd88bb199695f00f8e566121da7c73d691b7168270acc4aaaea183c7` |
| `MASTER_REFERENCE.md` | active | `b7c64874de506f36cf1b169e7477275c72dd00c63317d03ae80304b0f14b2cc0` |
| `PERMANENT_PROJECT_INTEGRITY_WORKFLOW.md` | active | `c7f5595856e73723dbca0bce6d18bd7dd7410a92931cbb11cfd349ad01431426` |
| `PROJECT_FINISH_DEFINITION.md` | active | `be517f5eddb7175370b0276086cff5b70eca9b5e04d81723080e7238726f09ec` |
| `PROJECT_SOURCE_OF_TRUTH.md` | active | `eb90e7ff3a17fa11513b5fbd184811e45f25be62fe2cfbd7c8d782cd9b16b0cb` |
| `README.md` | active | `2178b8c0d29335b40263cb162e6e1965cd43fb1b44b77592391dee297204262a` |
| `STUDENT_INTERACTION_STANDARD.md` | active | `4725b5084f64b47c7ce3b2d8785b0c498f90a204391e4db45a9d2c75f95061d4` |
| `UX-CONTRACT.md` | active | `412a60c8ce95689a8481bbbeda07ad8c336b63ad629c3bcf44df5b3ec40aa773` |
| `WORKBOOK_ARCHETYPE_STANDARD.md` | active | `a9015d27015a8fb069deadd833ef9dfe54ca64a41170b3ae820cd5ace4e2807b` |
| `docs/ARTWORK_MAPPING_CANONICAL.md` | active | `ed25839029d22b642c90cdc971ee4925dce2880016fcfc4aa0058a9b98e0cec1` |
| `docs/BUTTERFLY_GARDEN.md` | active | `6eb94665752f30b7bf21d1e9f337d38b745c236b7caa4afe6403dd2acc4cdc44` |
| `docs/GRETEL_VOICE_DECISION.md` | active | `78cc3a27e72579e0c5f9a3f68d45377f64bfb80968c69c315b42214b3ef3902d` |
| `docs/JOBS.md` | active | `e8e6ca0ee6e37b6c528186790b30edb8eba069b4d0174b889806493ed9afbd5b` |
| `docs/OWNER_ART_DROP.md` | active | `2e0e60e97a5d5e2fac7e6d3fe26358ec692ea2a74010a963fd845910a09e258a` |
| `docs/OWNER_ART_INTAKE.md` | active | `198daa6466c97063faa259610e0d4b619bbffd73fc138e130c84286ba42e8482` |
| `docs/PIANO_LESSON_INTEGRATION.md` | active | `c02cd2294c853cd7044008d68856550cecf1779095d04f2123d2100a883bd754` |
| `docs/archive/HANDOFF-EXACT-REPLICA.md` | evidence | `f8d0b64f888c98c5260dbb716a128128056992dc142cdf2793f050f85aa1aed1` |
| `docs/archive/directives/CARTILLA_ARTWORK_OPTIMIZATION_STANDARD.md` | evidence | `0e780dc8de94f8b933987352a106e34d52f1213602fb4949431360504f59f50d` |
| `docs/archive/directives/CARTILLA_ARTWORK_REMAINING_PROMPTS.md` | evidence | `4c55636a51874679b4f46f6af8bad6a1d0d2c37a57b257c540418fbb896986f7` |
| `docs/archive/directives/CARTILLA_SOURCE_OF_TRUTH.md` | evidence | `54b637a273c4dc8cf7dff124d623189f9450e67aff1fc6c702caab3781e2ce13` |
| `docs/archive/directives/IMAGE_GENERATION_BAN.md` | evidence | `9c734219b9b21ee49eab73cd825c021374a3a2d6ceec9d3b84cb98563cef3544` |
| `docs/archive/directives/PERMANENT_CARTILLA_COLOR_MATCH_RULE.md` | evidence | `632221c46973a69253c122bbeab8fe8cb2a5762f3ed93b4c4abdf14ddfe61cae` |
| `docs/archive/directives/README.md` | evidence | `a2a3657bb16ace35e33bd646d4de478e7ed5523fb619b4042ff9aff4a36f110a` |
| `docs/archive/evidence/FINAL-VERIFICATION-2026-09-30.md` | evidence | `65feb99080c00259dc57e5e2ac14d8191d653726df478b81d11b36651eeb3dc9` |
| `docs/archive/evidence/FINAL_COMPLETION_426.md` | evidence | `da88af4af5ebe7a835a1b889a4d1990a599721167b8556e0ae0f548af01651d6` |
| `docs/archive/evidence/INSTINCT_IMAGE_FAILURE_REPORT_2026-10-22.md` | evidence | `12658cb48349f65d25102cb42ba1ef492a12223f5eb216b41f286b7cb0fe960b` |
| `docs/archive/evidence/STATUS-2026-10-02.md` | evidence | `39195bdca58b24848ff1e794119a87f24b077d0e81669b554dc19afb1cc35fec` |
| `docs/artwork-reconciliation/ARTWORK_AUDIT_2026-10-16.md` | evidence | `1800f060f892c91cc6d08618f974884e24f9a52bf5f851ae8eb78753300ecd63` |
| `docs/artwork-reconciliation/mapping/MASTER-MAPPING.md` | evidence | `bbc754c4fdf7fdaf3ebe41160686afc929976688b946c3e319d141f8b265ce85` |
| `docs/audio/README.md` | active | `dd328072990ef938410c4383657d3f9be54a6f1a39a8ed11380646dd4c40969a` |
| `docs/curriculum/NOTEBOOKLM_SOURCE_EXTRACTION.md` | active | `bd505115815b6da83bff4ce355c8d3c4914c8873073480386e6a037a0b505cf4` |
| `docs/curriculum/SOURCE_STATUS.md` | active | `1c8a046608002968eb3f630abc7a58493df8b1fe798e091d8de51f18296110a8` |
| `docs/gretel/GRETEL-MOTION-CONTRACT.md` | active | `90731dbed141ce258b5502c81cb916dcb7d64081b4d3ea47233b116291b811b5` |
| `docs/ops/WORKBOOK_ARCHETYPE_STANDARD.md` | active | `f858e7f936829bb13fb5d902704302ec615df77bb83642a55ed2e1a803f66fa9` |
| `docs/proofs/accessibility-preflight/README.md` | evidence | `d570ae9cde8cc39399d98653dcbc118d4e48c2c44dc23a69ddd9a39fa56989d1` |
| `docs/proofs/archetypes-3-4/README.md` | evidence | `b6c0ecc1de3d18d5b9021fb88ff95e04e6e7d116ac49416167ea47516b234ef1` |
| `docs/proofs/archetypes-5-6/README.md` | evidence | `00c603adaa81996f026e3aaa98dcaa24efb3831693863a98bbd2d2f909e6cf4e` |
| `docs/proofs/archetypes-7-8/README.md` | evidence | `0236f2f3c46f842b008d5bf7642ccf9f04c2ad5f86e7adf57be1aa1a3635f3b0` |
| `docs/proofs/artwork-coverage-2026-10-14/README.md` | evidence | `3d95def85fa19ae2a6b1274da6e61092d78c412032265b6851c6fcaffbd1563b` |
| `docs/proofs/artwork-coverage-2026-10-14/availability-inventory.md` | evidence | `329947e213de3f4e0d287d78f75b9ce7de13b2a03385991b909f4ad710a041f7` |
| `docs/proofs/artwork-coverage-2026-10-14/classification-inventory.md` | evidence | `292432fda1c84156bde309350e99901c7a379b95e7160ed2826af0469bd7990a` |
| `docs/proofs/artwork-coverage-2026-10-14/gallery.md` | evidence | `e5323c991b8e86538809e34692d24ebe599979dda83e2f8b1c9f190a263a739f` |
| `docs/proofs/artwork-coverage-2026-10-14/missing-originals.md` | evidence | `590bb79f0960314e7771c7695597d7a2b6d2f66e5a73d75ee8c5ddb408a8f21a` |
| `docs/proofs/artwork-coverage-2026-10-14/production-integration-gate.md` | evidence | `5ffc45aa0c7e5c91e9344468a968de8c7e8a8635ea661a25438b191a83188f7c` |
| `docs/proofs/artwork-coverage-2026-10-14/withheld-associations.md` | evidence | `930993836febdf253cc5622a6c6525da873142763779b2b779865b8a2e94caa7` |
| `docs/proofs/asset-integrity-current/README.md` | evidence | `79a86acc74292ccb35aea9d11f33d84d38d1be259858a2e616d01ba18c3ba4d3` |
| `docs/proofs/batch-2/README.md` | evidence | `1a39be4d28ff6f5c69db1ae7c8a8beba44fd30f673269c885395389038e9a2a3` |
| `docs/proofs/batch-3/README.md` | evidence | `f115c25cd8dac9a11544489b86e29afb242a3abdfd2ecde167fcc3ca7050e4f4` |
| `docs/proofs/classroom-readiness/README.md` | evidence | `f5585a514f87f583b7432cb640c5f8ed4f530cfa7ddc41057291666860c9bb19` |
| `docs/proofs/cow-game-2026-10-22/DEFECT_REPORT.md` | evidence | `6c8c389dad5dad8f2809f2cbae070fad73e07737d6225ef92e77e84aab23ac25` |
| `docs/proofs/cow-game-2026-10-22/REPORT.md` | evidence | `424d6235e6da075ffd1916ed3572c6ff5b15a51531006db93101ec3df2f65d71` |
| `docs/proofs/crm-demo/README.md` | evidence | `6b82a9cf31232351856c66573b2a2f26b852f0f6be5b811d84b9868a8118ab95` |
| `docs/proofs/current-art-precedence/README.md` | evidence | `19211c27ec19f46704aceedc4fa29f28921f1b3997132ade0f7f171672627860` |
| `docs/proofs/elephant-sheep-motion-2026-10-29/REPORT.md` | evidence | `b98fe8c1a8390f67f5552c68d7c1b5fea043456010733b22dc5d947049f363d9` |
| `docs/proofs/elephant-sheep-motion-2026-10-29/art-preservation.txt` | evidence | `9d1de5469315771b46791446f9a856d5e9e9307c08b99d54e5e6a9bd19fc6a01` |
| `docs/proofs/elephant-sheep-motion-2026-10-29/assets.txt` | evidence | `ca8a0dc013c2b052a71b7d86c7316f8d53cca6e193258e7f2d0eac632b6e376a` |
| `docs/proofs/elephant-sheep-motion-2026-10-29/browser.txt` | evidence | `6e0d742d35778131c65095a04b88ac6a9068da5697df9cd744d9008d8c6d73a5` |
| `docs/proofs/elephant-sheep-motion-2026-10-29/build.txt` | evidence | `9e0ab9a4805d68d9ce268c3c941e304804236caaf26d4e30f79001b926830086` |
| `docs/proofs/elephant-sheep-motion-2026-10-29/freshness-tests.txt` | evidence | `a770025502c6ca39aa511bc524833590a48fedc2f46288db1ead1713059a5a19` |
| `docs/proofs/elephant-sheep-motion-2026-10-29/frozen-install.txt` | evidence | `fe8706f272667279479c7834dec40bb8bd9f4fa55af2e27f06cbcc761fd07f1d` |
| `docs/proofs/elephant-sheep-motion-2026-10-29/living-illustration-tests.txt` | evidence | `bea28ad6f0139eb9320b73cebcd0838044f4286bd115dc0bff110175dcb3ded6` |
| `docs/proofs/elephant-sheep-motion-2026-10-29/typecheck.txt` | evidence | `7145ac4b728d1e67d5ffdcc9dd0a7c48fe44882ebcf57f62506eb053c0911c79` |
| `docs/proofs/final-backgrounds/README.md` | evidence | `1c2b6db32c797dfcde836512cb6ffc0c3728933897aedec120101a16acdc8f4b` |
| `docs/proofs/flipchart-final-preflight/verification.md` | evidence | `405fab1a71d4da185445f97206028f7a8ad0b6f5180ee7001079edf5196cb5ca` |
| `docs/proofs/gretel-voice-readiness/README.md` | evidence | `5f124fbae8f18bdfd100e344bf344fd3a024722c0fcc5690a52214229a398ef7` |
| `docs/proofs/igual-source-2026-10-29/REPORT.md` | evidence | `40946a7b214ade695020ae14d751f2a33c9304644784681f2d9191bfde9c392d` |
| `docs/proofs/igual-source-2026-10-29/browser.txt` | evidence | `03139ae7b7a282340f511cc9b11ec7fd5349b612768ccafa3d2a8817b8369660` |
| `docs/proofs/igual-source-2026-10-29/typecheck.txt` | evidence | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `docs/proofs/igual-source-2026-10-29/unit.txt` | evidence | `2a7b66b91edcff1fa4739fb3df9979cf1d13e68578e62d2b10fb1500caa9a04a` |
| `docs/proofs/issue-715-source-order/README.md` | evidence | `2fa8392b3eb1e5d0eba387f7ca7b93a485c57f39dc5c184a2fedd7af3a05c365` |
| `docs/proofs/issue-715-source-order/source-36-61-report.md` | evidence | `72a3b2fc50514f955e4aacb088a4bb9b105fd0b3050b479ad6aab81a7d7ea5e2` |
| `docs/proofs/issue-715-source-order/source-9-35-report.md` | evidence | `4e0b2bf9d9f87a9ecad390c3a05eca1b201b5a24d0c7a2b1bfdf1500a3f59388` |
| `docs/proofs/lesson-3-prototype-2026-10-27/REPORT.md` | evidence | `0071f87483ac4f17b9056e1bbe57daa744b6e47136b6573edbb3ba273eea2369` |
| `docs/proofs/lesson-3-prototype-2026-10-27/assembled-2026-10-29/REPORT.md` | evidence | `5634486c43e1f42a085530736481ebfce32075d148f931e073d234a593947dda` |
| `docs/proofs/lesson-3-prototype-2026-10-27/assembled-2026-10-29/build.txt` | evidence | `9457ad623c45749cba8d930595b06d6aba47f0f6a1eb26fd49d7419f9715b76d` |
| `docs/proofs/lesson-3-prototype-2026-10-27/assembled-2026-10-29/initial-focused.txt` | evidence | `3a38e44849b9a97831a61cf9101a5d1b959a10172ff2376a62c3142875f006f4` |
| `docs/proofs/lesson-3-prototype-2026-10-27/assembled-2026-10-29/page-gate-retry.txt` | evidence | `d162c5088850ac395ffe8db1a4ae4a0cc4362c9cb2e5d909d0e2b734d8d09a2c` |
| `docs/proofs/lesson-3-prototype-2026-10-27/assembled-2026-10-29/typecheck.txt` | evidence | `880975b9e7fef716b4e6670a6a657162944d78861683e680e47974752be95313` |
| `docs/proofs/lesson-3-prototype-2026-10-27/assembled-2026-10-29/workbook/browser.txt` | evidence | `42360780c00c05503b864e19929bd3955f0a232338a18b7bf116fd018e165748` |
| `docs/proofs/lesson-3-prototype-2026-10-27/assembled-rollout-2026-10-29/REPORT.md` | evidence | `cb0ea32e10cdb73a70a1deef2ef0f38fcab59169b6ff2c7484aa4f5ce4fbc314` |
| `docs/proofs/lesson-3-prototype-2026-10-27/assembled-rollout-2026-10-29/a11y/browser.txt` | evidence | `851718f6d851c99bac4a283e65afd182cbccd1bf9a0b05e28333e2b2b8a8181d` |
| `docs/proofs/lesson-3-prototype-2026-10-27/assembled-rollout-2026-10-29/a11y/video-map.txt` | evidence | `f02d295349966be601ca9f5847af4d484ad5bef31e8859acfa198e4e35c58d9c` |
| `docs/proofs/lesson-3-prototype-2026-10-27/assembled-rollout-2026-10-29/build.txt` | evidence | `811e82861008c2fc73ef76a0798b735934ef05e3e801dac30610340588a41fd5` |
| `docs/proofs/lesson-3-prototype-2026-10-27/assembled-rollout-2026-10-29/syllables/browser.txt` | evidence | `4a516360501f3fc3f7cbb64126e13a527f11806e4cf4480ff13a9a700f8bcdd2` |
| `docs/proofs/lesson-3-prototype-2026-10-27/assembled-rollout-2026-10-29/typecheck.txt` | evidence | `880975b9e7fef716b4e6670a6a657162944d78861683e680e47974752be95313` |
| `docs/proofs/lesson-3-prototype-2026-10-27/assembled-rollout-2026-10-29/unit.txt` | evidence | `ece103c5121997216cbddcde77aa1fab2b91cfef8dfd4da92c94e98cb9f2dd49` |
| `docs/proofs/lesson-3-prototype-2026-10-27/assembled-rollout-2026-10-29/vowels/REPORT.md` | evidence | `39c45ded11c526f2a618ed4427da3879cfdc67db270b2fa7e07509f9743162d2` |
| `docs/proofs/lesson-3-prototype-2026-10-27/assembled-rollout-2026-10-29/vowels/browser.txt` | evidence | `486c9d6ff311008670eecd7fc12878c7aa716a2b6635afb75c6ebdfdf87f5175` |
| `docs/proofs/lesson-3-prototype-2026-10-27/production-continuation/REPORT.md` | evidence | `5e82a751e0ff7a9c0016e6ca8e6a86f126d31b905c5126c2cdc0ab8e6007a2b8` |
| `docs/proofs/lesson-3-prototype-2026-10-27/production-continuation/activity-1/browser.txt` | evidence | `f15650255ebc78853044c2468f88f704e3f7b1a7085624ba6dc62964d0fcf667` |
| `docs/proofs/lesson-3-prototype-2026-10-27/production-continuation/activity-2/browser.txt` | evidence | `38ed2bbe9c7ce9d3941ce079b05597fa1509cb725ebc61ec798fdd3f5046a065` |
| `docs/proofs/lesson-3-prototype-2026-10-27/production-continuation/baseline-browser.txt` | evidence | `a73b6227cf7d17d4b0d5773ab0786b6c45281ee904035872b21b11d9344e5ff3` |
| `docs/proofs/lesson-3-prototype-2026-10-27/production-continuation/browser.txt` | evidence | `327eb8df543af3981cae0f7e2f01e2f1f2c3cb50b8344419721a72048fb165da` |
| `docs/proofs/lesson-3-prototype-2026-10-27/production-continuation/typecheck.txt` | evidence | `8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92` |
| `docs/proofs/lesson-3-prototype-2026-10-27/production-continuation/unit-after.txt` | evidence | `eaca2392003176c25ab765826d516b21d669a2eab74b25a555e7eda984bd03b1` |
| `docs/proofs/lesson-3-prototype-2026-10-27/production-continuation/workbook-activities/REPORT.md` | evidence | `5ccbcb9f853e253a23920cd98407e7f4c11075c02f5c1955757f47a2f7a4a604` |
| `docs/proofs/lesson-3-prototype-2026-10-27/syllable-target-fix-2026-10-29/REPORT.md` | evidence | `054e5a18304c4662437e2bbe22091dd63cd30c8166c0b3ec676cdbd0543fc19b` |
| `docs/proofs/lesson-3-prototype-2026-10-27/syllable-target-fix-2026-10-29/baseline-failure.txt` | evidence | `814aa128dab530e3099de6b9c02025dd66caeed2c924330e1c6dfdc4a7fd0dc5` |
| `docs/proofs/lesson-3-prototype-2026-10-27/syllable-target-fix-2026-10-29/build.txt` | evidence | `df9df09cadab0d72f0a07f0d48a313101e066cb664c1361dcbbb7fefc089f1f7` |
| `docs/proofs/lesson-3-prototype-2026-10-27/syllable-target-fix-2026-10-29/first-fix-fixtures.txt` | evidence | `ec520a3b49b58909877b7972502a3c58ec23cc43f9dd5fbf53778f90a2e44e9a` |
| `docs/proofs/lesson-3-prototype-2026-10-27/syllable-target-fix-2026-10-29/runtime/browser.txt` | evidence | `4a516360501f3fc3f7cbb64126e13a527f11806e4cf4480ff13a9a700f8bcdd2` |
| `docs/proofs/lesson-3-prototype-2026-10-27/syllable-target-fix-2026-10-29/typecheck.txt` | evidence | `880975b9e7fef716b4e6670a6a657162944d78861683e680e47974752be95313` |
| `docs/proofs/lesson-3-prototype-2026-10-27/syllable-target-fix-2026-10-29/unit.txt` | evidence | `289ca81ebe7d1e501b8362e8f93e727c9f8961f007190d714a6adf952ea2e973` |
| `docs/proofs/mariposas-2026-10-29/REPORT.md` | evidence | `b8cff35df7c2b4d7013d2b5a449d848c4016ba24238a6b6472b0d07c1e96dd5b` |
| `docs/proofs/mariposas-2026-10-29/art-metadata-tests.txt` | evidence | `30cdb6a1dc50d6b7bfba64aee67ec4357ec28280e01c6342f3f117f322c51428` |
| `docs/proofs/mariposas-2026-10-29/build-regressions.txt` | evidence | `aa2eaf7539652c37aa633c6afa6461e5be4db2304d75be891d302ba02772c15e` |
| `docs/proofs/mariposas-2026-10-29/built-browser-tests.txt` | evidence | `e20f26e5035a192e34dbef321f09021cfa08351670623631c121b2be6dd18fee` |
| `docs/proofs/mariposas-2026-10-29/dev-browser-retry.txt` | evidence | `e7de7a6ca9d1b95659889538bb6342a0282dd1a2b0c0122f7213d655272cf778` |
| `docs/proofs/mariposas-2026-10-29/full-build.txt` | evidence | `f16189b24645ecc2f274f9f06fab9bcffed1dbdd7388df09bb14deea1820327b` |
| `docs/proofs/mariposas-2026-10-29/game-tests.txt` | evidence | `7df5a7623dac574be25975764b1ba50cced313d2b967b599814430501d85ab2c` |
| `docs/proofs/mariposas-2026-10-29/initial-browser-tests.txt` | evidence | `ab1d5a67a58f5e68724e06678e5c9e15f5d763bbd9e0710d008474c2ac1462dc` |
| `docs/proofs/mariposas-2026-10-29/initial-full-build.txt` | evidence | `023dbe0e23ffa5fd14e341c5d8d753b61809f256d06ce1ed9f776d984c0ee1c4` |
| `docs/proofs/mariposas-2026-10-29/policy-tests.txt` | evidence | `1552b2eecb0c3d550bfe8f530422ad722c3f9f5c7577215d6e14a2f02327af89` |
| `docs/proofs/mariposas-2026-10-29/release-browser-tests.txt` | evidence | `3cfe9e134ca20f457e5f93e4c0b4927ffae6af3589f27d6936bd2dee04c5de3a` |
| `docs/proofs/mariposas-2026-10-29/resume-regressions.txt` | evidence | `42657529c65210bc76c5fcde08d00acf3ef27bb1379bd42b473fab349c1dcc83` |
| `docs/proofs/mariposas-2026-10-29/review-baseline-browser.txt` | evidence | `56b4ea6b82b1698af148e0aa17c0d6b8c6dbcadc8005c7bf2afd4193272cd5a9` |
| `docs/proofs/mariposas-2026-10-29/review-browser-first-attempt.txt` | evidence | `b01d95ff6d68abbda2fbbbbd5b36b914e3279d462bff1c8e7d81cd2df9528e4a` |
| `docs/proofs/mariposas-2026-10-29/review-fixed-browser.txt` | evidence | `b01d95ff6d68abbda2fbbbbd5b36b914e3279d462bff1c8e7d81cd2df9528e4a` |
| `docs/proofs/mariposas-2026-10-29/review-full-build.txt` | evidence | `bad86dbe287af5447a3a09aa74afdb6ae15e18e7400775e092d77fb824b31101` |
| `docs/proofs/mariposas-2026-10-29/review-game-tests.txt` | evidence | `5eeceeb64505bd9785ac162fb74de14810f59f29c6ecdd911dc224bd0d759731` |
| `docs/proofs/mariposas-2026-10-29/review-phone-retest.txt` | evidence | `332c6709265fa40638751f453b32cf0b81db49f6678915fb257fb697f3b2dbaa` |
| `docs/proofs/mariposas-2026-10-29/review-release-browser.txt` | evidence | `9364ce6bc65c0d0c39ec662ebd9c9de44f9301c0e5d00be0b2be33f2e877ed53` |
| `docs/proofs/mariposas-2026-10-29/second-full-build.txt` | evidence | `0da3916eca26b6cbd8c743a1883473fa2402c1c1699c94f417053f499894bfa3` |
| `docs/proofs/nina-distraida/README.md` | evidence | `4fd23e9fffb2fbafcaa853f71c51e9684a8fa17085e0e8cb6222ae37dd627d27` |
| `docs/proofs/page-gap-2026-10-29/REPORT.md` | evidence | `3512252949f5dc6789f18a6aaedc920dc345689d278c0fc2c425a73d429ef4e5` |
| `docs/proofs/page-gap-2026-10-29/browser.txt` | evidence | `f37885963908776ab64fe99fb750d72f2b26ca79422628d939a332e48f169a96` |
| `docs/proofs/page-gap-2026-10-29/build.txt` | evidence | `6232fa9a1051813b9ebbe1b6ba02181f0faf2630f917e5fdefebcb621e343d75` |
| `docs/proofs/page-gap-2026-10-29/typecheck.txt` | evidence | `880975b9e7fef716b4e6670a6a657162944d78861683e680e47974752be95313` |
| `docs/proofs/page-gap-2026-10-29/unit.txt` | evidence | `9e169b477de3ef2a97656af1efb5328c6faed02047dba03b3c107620b4c92d47` |
| `docs/proofs/performance-budget/PERFORMANCE_BUDGET.md` | evidence | `a421fc33b5b5854af494d71de1b161b44fa42fcdb4971f881eb1e8ed87ea7607` |
| `docs/proofs/performance-current-main/SUMMARY.md` | evidence | `53ab8f4f075d1f88f77577d82d3ed97a62aba839b05e428b8d8d9faabc23cb24` |
| `docs/proofs/pr-434/README.md` | evidence | `82442faac3128e23e1ca6b467c86d2bf4b4085a5c0294c30329ebf5f913bb875` |
| `docs/proofs/product-route-health/README.md` | evidence | `0e385cff27b5d0c2460f33587e0cd35a718deaf93e1e329ac2cf5ae923ffd9e3` |
| `docs/proofs/roster-rename-route-2026-10-29/REPORT.md` | evidence | `a46d62965563c7910609620cef4d7425cf6f3a27ec92048109693fe1fe235204` |
| `docs/proofs/roster-rename-route-2026-10-29/browser.txt` | evidence | `0509a88bb2cc58dc9f90709b62c594d6041d1655e010b3f82c0d54f2d1946d34` |
| `docs/proofs/roster-rename-route-2026-10-29/build.txt` | evidence | `737a1381cdff9cc2782c436176c381b2a6907be0e09ab5509ff1a5ab95562c15` |
| `docs/proofs/roster-rename-route-2026-10-29/typecheck.txt` | evidence | `880975b9e7fef716b4e6670a6a657162944d78861683e680e47974752be95313` |
| `docs/proofs/roster-rename-route-2026-10-29/unit.txt` | evidence | `f94f796d2b6a6bca0d202b4a096d961823e75009af350cc03105bc3200fc0588` |
| `docs/proofs/source-blocked-pages-20261027/README.md` | evidence | `e285ecf51f144c288e03219457232d12fa6992162b463b019b127393a2404a14` |
| `docs/proofs/source-blocked-pages-20261027/piano-resume-2026-10-29/baseline.txt` | evidence | `3a6b52691315322b641c5ab73cb3c8034ec0d4b85148b7826f68f17747fdcd9a` |
| `docs/proofs/source-blocked-pages-20261027/piano-resume-2026-10-29/first-fix-matchers.txt` | evidence | `3f07c0be06a98e6d3b1b28bc072f725cac47d91d97fbfb6b0ba3b3cc76c5e131` |
| `docs/proofs/source-blocked-pages-20261027/piano-resume-2026-10-29/unit.txt` | evidence | `7b5fdc6576fecfcb541e061db7a91f8bb3612a1a2985778b79e1ac22d8c8ea6b` |
| `docs/proofs/source-blocked-pages-20261027/typecheck-final.txt` | evidence | `8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92` |
| `docs/proofs/source-blocked-pages-20261027/unit-final.txt` | evidence | `51e2d7fd4eb2e1af2a8a01aef7162c57fc66a5a14b8d2d8004a609a27ef0e0bc` |
| `docs/proofs/source-crop-repairs-2026-10-27/REPORT.md` | evidence | `f20d68a51abfc8f687e7a6b4c1b30a8cc228c2c2787f620aadbbd9ef66b1e28c` |
| `docs/proofs/source-crop-repairs-2026-10-27/assembled-2026-10-29/REPORT.md` | evidence | `e00b6b2c08ebe63aad6f160f9e67dc228b217e472269c6998d02efb0e3ff4c85` |
| `docs/proofs/source-crop-repairs-2026-10-27/assembled-2026-10-29/assets.txt` | evidence | `0957047733b87cb9695c400e4abdcba6a1f300020f0500f03011d319d9dadd00` |
| `docs/proofs/source-crop-repairs-2026-10-27/assembled-2026-10-29/build.txt` | evidence | `f553f875035f443133c80bf220a34efdc29f612db01b2ffb3a3d5f8beb17172e` |
| `docs/proofs/source-crop-repairs-2026-10-27/assembled-2026-10-29/initial-tests.txt` | evidence | `4d2bb5a0ed42e3047a35d3cdf02b97b451fb0d3be4c3e6e5b26367b82e4b6c2f` |
| `docs/proofs/source-crop-repairs-2026-10-27/assembled-2026-10-29/runtime/browser.txt` | evidence | `ff1b31f2e4122756bf6060e2536c25aa2cca438056f2ecd68cb668e55251a51a` |
| `docs/proofs/source-crop-repairs-2026-10-27/assembled-2026-10-29/scene-source.txt` | evidence | `9d7193e9cb6dcf0da7968706176ccabddbff51408d2116a62a6d42a5d559c235` |
| `docs/proofs/source-crop-repairs-2026-10-27/assembled-2026-10-29/scene-viewports/browser.txt` | evidence | `55629bd45edf96d412e7266dbe9e0e41f268e16bc209aa69d1d83aa8874bfbc5` |
| `docs/proofs/source-crop-repairs-2026-10-27/assembled-2026-10-29/slots.txt` | evidence | `b81d384dea4c7a791fc64103c7f8bcffee1b245275a8b4a8bc615b40c4a59837` |
| `docs/proofs/source-crop-repairs-2026-10-27/assembled-2026-10-29/source-bound-audit-test.txt` | evidence | `8e0d5a860004da8e0a93f224fba274540719a5dbc56f0772b0ab020487bc559d` |
| `docs/proofs/source-crop-repairs-2026-10-27/assembled-2026-10-29/source-pixels.txt` | evidence | `74cc976564adefcb30e4807b3d2cc64d318a4cf797fe7c741d037d3db7d413cf` |
| `docs/proofs/source-crop-repairs-2026-10-27/assembled-2026-10-29/typecheck.txt` | evidence | `880975b9e7fef716b4e6670a6a657162944d78861683e680e47974752be95313` |
| `docs/proofs/source-crop-repairs-2026-10-27/scene-11/REPORT.md` | evidence | `d8375df9216b6dd39de3e152d2ff2536396213f8b9d0d4f185c84b98d087c79e` |
| `docs/proofs/student-route-smoke/SUMMARY.md` | evidence | `e26a1fb717d6734dcfb459bdad88127e35f3e69b239e9b5bf614c836856ebf9c` |
| `docs/proofs/syllables-curriculum/README.md` | evidence | `3d8f8dc02606b3b36e07f3d840b12e9bf1b012606dc9a4797428442850ac3968` |
| `docs/proofs/teacher-guide-preflight/verification.md` | evidence | `39fb1b3969a85b112425d24ffc84c7ab62f3ed42759de1afa9a06a6b95f84570` |
| `docs/proofs/teacher-print-report-preflight/README.md` | evidence | `08493d594d05881ab2a95bbb5b1e81ce01bc529f18b3246f450dc5c86276afac` |
| `docs/proofs/viewport-a11y/README.md` | evidence | `e15165ff567792e8ddacea56814e636e55057ac50cdaec6bfd8733da26ba20be` |
| `docs/proofs/vowels-curriculum/REPORT.md` | evidence | `121f8e2b2656f6bf5f88a45d3d71d75720404eab5e01ee019f6a1a0494bade38` |
| `docs/prototypes/piano-hablador/README.md` | active | `69096132610738b9f3d5e1cbfc58ea7242ed7f9d8accad502cf2fc1b6976657d` |
| `docs/research/NOTEBOOKLM_COMPETITIVE_DIFFERENTIATION.md` | active | `166310a056bb44acdb2889f7046202984a382853d6894d574c9fc0849f178c58` |
| `public/build-version.txt` | evidence | `1b0bb792171718b0583d86cd7caeb73e17fc5a52d5f1da07b431f1062fa067da` |
| `public/cartilla/art/owner-intake/2026-10-14/README.md` | evidence | `018163709933c2507d49a9edbf7e8096e7a89aa38970ef287bfeae8bc495d439` |
| `public/robots.txt` | evidence | `8a7ebc6bf2efc3c3fa992043bd9e9ad1c9a30eb29aa8a4c52b6fd9b7e4fec179` |
| `repo.md` | active | `152f1a700ac02bb62e71709fcedab9ee9bd0cc1c77175492bb2772834df641a2` |
| `scripts/living-motion/README.md` | active | `55268cc7229697ed0f11f7ed0a6a06c92db40de7838624f53a4a0bf871a4f3ce` |
| `src/content/guia/SCHEMA.md` | active | `af48a1fd7b5800d39a09ca744d4716ba9c1a61adacd03768c45023cefe90a270` |
| `src/data/reconstruction/README.md` | active | `f2f12f9bd26871c7d0af4ea957210dd954d18a96506eec9233b9efe2f419f082` |
| `tasks/plan.md` | active | `e359f363eca164c93665656ede56d8bc30fbc7ea9e1a47861c5315afed2b7880` |
| `tasks/todo.md` | active | `877f0fd0c0b375e66dae5ba40c1910a90ff1dce03b65707cf347a0127fa442dc` |
| `tests/e2e/proofs/crm-notes-recovery/browser.txt` | evidence | `c29a3a77aeb43d4257d80ffbcfb5a847d53239dcffc4832796fa61b6fb83668e` |
| `tests/e2e/proofs/crm-notes-recovery/routed-browser.txt` | evidence | `9bcfb29857a0c56e5d02175d1d2f135c137e070a0bf89f385f854f8c0bead117` |
| `tests/e2e/proofs/crm-notes-recovery/typecheck.txt` | evidence | `dbcc655a964994e3991b6f36de08c73bae750b1288be61ed3473396b63599490` |
| `tests/e2e/proofs/crm-notes-recovery/unit-after.txt` | evidence | `780c91f87d23bf7ae2a48246fe35a051580e604f292a7b4a28555f55c6aed547` |
| `tests/e2e/proofs/crm-notes-recovery/unit-before.txt` | evidence | `a834fb96f11008be7cb0d552639acf9e523bf5762762733c16aeadde0ff876d4` |
| `tests/e2e/proofs/roster-recovery/RESULTS.txt` | evidence | `dda980022f097dd70af18df2817ebdbc13a4865e70064d0e5b873ce53245315e` |
| `tests/e2e/proofs/roster-recovery/browser.txt` | evidence | `7782d5328be9abda08df4801ba85a05b97828eb43f4975988d80de53a29851e4` |
| `tests/e2e/proofs/roster-recovery/typecheck.txt` | evidence | `dbcc655a964994e3991b6f36de08c73bae750b1288be61ed3473396b63599490` |
| `tests/e2e/proofs/roster-recovery/unit-after.txt` | evidence | `812195fa0b4ee9b032a6bee95f3b296bed1d2871cd9863b379e71434eee6661d` |
| `tests/e2e/proofs/roster-recovery/unit-before.txt` | evidence | `478af79a77016c1167f8ec74c568891c7b21cd4f47d5adeea722b19f2b626bf6` |
| `tests/e2e/proofs/roster-recovery/unit-original-candidate.txt` | evidence | `487ba6f31acde6f13b7f59a2ea52003e2a2665270c97463d3c6b1d24699d76d5` |
| `tests/e2e/proofs/tasklist-recovery/browser.txt` | evidence | `cdf30c65f0d433ee23c06834f701faf02e8ac39afd3667f905f577543f335bba` |
| `tests/e2e/proofs/tasklist-recovery/typecheck.txt` | evidence | `f0ff6b2bdeb5fe6736b6c1e60f34c5768e123f6035429f950b4094b21882b4ef` |
| `tests/e2e/proofs/tasklist-recovery/unit-after.txt` | evidence | `70d3468d2049fea5109e216d122d7dbef9e5951bb0fcdce33783551a4e05564c` |
| `tests/e2e/proofs/tasklist-recovery/unit-before.txt` | evidence | `3b407196dac075fc5b5d383148564f71c297bda5d408a0369bb36b6bf79baf14` |

</details>
