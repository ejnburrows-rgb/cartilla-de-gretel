# Final completion candidate - PR 426

Branch: `fix/lessons-08-24-book-fidelity`. No merge or deployment.

## Recovery

`~/workspace/cartilla-master` was absent, and `c9a55b66` was absent from the available workspaces and remote. The initial branch at `35961c7dc96efcbe6eaebfd77ec8cdadc57e2d8c` was preserved. A final remote check found newer completion commits through `6ef450637c50d09095d82d6de1b82b008273a6c9`; these commits were integrated intact, retaining their curriculum fixes, saved page progress, source color data, and cleanup. Existing Lessons 1-24 transcriptions were retained; only the missing presentation, completion gate, and artwork deltas were applied.

## Artwork provenance

Read `CARTILLA_FINAL_ASSET_HANDOFF.md` in Cartilla Production Hub / 03 Generated Candidates / 2026-09-30 Recent Chat Assets. Production files were copied unchanged from collected final ChatGPT WebP exports or the standalone `modernized/` entries in `flipchart_all_separate_images_remastered.zip`. No artwork was generated, recolored, or redrawn. Contact sheets, collages, originals, and experiments were not installed.

Canonical directory: `public/cartilla/art/optimized/flipchart-native/`. `flipchart-production-art.json` separates scenes and vocabulary on the 42 illustrated plates, preserving all vocabulary slots. The final-slot registry and delivery metadata use the same destinations. The preparation function verifies these immutable inputs instead of overwriting them with old PDF crops.

| Slot | Production filename | Source | SHA-256 |
| --- | --- | --- | --- |
| p018-tomate | `p018-tomate.webp` | Final collected export | `9a5e9fd2cad78fefaeb7ea25c3e9ff208989af6c0a5b5c53aaab1b94bbcd0c02` |
| p018-tapa | `p018-tapa.webp` | Final collected export | `12d301a36bd70573e5d074566f97710be238fe786afc77a349f4b13d23a30ab8` |
| p018-topo | `p018-topo.webp` | Final collected export | `4fb295743140b209d8dd904ebf0c41dfc0f210733c05ae4e322f3baeef134a31` |
| p018-tipi | `p018-tipi.webp` | Final collected export | `e8d79029f574760d317c2149fd5277de3b5426c1bee9bafed11c1ea2c36e4776` |
| p018-tuto | `p018-tuto.webp` | Final collected export | `f4e724569662349e4b153fef92b8eb5c9bbbe85dc291099a91671f63418ff66d` |
| p021-didi | `p021-didi.webp` | Final collected export | `bee90469d28b79ba0860b5bb571a4dff230ce310b473c885a673dfb981e2fdf5` |
| p021-dados | `p021-dados.webp` | Final collected export | `23924290a7f5e214d5d0e4fe09612f170958064b463a4851cce88a9d5db3eb0b` |
| p021-dedo | `p021-dedo.webp` | Final collected export | `1638e7607ebc9ef0200bd055e14bfaeee623ef9ee6f07f8d0f1b93c33b5dd8f8` |
| p021-doce | `p021-doce.webp` | Final collected export | `c6f89e7ba7f11bd6c3f5ba1ede8e949bd845c457324ceb31f376a79a9d2cb9b0` |
| p021-dunia | `p021-dunia.webp` | Final collected export | `a1f9cbc5fbfda20fdb401c2e95a464d3e1a40ed0e9c1bbade65c1891e6125af2` |
| p024-maleta | `p024-maleta.webp` | Final collected export | `7f25455815b38ce70a173634e97b71583b075b45adbf0646ee0e51c855f41452` |
| p024-lata | `p024-lata.webp` | Final collected export | `1cc2938e63b8674cf72a1e4b07106b7eea50943013e8ef9c2e37bd82f465802e` |
| p024-luli | `p024-luli.webp` | Final collected export | `bec7d120b337decdc698370426b208bc73daa8aa07129d8fc0ea5c79f1b01cd7` |
| p024-loma | `p024-loma.webp` | Final collected export | `806b74aa7173ad75d87bbecac154e92edc8ec63213e9cca01d0dc0180071abee` |
| p024-lala | `p024-lala.png` | Remastered standalone archive: p24_vocab_lala_05.png | `314e85e8731370105a83c8a636f17580d1f9421a6b159ee049065a6960309459` |
| p056-caramelos | `p056-caramelos.webp` | Final collected export | `f861369a1d1b4535b39331f7743187754caa8099c7eb8b257217c1e03a021a5d` |

All 167 production artwork images are asserted exactly once in each applicable browser-rendered plate at projector, laptop, and tablet sizes. All 16 obsolete `faithful/flipchart-native/` derivatives were removed after proving active code and delivery metadata no longer reference them. Authoritative PDF/source scans remain untouched.

Some collected images contain neighbouring print fragments. Display-only CSS masks hide those fragments while preserving source bytes and the complete illustration. Complete baked labels suppress the extra caption. Printed accents and name capitalization come from the existing transcription, not filename slugs.

## Presentation and activities

- Native book zones, source text, reading order, scenes, vocabulary, and letter/syllable relationships retained.
- Real SVG crescent geometry; source color registry and true crescent geometry from the recovered completion stream retained.
- Responsive page sizing, clean white page surface, consistent art scale, complete captions, and external touch controls.
- Reading fragments on the same printed line remain one sentence; single-word story endings remain visible.
- Presenter opens directly on the page. Its introductory portrait no longer covers the chart.
- Student forward navigation requires every real activity on the current page. Stale-page events cannot unlock it. Undo/retry closes the gate. Reading-only pages follow the recovered gate contract and can advance. Previous navigation remains available.
- Writing without a verified trace template uses the existing freehand canvas with the printed model. No inferred template was created.

## Future approved Flow clips

`src/content/approved-art-motion.json` maps canonical still URLs to approved silent video URLs, e.g. `"/cartilla/art/optimized/flipchart-native/p018-tomate.webp": "/cartilla/motion/approved/p018-tomate.mp4"`. The registry is empty until clips are approved. `LivingIllustration` plays an approved clip once, then returns to its still. Reduced motion, decorative/static instances, load errors, and autoplay rejection use the static fallback. No video was generated. The owner’s superseding welcome-only contract is implemented using the existing media player: a future approved silent clip loops until Comenzar; reduced motion, slow loading or failure uses the approved still. Entry is immediate and skips the old two-step introduction.

## Verification

TypeScript and production build pass. Full unit suite: 110 files, 1,360 passed, two existing expected failures for unverified source pages. Browser checks cover 60 instructional Flip Chart pages at three sizes (180 captures), all 90 Workbook pages across 24 lessons, and actual interactions plus Next gating. Screenshots and JSON evidence accompany the review artifact.

## Genuine remaining source blocker

The supplied `Libro del alumno - Rescan and Optimize (2).pdf` has 98 PDF pages and skips printed Workbook pages 86 and 87: printed 85 is followed by printed 88. Its final-page index screenshot proves the gap. Page 86 fill-in items remain unavailable; page 87 retains the previous writing pattern but cannot be source-verified. Neither was invented or claimed complete. Recover Muse commit `c9a55b66` or obtain those two original source pages to finish this blocked fidelity check.

Emilio’s exact approved left Gretel master (`Folk Art Girl with Red Bow.png`, Drive `1UDgi3wPfKhrp9P_fovYisN5E0G0Wnw6W`) is installed unchanged. Existing cinematic, guide, frontmatter, legacy art wrapper and lesson-path surfaces use this same still. The host state machine and clip fallbacks remain; uncertified alternate character poses are not rendered. No video was generated. The owner’s superseding welcome-only contract is implemented using the existing media player: a future approved silent clip loops until Comenzar; reduced motion, slow loading or failure uses the approved still. Entry is immediate and skips the old two-step introduction.
