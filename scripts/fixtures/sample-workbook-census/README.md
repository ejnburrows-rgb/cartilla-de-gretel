# Sample census fixtures — FAKE data only

These 4 tiny files are hand-written fake samples (2 fake pages) used only to
prove `scripts/build-workbook-manifest.mjs` degrades gracefully against
partial/malformed input and produces a valid, honestly-scoped manifest. None
of this is real book content — do not treat any of these values as real
instructions, real objects, or real audio.

Try it:

```
node scripts/build-workbook-manifest.mjs \
  --master=scripts/fixtures/sample-workbook-census/cartilla_92_page_master_map.sample.csv \
  --content=scripts/fixtures/sample-workbook-census/cartilla_page_content_extract.sample.csv \
  --interactions=scripts/fixtures/sample-workbook-census/cartilla_interaction_content.sample.json \
  --crop=scripts/fixtures/sample-workbook-census/cartilla_crop_manifest.sample.csv \
  --out=/tmp/sample-workbook-manifest.json

node scripts/validate-workbook-manifest.mjs /tmp/sample-workbook-manifest.json
```

Or with zero args (`node scripts/build-workbook-manifest.mjs`) to see it
degrade all the way down to an empty `pages: []` manifest with clear
`SKIPPED` notes for every input, instead of crashing.
