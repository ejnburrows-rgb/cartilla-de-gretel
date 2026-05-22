# .cartilla-import

Pushing changes to `notion-url.txt` in this folder triggers the
`Import Cartilla PDF from Notion` GitHub Actions workflow.

## Format of `notion-url.txt`

```
<public Notion page URL>
<target path in repo, e.g. public/book/book.pdf>
```

Line 2 is optional; defaults to `public/book/book.pdf`.

The Notion page MUST be shared to web (`Share → Publish → Share to web`) and
contain a PDF attachment as a file block. The workflow uses headless Chromium
to open the page, locate the PDF block, download the signed S3 URL, and commit
it to the repo. Vercel auto-deploys on the resulting commit.
