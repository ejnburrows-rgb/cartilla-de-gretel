#!/usr/bin/env python3
"""Script check of every slot's live picture for 'not finished' signs. READ-ONLY: changes no art.
Writes docs/art-inventory/quality.json. Needs Pillow, numpy, scipy, and the tesseract program (for baked text).
Run: python3 scripts/audit_art_quality.py"""
import json, os, re, io, subprocess, tempfile, base64, collections, datetime
from multiprocessing import Pool
import numpy as np
from PIL import Image
from scipy import ndimage

OUT = "docs/art-inventory/quality.json"
# Thresholds (stated so the owner can see exactly what each tag means)
MIN_LONG_EDGE = 384      # delivery tier: picture must have at least 384 px on its long side
MAX_KB = 250             # heavier than this is slow on a phone
MAX_LONG_EDGE = 1200     # larger than the biggest delivery tier (768) x ~1.5 is wasted
EDGE_BAND = 2            # px band checked for subject touching the edge
EDGE_FRAC = 0.06         # share of one side that must be touched to count
LINE_FRAC = 0.5          # share of a row/column (within 6 px of an edge) that is dark or teal = a line
TEAL_BAND_FRAC = 0.01    # teal pixels in the outer 8% band
FRAG_FRAC = 0.003        # a separate piece touching the edge, larger than this share of the image

TAGS = {
 "NOT_WEBP": "Not an optimized web file (PNG or JPG instead of WebP)",
 "SVG_WRAPPED_RASTER": "SVG file that only wraps a bitmap",
 "NO_TRANSPARENCY": "Opaque: background is baked in, no transparency",
 "LOW_RES": f"Long edge under {MIN_LONG_EDGE} px",
 "OVERSIZED": f"Over {MAX_KB} KB or over {MAX_LONG_EDGE} px",
 "EDGE_TOUCH": "Picture touches an edge (possible cut-off)",
 "BORDER_LINE": "Dark or teal line along an edge (crop or grid line)",
 "TEAL_EDGE": "Teal page edge or border color left in",
 "NEIGHBOR_FRAGMENT": "Piece of a neighboring picture at an edge",
 "BAKED_TEXT": "Printed letters inside the picture",
 "BG_RESIDUE": "Page background or paper noise left around the picture",
 "MARGINS": "Empty margin around the picture (picture fills under 82% of its frame)",
 "STALE_DELIVERY": "The file the app loads is an older picture than the repo copy",
 "RAW_CROP": "Looks like the raw book crop, not a cleaned picture",
}

def load(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == ".svg":
        t = open(path, errors="ignore").read()
        m = re.search(r'href="data:image/[a-z+]+;base64,([^"]+)"', t)
        if not m: return None, "svg-vector"
        return Image.open(io.BytesIO(base64.b64decode(m.group(1)))), "svg-wrapped"
    return Image.open(path), "raster"

def ocr_words(rgb):
    im = rgb.copy(); s = max(1, 700 // max(im.size)); im = im.resize((im.width*s, im.height*s)) if s > 1 else im
    with tempfile.NamedTemporaryFile(suffix=".png") as f:
        im.save(f.name)
        try: out = subprocess.run(["tesseract", f.name, "stdout", "--psm", "11", "-l", "eng", "tsv"], capture_output=True, text=True, timeout=30).stdout
        except Exception: return []
    words = []
    for line in out.splitlines()[1:]:
        c = line.split("\t")
        if len(c) >= 12 and c[11].strip() and float(c[10]) >= 55 and re.search(r"[A-Za-zÁÉÍÓÚáéíóúñÑ]{2,}", c[11]): words.append(c[11].strip())
    return words

APP = json.load(open("docs/art-inventory/app-loaded.json"))["slots"]
def _extra(x, tags, m):
    a = APP[x["slot_id"]]
    if a.get("delivery_stale"): tags.append("STALE_DELIVERY")
    if a.get("raw_crop_suspect"): tags.append("RAW_CROP")
    return x["slot_id"], tags, m
def audit(x):
    p = APP[x["slot_id"]]["app_loads"];  # the file the app really loads (delivery file for faithful art)
    kb = os.path.getsize(p) / 1024; ext = os.path.splitext(p)[1].lower()
    tags = []; m = dict(path=p, kb=round(kb, 1), ext=ext)
    im, kind = load(p)
    if kind == "svg-wrapped": tags.append("SVG_WRAPPED_RASTER")
    if ext in (".png", ".jpg", ".jpeg"): tags.append("NOT_WEBP")
    if im is None:
        m["note"] = "vector svg, pixel checks skipped"; return _extra(x, tags, m)
    im.load(); m["mode"] = im.mode; m["size"] = list(im.size)
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    rgba = np.asarray(im.convert("RGBA")).astype(np.int16); H, W = rgba.shape[:2]
    a = rgba[..., 3]; rgb = rgba[..., :3]
    if has_alpha and (a < 250).mean() > 0.02: fg = a > 40
    else:
        tags.append("NO_TRANSPARENCY")
        pts = np.concatenate([rgb[:4, :4].reshape(-1, 3), rgb[:4, -4:].reshape(-1, 3), rgb[-4:, :4].reshape(-1, 3), rgb[-4:, -4:].reshape(-1, 3)])
        bg = np.median(pts, axis=0); fg = np.abs(rgb - bg).sum(axis=2) > 60
        m["bg_rgb"] = [int(v) for v in bg]
        # residue: border band not clean (paper noise or a non-white tint)
        band = np.zeros((H, W), bool); b = max(2, int(min(H, W) * 0.03)); band[:b] = band[-b:] = True; band[:, :b] = band[:, -b:] = True
        if (np.abs(rgb - 255).sum(axis=2)[band] > 40).mean() > 0.15 and bg.min() < 235: tags.append("BG_RESIDUE")
    m["long_edge"] = max(W, H)
    if max(W, H) < MIN_LONG_EDGE: tags.append("LOW_RES")
    if kb > MAX_KB or max(W, H) > MAX_LONG_EDGE: tags.append("OVERSIZED")
    e = EDGE_BAND
    sides = dict(top=fg[:e].any(axis=0).mean(), bottom=fg[-e:].any(axis=0).mean(), left=fg[:, :e].any(axis=1).mean(), right=fg[:, -e:].any(axis=1).mean())
    m["edge_touch"] = {k: round(float(v), 3) for k, v in sides.items()}
    touched = [k for k, v in sides.items() if v > EDGE_FRAC]
    if touched: tags.append("EDGE_TOUCH"); m["touches"] = touched
    # lines along edges: dark or teal runs in the 6 px next to an edge
    lum = rgb.mean(axis=2); dark = (lum < 110) & fg
    teal = (rgb[..., 1] > rgb[..., 0] + 35) & (rgb[..., 2] > rgb[..., 0] + 25) & (rgb[..., 1] > 90) & fg
    lines = []
    for name, sl, ax in (("top", np.s_[:6], 1), ("bottom", np.s_[-6:], 1)):
        arr = (dark | teal)[sl]; 
        if arr.shape[0] and (arr.mean(axis=1) > LINE_FRAC).any(): lines.append(name)
    for name, sl in (("left", np.s_[:, :6]), ("right", np.s_[:, -6:])):
        arr = (dark | teal)[sl]
        if (arr.mean(axis=0) > LINE_FRAC).any(): lines.append(name)
    if lines: tags.append("BORDER_LINE"); m["lines"] = lines
    bw, bh = max(2, int(W * 0.08)), max(2, int(H * 0.08)); band = np.zeros((H, W), bool); band[:bh] = band[-bh:] = True; band[:, :bw] = band[:, -bw:] = True
    if (teal & band).sum() / max(1, band.sum()) > TEAL_BAND_FRAC: tags.append("TEAL_EDGE")
    ys, xs = np.where(fg)
    if len(xs):
        bw_, bh_ = (xs.max() - xs.min() + 1) / W, (ys.max() - ys.min() + 1) / H; m["fill"] = [round(float(bw_), 2), round(float(bh_), 2)]
        if bw_ < 0.82 or bh_ < 0.82: tags.append("MARGINS")
    lab, n = ndimage.label(fg)
    if n > 1:
        sizes = ndimage.sum(fg, lab, range(1, n + 1)); big = int(np.argmax(sizes)) + 1
        edge_labels = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0, big}
        frag = [int(l) for l in edge_labels if sizes[l - 1] / (W * H) > FRAG_FRAC]
        if frag: tags.append("NEIGHBOR_FRAGMENT"); m["fragments"] = len(frag)
    flat = Image.fromarray(np.where(fg[..., None], rgb, 255).astype(np.uint8))
    words = ocr_words(flat); m["ocr_words"] = words
    if words: tags.append("BAKED_TEXT")
    return _extra(x, tags, m)

if __name__ == "__main__":
    slots = json.load(open("docs/art-inventory/slots-327.json"))
    with Pool(4) as pool: res = pool.map(audit, slots, chunksize=8)
    per = {sid: dict(tags=t, metrics=m) for sid, t, m in res}
    cnt = collections.Counter(t for _, tags, _ in res for t in tags)
    nf = sum(1 for _, tags, _ in res if tags)
    crop_tags = {"EDGE_TOUCH", "BORDER_LINE", "TEAL_EDGE", "NEIGHBOR_FRAGMENT", "BAKED_TEXT", "BG_RESIDUE", "MARGINS", "RAW_CROP"}
    crop_bad = sum(1 for _, tags, _ in res if crop_tags & set(tags)); fmt_bad = sum(1 for _, tags, _ in res if {"NOT_WEBP", "SVG_WRAPPED_RASTER", "NO_TRANSPARENCY", "LOW_RES", "OVERSIZED", "STALE_DELIVERY"} & set(tags))
    git = os.environ.get("AUDIT_COMMIT") or subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()
    doc = dict(commit=git, built=datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="minutes"), total=len(slots), not_finished=nf,
               crop_problems=crop_bad, format_or_size_problems=fmt_bad, per_tag=dict(cnt), tag_meaning=TAGS,
               thresholds=dict(MIN_LONG_EDGE=MIN_LONG_EDGE, MAX_KB=MAX_KB, MAX_LONG_EDGE=MAX_LONG_EDGE, EDGE_FRAC=EDGE_FRAC, LINE_FRAC=LINE_FRAC), slots=per)
    json.dump(doc, open(OUT, "w"), separators=(",", ":"), ensure_ascii=False)
    print(json.dumps(dict(total=len(slots), not_finished=nf, crop_problems=crop_bad, format_or_size_problems=fmt_bad, per_tag=dict(cnt)), indent=1))
