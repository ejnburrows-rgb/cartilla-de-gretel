# Independent Lesson 4 source-policy reassessment

Reviewer: independent Codex material-review worker. Reviewed integration head `c64838a8`; production p006 scene bytes remain those at `d613b78ba553c3c5786afdf7d589305a3080f1cf`. Evidence-only review; no production edit.

**WAITING — p006 scene alpha removes source-painted ground.** Recovered provenance resolves authentic source identity, but the RGB-only replay compares surviving pixels and cannot detect foreground discarded to alpha zero.

The source worker's [seven-asset recipe](lesson4-source-provenance.md) and [comparison](lesson4-source-provenance-comparison.jpg) identify the original PDF page6 scan and its JPEG95 crop intermediate. At full950×1250 size, the independently inspected `master_girl_scene.jpg` exactly hashes to the reconstructed intermediate `bc88ef24272c5c7f2a84ee32e64610730c9fc15df8bfebdbef3f40e5cbea792b`. Its source-painted yellow/green ground is visibly filled and connected; installed PNG `99705974587568035b36d3c7100b83a57645727c13cf0c9b5a60e3cef44df2f8` has numerous white/transparent holes in that foreground.

Numerical examples in source-crop coordinates:

| x,y | Source RGB | Installed RGBA |
|---|---|---|
|575,1056|251,252,89|255,255,255,0|
|638,1074|246,243,66|255,255,255,0|
|221,1102|240,236,27|255,255,255,0|
|192,1129|244,244,62|255,255,255,0|

Diagnostic predicate `y>950, alpha=0, R>160, G>150, B<180, R-B>40` identifies29092 fully deleted yellow/green pixels in inclusive bbox`[64,956,838,1217]`. This predicate is evidence of the defect, **not** a restoration mask; it deliberately excludes faint/less saturated real grass.

Full-size visual inspection confirms that bbox contains grass, shoes and source paper, no caption. The entire conservative band `[0,900,950,1250]` contains lower socks, shoes, ground and paper only; no neighboring vocabulary/printed text. To preserve all genuine grass, an exact-source opaque bottom band is safer than selecting only saturated pixels. The tiny neighboring-print fragment at the crop's top-left is outside that band. The integration owner alone owns any correction. Source content must be restored directly, never synthesized.

## Policy consequence

`ASSET_FIDELITY_POLICY.md` permits cleanup, transparency and format improvement while preserving the source drawing, composition and objects. JPEG95 recompression alone is not an automatic policy rejection: it is disclosed, traceable, and must not be called exact original-RGB preservation. The material problem here is foreground removal, which the same policy forbids. This finding requires a narrow source restoration and affected runtime/source checks, not another complete audit or routine owner approval request.

The other six objects retain their depicted identities in the supplied comparison. This is not a certificate of every alpha pixel or WebP derivative. The original source crop/JPEG quality step remains explicitly disclosed; lossless PNG output does not undo intermediate JPEG loss.

[Measurement script](independent-review-source-alpha.py) reads the original PDF and exact candidate Git blob; [raw result](independent-review-source-alpha.json). It neither writes production artwork nor infers physical-device/projector acceptance. After correction, the same bounded check can validate the proposed bottom band as fully opaque and source-matching. The final-head review must inspect the actual correction and result before clearing this finding.
