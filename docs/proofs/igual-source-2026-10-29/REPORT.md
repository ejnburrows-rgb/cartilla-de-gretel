# Existing #1097 source-validation integration

## WORKS

- Reused independently reviewed candidate `8ab5091a327176eac8664b9986cf325e31680353` and incorporated current main `454c15ed1efcea71ef859acfa1909520c3b6d094` on the original assignment. Source validator, source/installed fingerprints and installed original crop remain unchanged from the reviewed candidate.
- The installed 106×61 WebP decodes to exactly the original canonical crop's RGB samples. Original PNG SHA256: `e38f3b2c1447b8ba0c67fbdb149160fd45c38a824d6591f05b38ac3e292f06fc`; canonical and both responsive copies: `4154199071049f91459ac78dc7b715ea9f96f24f7c59edbd9f0dca2486742979`.
- [21 focused checks](unit.txt) pass, including bad-source-hash, bad-installed-hash and unknown-provenance negative cases, audit reproduction and inventory consistency. TypeScript and production Vite compilation pass.
- Actual built `/cartilla/leccion/5` printed pages 13 and 14 at 390×900 and 1366×900: every visible `igual` currentSrc response matches the source-backed installed hash, without page exceptions. [Raw results](results.json), [recorded route/page checks](actual-pages.webm), [phone page 13](390-page-13.png), [laptop page 14](1366-page-14.png). The four journey screenshots accompany the results. Only resume pointers were seeded, with no activity answers or completion; auth/REST calls were blocked.
- Existing authoritative audit and inventory were regenerated. Canonical mapping and all nine verified native-crop PASS rows remain unchanged. The exact-source `igual` row now reflects its verified original crop; no filename/hash/size exception is retained for it.

## DOES NOT WORK

- None observed in this scoped source/runtime validation. The first browser attempt preceded preview-server readiness; its connection refusal did not exercise the product.

## NOT VERIFIED

- Physical phone/Safari, all activities on these pages, all artwork placements, assembled product acceptance and deployment. The native source is 106×61; no replacement drawing or artificial source enlargement was introduced.
- This report qualifies existing #1097, the prerequisite for stacked #1205. It does not certify #1205's remaining artwork or original Gretel audio.

Reproduce after a production build and preview on port 5179: `node scripts/proofs/check-igual-source.mjs`.
