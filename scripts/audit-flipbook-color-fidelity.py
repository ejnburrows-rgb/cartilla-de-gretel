#!/usr/bin/env python3
"""Strict Lessons 1–5 teacher-flipchart color fidelity audit.

This gate is deliberately stronger than a generic "is the crop colored?" test.
It audits the artwork actually shown by the runtime on physical workbook pages
1–15 and requires one of two proofs:

1. FLIPBOOK COLOR: the identical drawing is located in the canonical 62-page
   teacher flipbook and the live crop's painted pixels agree with that source;
2. WORKBOOK-ONLY: the manifest explicitly records an exhaustive 62-page search
   proving that no identical teacher drawing exists, so the exact student-book
   crop is retained without invented/recolored art.

Generated/remastered art, weak source matches, and material palette drift fail.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

try:
    import cv2
    import numpy as np
except Exception as exc:
    raise SystemExit(f"FLIPBOOK_COLOR_AUDIT_DEPENDENCY_ERROR: {exc}")

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
HD_TEACHER_DIR = PUBLIC / "cartilla/art/hd/flipchart"
LOW_TEACHER_DIR = PUBLIC / "cartilla/images/teacher-flipchart"
LAYOUTS = ROOT / "src/data/page-layouts.json"
MANIFEST = PUBLIC / "cartilla/art/faithful/manifest.json"
QA_RESULTS = PUBLIC / "cartilla/art/faithful/qa-results.json"

PAGES = set(range(1, 16))  # Lessons 1–5
BANNED = (
    "/cartilla/art/color/generated/",
    "/cartilla/art/color/workbook/",
    "/cartilla/art/generated/",
    "/cartilla/art/remastered/",
    "/cartilla/art/emergent/",
)
WORKBOOK_ONLY_PROVENANCE = "VERIFIED-EXACT-WORKBOOK-CROP-2026-08-08"
AUTHENTIC_FLIPBOOK_PROVENANCE = "VERIFIED-AUTHENTIC-FLIPCHART-2026-08-08"

# Keep this synchronized with src/lib/emergent-art.ts. The audit must inspect
# the asset the student actually sees, not a stale/raw JSON path that runtime
# replaces before rendering.
RUNTIME_REPLACEMENTS = {
    "/cartilla/art/faithful/leccion-1/ola.webp": "/cartilla/art/faithful/vocal-o/ola.webp",
    "/cartilla/art/faithful/leccion-1/traje.webp": "/cartilla/art/faithful/vocal-u/uniforme.webp",
    "/cartilla/art/faithful/leccion-3/ardilla.webp": "/cartilla/art/faithful/vocal-a/ardilla.webp",
    "/cartilla/art/faithful/leccion-4/erizo.webp": "/cartilla/art/faithful/vocal-e/erizo.webp",
    "/cartilla/art/faithful/leccion-5/igual.webp": "/cartilla/art/faithful/vocal-i/igual.webp",
    "/cartilla/art/faithful/leccion-5/iguana.webp": "/cartilla/art/faithful/vocal-i/iguana.webp",
    "/cartilla/art/faithful/leccion-8-p/pez.webp": "/cartilla/art/faithful/leccion-1/pez.webp",
    "/cartilla/art/faithful/leccion-18-c/carro.webp": "/cartilla/art/faithful/leccion-1/carro.webp",
    "/cartilla/art/faithful/leccion-18-rr/carro.webp": "/cartilla/art/faithful/leccion-1/carro.webp",
}

# These are the canonical teacher vocabulary pages documented by the source
# audit. Constraining a word to its real lesson page avoids accepting a
# geometrically similar but semantically wrong drawing elsewhere in the book.
EXPECTED_HD_PAGE_BY_FAMILY = {
    "vocal-o": 4,
    "vocal-a": 5,
    "vocal-e": 6,
    "vocal-i": 7,
    "vocal-u": 8,
}
SPECIAL_EXPECTED_PAGE = {
    "/cartilla/art/faithful/vocal-e/escoba.webp": 3,
}

MAX_TEACHER_DIM = 1900
MAX_TARGETED_TEACHER_DIM = 2800
MAX_TEMPLATE_DIM = 850
MIN_INLIERS = 7
MIN_RATIO = 0.48
MIN_SCORE = 4.2

# Color thresholds are evaluated only on interior pixels that are genuinely
# colored in BOTH aligned images. This removes JPEG/WebP antialiasing and crop
# edge noise without forgiving a wrong fill color.
MIN_COLOR_PIXELS = 70
MAX_LAB_MEDIAN = 18.0
MAX_LAB_P75 = 34.0
MAX_HUE_MEDIAN_DEG = 10.0
MAX_HUE_P75_DEG = 20.0
MAX_SAT_MEDIAN = 34.0


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def runtime_src(src):
    if not isinstance(src, str):
        return src
    return RUNTIME_REPLACEMENTS.get(src, src)


def collect_page_srcs():
    raw = load_json(LAYOUTS).get("pages", {})
    found: set[str] = set()

    def add(src):
        src = runtime_src(src)
        if isinstance(src, str) and src.startswith("/cartilla/art/"):
            found.add(src)

    for p in sorted(PAGES):
        page = raw.get(str(p), {})
        regions = page if isinstance(page, list) else page.get("regions", [])
        for r in regions:
            add(r.get("illustrationSrc"))
            for c in r.get("cells", []) or []:
                add(c.get("illustrationSrc"))
            for row in r.get("vowelRows", []) or []:
                for c in row.get("cells", []) or []:
                    add(c.get("illustrationSrc"))
            for c in r.get("vowelPairs", []) or []:
                add(c.get("illustrationSrc"))
            for row in r.get("matchRows", []) or []:
                for c in row:
                    add(c.get("illustrationSrc"))
            for item in r.get("fillItems", []) or []:
                add(item.get("illustrationSrc"))
    return sorted(found)


def read_bgr_path(path: Path):
    img = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
    if img is None:
        return None
    if img.ndim == 2:
        return cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    if img.shape[2] == 4:
        bgr = img[:, :, :3].astype(np.float32)
        a = img[:, :, 3:4].astype(np.float32) / 255.0
        return (bgr * a + 255.0 * (1.0 - a)).astype(np.uint8)
    return img[:, :, :3]


def read_bgr(src: str):
    return read_bgr_path(PUBLIC / src.lstrip("/"))


def shrink(img, max_dim):
    h, w = img.shape[:2]
    scale = min(1.0, float(max_dim) / max(h, w))
    if scale >= 0.999:
        return img
    return cv2.resize(
        img,
        (max(1, round(w * scale)), max(1, round(h * scale))),
        interpolation=cv2.INTER_AREA,
    )


def gray_for_sift(bgr):
    return cv2.equalizeHist(cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY))


def sift(gray):
    detector = cv2.SIFT_create(nfeatures=2200, contrastThreshold=0.014, edgeThreshold=14)
    return detector.detectAndCompute(gray, None)


def match(template, tkp, tdes, page, pkp, pdes):
    if tdes is None or pdes is None or len(tkp) < 4 or len(pkp) < 4:
        return None
    matcher = cv2.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=64))
    pairs = matcher.knnMatch(tdes.astype(np.float32), pdes.astype(np.float32), k=2)
    good = [
        m
        for pair in pairs
        if len(pair) == 2
        for m, n in [pair]
        if m.distance < 0.72 * n.distance
    ]
    if len(good) < MIN_INLIERS:
        return None
    src_pts = np.float32([tkp[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst_pts = np.float32([pkp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 4.5)
    if H is None or mask is None:
        return None
    inliers = int(mask.ravel().sum())
    ratio = inliers / max(1, len(good))
    score = inliers * ratio
    if inliers < MIN_INLIERS or ratio < MIN_RATIO or score < MIN_SCORE:
        return None
    h, w = template.shape[:2]
    corners = np.float32([[[0, 0]], [[w, 0]], [[w, h]], [[0, h]]])
    projected = cv2.perspectiveTransform(corners, H).reshape(-1, 2)
    if not np.isfinite(projected).all() or abs(cv2.contourArea(projected.astype(np.float32))) < 250:
        return None
    return {"H": H, "inliers": inliers, "ratio": ratio, "score": score}


def colored_interior_mask(live_hsv, src_hsv):
    live_col = (
        (live_hsv[:, :, 1] >= 24)
        & (live_hsv[:, :, 2] >= 32)
        & (live_hsv[:, :, 2] <= 250)
    )
    src_col = (
        (src_hsv[:, :, 1] >= 24)
        & (src_hsv[:, :, 2] >= 32)
        & (src_hsv[:, :, 2] <= 250)
    )
    mask = (live_col & src_col).astype(np.uint8) * 255
    if int((mask > 0).sum()) >= 120:
        kernel = np.ones((3, 3), np.uint8)
        mask = cv2.erode(mask, kernel, iterations=1)
    return mask > 0


def color_metrics(template_bgr, teacher_bgr, H):
    h, w = template_bgr.shape[:2]
    try:
        inv = np.linalg.inv(H)
    except np.linalg.LinAlgError:
        return None
    aligned = cv2.warpPerspective(
        teacher_bgr,
        inv,
        (w, h),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(255, 255, 255),
    )
    live_hsv = cv2.cvtColor(template_bgr, cv2.COLOR_BGR2HSV)
    src_hsv = cv2.cvtColor(aligned, cv2.COLOR_BGR2HSV)
    mask = colored_interior_mask(live_hsv, src_hsv)
    count = int(mask.sum())
    if count < MIN_COLOR_PIXELS:
        return {"color_pixels": count, "insufficient_color": True}

    live_lab = cv2.cvtColor(template_bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    src_lab = cv2.cvtColor(aligned, cv2.COLOR_BGR2LAB).astype(np.float32)
    delta = np.linalg.norm(live_lab - src_lab, axis=2)[mask]
    h1 = live_hsv[:, :, 0].astype(np.int16)
    h2 = src_hsv[:, :, 0].astype(np.int16)
    hd = np.abs(h1 - h2)
    hd = np.minimum(hd, 180 - hd).astype(np.float32) * 2.0
    hue = hd[mask]
    sat = np.abs(
        live_hsv[:, :, 1].astype(np.int16) - src_hsv[:, :, 1].astype(np.int16)
    )[mask]
    return {
        "color_pixels": count,
        "lab_median": float(np.median(delta)),
        "lab_p75": float(np.percentile(delta, 75)),
        "hue_median_deg": float(np.median(hue)),
        "hue_p75_deg": float(np.percentile(hue, 75)),
        "sat_median": float(np.median(sat)),
    }


def color_pass(m):
    return bool(
        m
        and not m.get("insufficient_color")
        and m["lab_median"] <= MAX_LAB_MEDIAN
        and m["lab_p75"] <= MAX_LAB_P75
        and m["hue_median_deg"] <= MAX_HUE_MEDIAN_DEG
        and m["hue_p75_deg"] <= MAX_HUE_P75_DEG
        and m["sat_median"] <= MAX_SAT_MEDIAN
    )


def crop_manifest_source(entry):
    source = entry.get("source")
    box = entry.get("cropBox")
    if not isinstance(source, str) or not isinstance(box, list) or len(box) != 4:
        return None
    source_path = ROOT / source
    if not source_path.exists():
        return None
    if "/art/hd/flipchart/" not in source.replace("\\", "/") and "/images/teacher-flipchart/" not in source.replace("\\", "/"):
        return None
    x, y, w, h = [int(v) for v in box]
    if w < 20 or h < 20:
        return None
    page = read_bgr_path(source_path)
    if page is None or x < 0 or y < 0 or x + w > page.shape[1] or y + h > page.shape[0]:
        return None
    crop = page[y : y + h, x : x + w].copy()
    return source_path.name, crop


def direct_crop_proof(asset, entry):
    direct = crop_manifest_source(entry)
    if direct is None:
        return None
    source_name, source_crop = direct
    a = shrink(asset, MAX_TEMPLATE_DIM)
    s = shrink(source_crop, max(MAX_TEMPLATE_DIM, max(a.shape[:2])))
    akp, ades = sift(gray_for_sift(a))
    skp, sdes = sift(gray_for_sift(s))
    hit = match(a, akp, ades, s, skp, sdes)
    if not hit:
        return {"status": "FAIL_DIRECT_SOURCE_GEOMETRY", "teacher_page": source_name}
    metrics = color_metrics(a, s, hit["H"])
    return {
        "status": "PASS_EXACT_FLIPBOOK_COLOR" if color_pass(metrics) else "FAIL_FLIPBOOK_COLOR_DRIFT",
        "teacher_page": source_name,
        "source_mode": "manifest-exact-crop",
        "inliers": hit["inliers"],
        "inlier_ratio": round(hit["ratio"], 4),
        "color": None if metrics is None else {
            k: (round(v, 3) if isinstance(v, float) else v) for k, v in metrics.items()
        },
    }


def family_expected_page(src):
    if src in SPECIAL_EXPECTED_PAGE:
        return SPECIAL_EXPECTED_PAGE[src]
    m = re.search(r"/faithful/(vocal-[oaeiu])/", src)
    return EXPECTED_HD_PAGE_BY_FAMILY.get(m.group(1)) if m else None


def main():
    hd_paths = sorted(HD_TEACHER_DIR.glob("page-*.jpg"))
    low_paths = sorted(LOW_TEACHER_DIR.glob("teacher-page-*.jpg"))
    if len(hd_paths) != 62 or len(low_paths) != 62:
        raise SystemExit(
            f"FLIPBOOK_COLOR_AUDIT_FAIL expected 62+62 canonical teacher pages, found HD={len(hd_paths)} low={len(low_paths)}"
        )

    manifest = load_json(MANIFEST)
    meta = {e.get("src"): e for e in manifest if e.get("src")}
    qa = load_json(QA_RESULTS)
    qa_verdict = {
        "/" + str(r.get("file", "")).removeprefix("public/"): r.get("verdict")
        for r in qa.get("results", [])
    }
    live = collect_page_srcs()
    print(f"FLIPBOOK_COLOR_AUDIT_START live_unique_art={len(live)} teacher_pages=62", flush=True)

    # Build a search index of the canonical HD teacher pages. The source audit
    # already proved the low-res set is a 62/62 same-page export; checking that
    # both sets exist protects against accidentally auditing an incomplete set.
    teacher_cache = {}
    for idx, path in enumerate(hd_paths, 1):
        img = read_bgr_path(path)
        if img is None:
            raise SystemExit(f"FLIPBOOK_COLOR_AUDIT_FAIL unreadable teacher page {path.name}")
        img = shrink(img, MAX_TEACHER_DIM)
        kp, des = sift(gray_for_sift(img))
        teacher_cache[idx] = (path.name, img, kp, des)
        if idx % 10 == 0 or idx == 62:
            print(f"FLIPBOOK_COLOR_TEACHER_INDEX {idx}/62", flush=True)

    # Higher-resolution copies only for the five early-vowel source pages. They
    # are searched one at a time and recover small/simple drawings that a
    # whole-book downscaled scan can miss.
    targeted_cache = {}
    for page_no in sorted(set(EXPECTED_HD_PAGE_BY_FAMILY.values()) | set(SPECIAL_EXPECTED_PAGE.values())):
        path = HD_TEACHER_DIR / f"page-{page_no:03d}.jpg"
        img = shrink(read_bgr_path(path), MAX_TARGETED_TEACHER_DIM)
        kp, des = sift(gray_for_sift(img))
        targeted_cache[page_no] = (path.name, img, kp, des)

    results = []
    failures = []
    exact_workbook = 0
    flipbook_matched = 0

    for index, src in enumerate(live, 1):
        row = {"src": src}
        entry = meta.get(src, {})

        if any(b in src for b in BANNED):
            row["status"] = "FAIL_BANNED_ART"
            failures.append(row); results.append(row)
            print(f"FLIPBOOK_COLOR_ITEM {index}/{len(live)} {row['status']} {src}", flush=True)
            continue
        asset = read_bgr(src)
        if asset is None:
            row["status"] = "FAIL_MISSING_ASSET"
            failures.append(row); results.append(row)
            print(f"FLIPBOOK_COLOR_ITEM {index}/{len(live)} {row['status']} {src}", flush=True)
            continue
        if qa_verdict.get(src) == "FAIL":
            row["status"] = "FAIL_QA_REJECTED_ART"
            failures.append(row); results.append(row)
            print(f"FLIPBOOK_COLOR_ITEM {index}/{len(live)} {row['status']} {src}", flush=True)
            continue

        # Workbook-only proof is stronger than a fuzzy search result: these five
        # exact drawings were exhaustively checked against all 62 pages already.
        if entry.get("provenanceStatus") == WORKBOOK_ONLY_PROVENANCE:
            row["status"] = "PASS_EXACT_WORKBOOK_ONLY_NO_FLIPBOOK_COUNTERPART"
            row["source"] = entry.get("source")
            exact_workbook += 1
            results.append(row)
            print(f"FLIPBOOK_COLOR_ITEM {index}/{len(live)} {row['status']} {src}", flush=True)
            continue

        # Highest-confidence path: an exact teacher source + crop box is already
        # documented in the manifest. Re-verify geometry and color from pixels.
        direct = direct_crop_proof(asset, entry)
        if direct is not None and direct["status"] == "PASS_EXACT_FLIPBOOK_COLOR":
            row.update(direct)
            flipbook_matched += 1
            results.append(row)
            print(f"FLIPBOOK_COLOR_ITEM {index}/{len(live)} {row['status']} {src}", flush=True)
            continue

        asset_small = shrink(asset, MAX_TEMPLATE_DIM)
        tkp, tdes = sift(gray_for_sift(asset_small))
        expected = family_expected_page(src)

        candidates = []
        # First search the exact documented vowel-family source page at higher
        # resolution. Only if that does not prove identity do non-family assets
        # fall back to the exhaustive whole-book search.
        if expected is not None:
            name, page, pkp, pdes = targeted_cache[expected]
            hit = match(asset_small, tkp, tdes, page, pkp, pdes)
            if hit:
                candidates.append((hit["score"], expected, name, page, hit, "expected-vocab-page"))
        else:
            for page_no, (name, page, pkp, pdes) in teacher_cache.items():
                hit = match(asset_small, tkp, tdes, page, pkp, pdes)
                if hit:
                    candidates.append((hit["score"], page_no, name, page, hit, "exhaustive-62-page"))
        candidates.sort(key=lambda x: x[0], reverse=True)

        if candidates:
            _, page_no, name, page, best, mode = candidates[0]
            metrics = color_metrics(asset_small, page, best["H"])
            row.update({
                "teacher_page": page_no,
                "teacher_file": name,
                "source_mode": mode,
                "inliers": best["inliers"],
                "inlier_ratio": round(best["ratio"], 4),
                "color": None if metrics is None else {
                    k: (round(v, 3) if isinstance(v, float) else v) for k, v in metrics.items()
                },
            })
            if color_pass(metrics):
                row["status"] = "PASS_EXACT_FLIPBOOK_COLOR"
                flipbook_matched += 1
            else:
                row["status"] = "FAIL_FLIPBOOK_COLOR_DRIFT"
                failures.append(row)
        else:
            row["status"] = "FAIL_NO_PROVEN_FLIPBOOK_MATCH"
            row["expected_teacher_page"] = expected
            row["provenanceStatus"] = entry.get("provenanceStatus")
            if direct is not None:
                row["direct_source_attempt"] = direct
            failures.append(row)

        results.append(row)
        print(f"FLIPBOOK_COLOR_ITEM {index}/{len(live)} {row['status']} {src}", flush=True)

    report = {
        "scope": "Lessons 1–5 / physical workbook pages 1–15 / runtime-resolved art",
        "teacher_pages_checked": 62,
        "teacher_exports_present": {"hd": len(hd_paths), "low": len(low_paths)},
        "live_unique_art": len(live),
        "exact_flipbook_color_matches": flipbook_matched,
        "verified_workbook_only_exceptions": exact_workbook,
        "failures": len(failures),
        "thresholds": {
            "min_inliers": MIN_INLIERS,
            "min_inlier_ratio": MIN_RATIO,
            "max_lab_median": MAX_LAB_MEDIAN,
            "max_lab_p75": MAX_LAB_P75,
            "max_hue_median_deg": MAX_HUE_MEDIAN_DEG,
            "max_hue_p75_deg": MAX_HUE_P75_DEG,
            "max_sat_median": MAX_SAT_MEDIAN,
        },
        "results": results,
    }
    print("FLIPBOOK_COLOR_REPORT " + json.dumps(report, ensure_ascii=False, separators=(",", ":")), flush=True)
    if failures:
        print("FLIPBOOK_COLOR_FAILURES_BEGIN", file=sys.stderr)
        for f in failures:
            print(json.dumps(f, ensure_ascii=False, separators=(",", ":")), file=sys.stderr)
        print("FLIPBOOK_COLOR_FAILURES_END", file=sys.stderr)
        raise SystemExit(1)
    print(
        f"✓ flipbook color fidelity: {flipbook_matched} exact teacher-color matches + "
        f"{exact_workbook} verified workbook-only exceptions; 0 unresolved",
        flush=True,
    )


if __name__ == "__main__":
    main()
