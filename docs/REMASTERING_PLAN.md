# Remastering Plan — deadline execution

Date: 2026-05-25

## What moved forward now

The product now has a fast quality mode instead of waiting for every image to be manually approved.

Built changes:

1. Student workbook viewer uses the best available image path:
   - V2 remaster when present
   - corrected/remastered image when available
   - original scan as automatic fallback
2. Teacher flipchart has a projection quality mode.
3. Page turn animation was rebuilt with stronger physical-book 3D depth.
4. The `/cartilla` hub now reports actual page/image/remaster progress.
5. Image loading was optimized for high-priority classroom display with fallback to source scan.

## Current inventory

The inventory tracks:

- student workbook scans
- teacher flipchart scans
- pending corrections
- cleaned images
- V2 samples
- original-source fallback

## Execution rule

Move fast by wiring improved images as preview/projection quality immediately while preserving original scans as fallback. Do not block product progress waiting for perfect approval of every page.

## Next production push

Continue the same pattern:

1. process next batch of scans
2. add corrected image paths to `remaster-inventory.json`
3. let the product automatically prefer corrected/V2 paths
4. use review screen only to reject/tune obvious problems
