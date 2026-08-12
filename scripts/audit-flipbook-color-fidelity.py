#!/usr/bin/env python3
"""Strict Lessons 1–5 teacher-flipchart color fidelity audit.

For every visible illustration used by physical workbook pages 1–15:
- search all 62 teacher flipchart pages for the identical drawing;
- when found, geometrically align the authentic teacher source to the live crop
  and compare actual color pixels;
- when no identical teacher drawing exists, accept only the explicitly audited
  exact student-workbook crop;
- fail generated/remastered art, missing files, unproven source, and material
  color drift.

This is intentionally stricter than the ordinary "is it colored" validator.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

try:
    import cv2
    import numpy as np
except Exception as exc:
    raise SystemExit(f"FLIPBOOK_COLOR_AUDIT_DEPENDENCY_ERROR: {exc}")

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
TEACHER_DIR = PUBLIC / "cartilla/images/teacher-flipchart"
LAYOUTS = ROOT / "src/data/page-layouts.json"
MANIFEST = PUBLIC / "cartilla/art/faithful/manifest.json"

PAGES = set(range(1, 16))  # Lessons 1–5
BANNED = (
    "/cartilla/art/color/generated/",
    "/cartilla/art/color/workbook/",
    "/cartilla/art/generated/",
    "/cartilla/art/remastered/",
)
WORKBOOK_ONLY_PROVENANCE = "VERIFIED-EXACT-WORKBOOK-CROP-2026-08-08"

# Match on scaled copies for speed; SIFT is scale invariant and the color check
# is performed on the same aligned scaled copies, so this does not loosen the
# source comparison.
MAX_TEACHER_DIM = 1600
MAX_TEMPLATE_DIM = 700
MIN_INLIERS = 8
MIN_RATIO = 0.50
MIN_SCORE = 5.5
MAX_LAB_MEDIAN = 22.0
MAX_LAB_P90 = 48.0
MAX_HUE_MEDIAN_DEG = 14.0
MAX_SAT_MEDIAN = 42.0
MIN_COLOR_PIXELS = 80


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def collect_page_srcs():
    raw = load_json(LAYOUTS).get("pages", {})
    found: set[str] = set()

    def add(src):
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
    return cv2.resize(img, (max(1, round(w * scale)), max(1, round(h * scale))), interpolation=cv2.INTER_AREA)


def gray_for_sift(bgr):
    return cv2.equalizeHist(cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY))


def sift(gray):
    detector = cv2.SIFT_create(nfeatures=1800, contrastThreshold=0.018, edgeThreshold=12)
    return detector.detectAndCompute(gray, None)


def match(template, tkp, tdes, page, pkp, pdes):
    if tdes is None or pdes is None or len(tkp) < 4 or len(pkp) < 4:
        return None
    # KD-tree FLANN is substantially faster than exhaustive L2 for the 62-page
    # census while preserving SIFT descriptor semantics.
    matcher = cv2.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=48))
    pairs = matcher.knnMatch(tdes.astype(np.float32), pdes.astype(np.float32), k=2)
    good = [m for pair in pairs if len(pair) == 2 for m, n in [pair] if m.distance < 0.70 * n.distance]
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
    if not np.isfinite(projected).all() or abs(cv2.contourArea(projected.astype(np.float32))) < 300:
        return None
    return {"H": H, "inliers": inliers, "ratio": ratio, "score": score}


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
    mask = (src_hsv[:, :, 1] >= 24) & (src_hsv[:, :, 2] >= 35) & (src_hsv[:, :, 2] <= 248)
    mask &= cv2.cvtColor(template_bgr, cv2.COLOR_BGR2GRAY) < 250
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
    sat = np.abs(live_hsv[:, :, 1].astype(np.int16) - src_hsv[:, :, 1].astype(np.int16))[mask]
    return {
        "color_pixels": count,
        "lab_median": float(np.median(delta)),
        "lab_p90": float(np.percentile(delta, 90)),
        "hue_median_deg": float(np.median(hd[mask])),
        "sat_median": float(np.median(sat)),
    }


def color_pass(m):
    return bool(
        m
        and not m.get("insufficient_color")
        and m["lab_median"] <= MAX_LAB_MEDIAN
        and m["lab_p90"] <= MAX_LAB_P90
        and m["hue_median_deg"] <= MAX_HUE_MEDIAN_DEG
        and m["sat_median"] <= MAX_SAT_MEDIAN
    )


def main():
    teacher_paths = sorted(TEACHER_DIR.glob("teacher-page-*.jpg"))
    if len(teacher_paths) != 62:
        raise SystemExit(f"FLIPBOOK_COLOR_AUDIT_FAIL expected 62 teacher pages, found {len(teacher_paths)}")

    manifest = load_json(MANIFEST)
    meta = {e.get("src"): e for e in manifest if e.get("src")}
    live = collect_page_srcs()
    print(f"FLIPBOOK_COLOR_AUDIT_START live_unique_art={len(live)} teacher_pages=62", flush=True)

    teacher_cache = []
    for idx, path in enumerate(teacher_paths, 1):
        img = read_bgr_path(path)
        if img is None:
            raise SystemExit(f"FLIPBOOK_COLOR_AUDIT_FAIL unreadable teacher page {path.name}")
        img = shrink(img, MAX_TEACHER_DIM)
        kp, des = sift(gray_for_sift(img))
        teacher_cache.append((path.name, img, kp, des))
        if idx % 10 == 0 or idx == 62:
            print(f"FLIPBOOK_COLOR_TEACHER_INDEX {idx}/62", flush=True)

    results = []
    failures = []
    exact_workbook = 0
    flipbook_matched = 0

    for index, src in enumerate(live, 1):
        row = {"src": src}
        if any(b in src for b in BANNED):
            row["status"] = "FAIL_BANNED_ART"
            failures.append(row)
            results.append(row)
            print(f"FLIPBOOK_COLOR_ITEM {index}/{len(live)} {row['status']} {src}", flush=True)
            continue
        asset = read_bgr(src)
        if asset is None:
            row["status"] = "FAIL_MISSING_ASSET"
            failures.append(row)
            results.append(row)
            print(f"FLIPBOOK_COLOR_ITEM {index}/{len(live)} {row['status']} {src}", flush=True)
            continue
        asset = shrink(asset, MAX_TEMPLATE_DIM)
        entry = meta.get(src, {})
        tkp, tdes = sift(gray_for_sift(asset))
        candidates = []
        for name, page, pkp, pdes in teacher_cache:
            hit = match(asset, tkp, tdes, page, pkp, pdes)
            if hit:
                candidates.append((hit["score"], name, page, hit))
        candidates.sort(key=lambda x: x[0], reverse=True)

        if candidates:
            _, name, page, best = candidates[0]
            metrics = color_metrics(asset, page, best["H"])
            row.update({
                "teacher_page": name,
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
        elif entry.get("provenanceStatus") == WORKBOOK_ONLY_PROVENANCE:
            row["status"] = "PASS_EXACT_WORKBOOK_ONLY_NO_FLIPBOOK_COUNTERPART"
            exact_workbook += 1
        else:
            row["status"] = "FAIL_NO_PROVEN_FLIPBOOK_MATCH"
            row["provenanceStatus"] = entry.get("provenanceStatus")
            failures.append(row)
        results.append(row)
        print(f"FLIPBOOK_COLOR_ITEM {index}/{len(live)} {row['status']} {src}", flush=True)

    report = {
        "scope": "Lessons 1–5 / physical workbook pages 1–15",
        "teacher_pages_checked": 62,
        "live_unique_art": len(live),
        "exact_flipbook_color_matches": flipbook_matched,
        "verified_workbook_only_exceptions": exact_workbook,
        "failures": len(failures),
        "thresholds": {
            "min_inliers": MIN_INLIERS,
            "min_inlier_ratio": MIN_RATIO,
            "max_lab_median": MAX_LAB_MEDIAN,
            "max_lab_p90": MAX_LAB_P90,
            "max_hue_median_deg": MAX_HUE_MEDIAN_DEG,
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
