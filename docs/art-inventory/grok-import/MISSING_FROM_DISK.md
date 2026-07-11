# MISSING_FROM_DISK — Grok Images web export

Many Grok Images generations may live only in the Grok web app history and were not found as additional downloads beyond what was recovered locally.

## What WAS recovered on disk
- `scratch/gretel-source-art/*` (primary animation frames from prior Grok work)
- `public/cartilla/images/gretel/poses/*`
- `public/art/remastered/page-*.webp` (colorized/remastered book pages)
- Desktop `screenshots/refs` gretel + word crops
- Downloads `grok-1c451b32-...jpg` (content review recommended)

## If more images are only in Grok Images (web)
1. Open https://grok.x.ai (or x.com/i/grok) signed in as the operator account
2. Open **Images** / image history for Gretel + cartilla generations
3. For each needed image: open → **Download** / save image
4. Save into: `C:\Users\EJN\Desktop\cartilla-art-from-grok\` under the correct subfolder:
   - solo Gretel → `gretel-poses\`
   - cut-out crops → `book-crops\`
   - full color pages → `book-colorized\`
   - grids → `contact-sheets\`
5. Re-run the import agent / rename pass

Browser automation was not available in this environment.
