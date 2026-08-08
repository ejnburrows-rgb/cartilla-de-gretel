#!/usr/bin/env python3
"""Locate existing workbook illustrations inside the 62-page teacher flipchart.

This is a one-time repair/audit tool. It does NOT alter workbook pages or artwork.
It uses SIFT feature matching so identical line art can be found even when the
workbook copy is grayscale/poorly colored and the teacher copy is full color.

Outputs under audit/authentic-art/: report.json, report.md, and candidate crops.
"""
from __future__ import annotations

import json
import math
import os
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
TEACHER_DIR = ROOT / "public/cartilla/images/teacher-flipchart"
OUT = ROOT / "audit/authentic-art"

TARGETS = {
    "abeja": ROOT / "public/cartilla/art/faithful/vocal-a/abeja.webp",
    "aguja": ROOT / "public/cartilla/art/faithful/vocal-a/aguja.webp",
    "abrigo": ROOT / "public/cartilla/art/faithful/leccion-1/abrigo.webp",
    "remolino": ROOT / "public/cartilla/art/faithful/leccion-1/remolino.webp",
    "globo": ROOT / "public/cartilla/art/faithful/leccion-1/globo.webp",
    "oruga": ROOT / "public/cartilla/art/faithful/vocal-o/oruga.webp",
    "iglu": ROOT / "public/cartilla/art/faithful/vocal-i/iglu.webp",
}

# Use the original student-workbook drawings as the matching templates.
+# App physical pages are offset by two front-matter scans in the restored
+# workbook set (for example, printed page 1 is restored page-003.png).
+# These boxes are tight cell interiors and deliberately exclude instructions,
+# answer words, and neighboring pictures.
+KNOWN_WORKBOOK_TEMPLATES = {
+    "abrigo": {
+        "source": ROOT / "public/cartilla/art/restored/workbook/page-003.png",
+        "box": (230, 800, 440, 520),
+        "student_page": 1,
+    },
+    "abeja": {
+        "source": ROOT / "public/cartilla/art/restored/workbook/page-009.png",
+        "box": (720, 1420, 580, 560),
+        "student_page": 7,
+    },
+    "globo": {
+        "source": ROOT / "public/cartilla/art/restored/workbook/page-004.png",
+        "box": (1740, 2985, 580, 515),
+        "student_page": 2,
+    },
+    "oruga": {
+        "source": ROOT / "public/cartilla/art/restored/workbook/page-009.png",
+        "box": (720, 800, 580, 570),
+        "student_page": 7,
+    },
+    "aguja": {
+        "source": ROOT / "public/cartilla/art/restored/workbook/page-009.png",
+        "box": (1350, 2650, 575, 590),
+        "student_page": 7,
+    },
+    "remolino": {
+        "source": ROOT / "public/cartilla/art/restored/workbook/page-009.png",
+        "box": (1350, 800, 575, 570),
+        "student_page": 7,
+    },
+}


def load_gray(path: Path) -> np.ndarray | None:
    img = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
    if img is None:
        return None
    if img.ndim == 2:
        return img
    if img.shape[2] == 4:
        bgr = img[:, :, :3]
        alpha = img[:, :, 3]
        # Put transparent areas on white so alpha edges do not dominate SIFT.
        white = np.full_like(bgr, 255)
        a = (alpha.astype(np.float32) / 255.0)[:, :, None]
        bgr = (bgr * a + white * (1.0 - a)).astype(np.uint8)
        return cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    return cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2GRAY)


def trim_white(gray: np.ndarray, threshold: int = 247) -> np.ndarray:
    mask = gray < threshold
    ys, xs = np.where(mask)
    if len(xs) < 20:
        return gray
    x0, x1 = max(0, xs.min() - 6), min(gray.shape[1], xs.max() + 7)
    y0, y1 = max(0, ys.min() - 6), min(gray.shape[0], ys.max() + 7)
    return gray[y0:y1, x0:x1]


def template_for(slug: str, fallback: Path) -> tuple[np.ndarray | None, str]:
    known = KNOWN_WORKBOOK_TEMPLATES.get(slug)
    if known and known["source"].exists():
        img = load_gray(known["source"])
        if img is not None:
            x, y, w, h = known["box"]
            if x >= 0 and y >= 0 and x + w <= img.shape[1] and y + h <= img.shape[0]:
                return trim_white(img[y:y+h, x:x+w]), str(known["source"].relative_to(ROOT))
    img = load_gray(fallback)
    return (trim_white(img) if img is not None else None), str(fallback.relative_to(ROOT))


def sift_data(gray: np.ndarray):
    # Mild contrast normalization helps grayscale-vs-color line-art matching.
    eq = cv2.equalizeHist(gray)
    sift = cv2.SIFT_create(nfeatures=3500, contrastThreshold=0.02, edgeThreshold=12)
    kp, des = sift.detectAndCompute(eq, None)
    return kp, des


def match_one(template: np.ndarray, template_kp, template_des, page_gray: np.ndarray, page_kp, page_des):
    if template_des is None or page_des is None or len(template_kp) < 4 or len(page_kp) < 4:
        return None
    matcher = cv2.BFMatcher(cv2.NORM_L2)
    pairs = matcher.knnMatch(template_des, page_des, k=2)
    good = [m for m, n in pairs if m.distance < 0.72 * n.distance]
    if len(good) < 5:
        return None

    src = np.float32([template_kp[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([page_kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    H, mask = cv2.findHomography(src, dst, cv2.RANSAC, 6.0)
    if H is None or mask is None:
        return None
    inliers = int(mask.ravel().sum())
    if inliers < 4:
        return None

    h, w = template.shape[:2]
    corners = np.float32([[[0, 0]], [[w, 0]], [[w, h]], [[0, h]]])
    projected = cv2.perspectiveTransform(corners, H).reshape(-1, 2)
    if not np.isfinite(projected).all():
        return None

    x0, y0 = projected.min(axis=0)
    x1, y1 = projected.max(axis=0)
    pw, ph = page_gray.shape[1], page_gray.shape[0]
    bw, bh = x1 - x0, y1 - y0
    if bw < 25 or bh < 25 or bw > pw * 0.8 or bh > ph * 0.8:
        return None
    if x1 < 0 or y1 < 0 or x0 > pw or y0 > ph:
        return None

    inlier_ratio = inliers / max(1, len(good))
    # Reward geometrically consistent matches; a few accidental features should lose.
    score = inliers * (0.55 + 0.45 * inlier_ratio)
    return {
        "good_matches": len(good),
        "inliers": inliers,
        "inlier_ratio": round(inlier_ratio, 4),
        "score": round(float(score), 3),
        "box": [int(round(x0)), int(round(y0)), int(round(bw)), int(round(bh))],
        "corners": [[round(float(x), 1), round(float(y), 1)] for x, y in projected],
    }


def save_candidate(slug: str, rank: int, page_path: Path, box: list[int]) -> str | None:
    img = cv2.imread(str(page_path), cv2.IMREAD_COLOR)
    if img is None:
        return None
    x, y, w, h = box
    pad_x = max(18, int(w * 0.12))
    pad_y = max(18, int(h * 0.12))
    x0, y0 = max(0, x - pad_x), max(0, y - pad_y)
    x1, y1 = min(img.shape[1], x + w + pad_x), min(img.shape[0], y + h + pad_y)
    if x1 <= x0 or y1 <= y0:
        return None
    crop = img[y0:y1, x0:x1]
    out_name = f"{slug}--rank-{rank}--{page_path.stem}.jpg"
    cv2.imwrite(str(OUT / out_name), crop, [int(cv2.IMWRITE_JPEG_QUALITY), 94])
    return out_name


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    pages = sorted(TEACHER_DIR.glob("teacher-page-*.jpg"))
    if len(pages) != 62:
        raise SystemExit(f"Expected 62 teacher pages; found {len(pages)}")

    # Compute page features once, then reuse for all targets.
    page_cache = []
    for page in pages:
        gray = load_gray(page)
        if gray is None:
            continue
        kp, des = sift_data(gray)
        page_cache.append((page, gray, kp, des))

    report = {
        "teacherPageCount": len(pages),
        "method": "SIFT + Lowe ratio + RANSAC homography; audit only, no app mutation",
        "targets": {},
    }

    for slug, fallback in TARGETS.items():
        template, template_source = template_for(slug, fallback)
        if template is None:
            report["targets"][slug] = {"status": "template-missing", "template": template_source, "candidates": []}
            continue
        tkp, tdes = sift_data(template)
        candidates = []
        for page, gray, pkp, pdes in page_cache:
            found = match_one(template, tkp, tdes, gray, pkp, pdes)
            if found:
                found["teacher_page"] = page.name
                candidates.append(found)
        candidates.sort(key=lambda c: (c["score"], c["inliers"], c["good_matches"]), reverse=True)
        candidates = candidates[:5]
        for rank, c in enumerate(candidates, 1):
            c["candidate_crop"] = save_candidate(slug, rank, TEACHER_DIR / c["teacher_page"], c["box"])

        if candidates and candidates[0]["inliers"] >= 7 and candidates[0]["inlier_ratio"] >= 0.45:
            status = "strong-candidate"
        elif candidates:
            status = "needs-visual-check"
        else:
            status = "no-machine-match"
        report["targets"][slug] = {
            "status": status,
            "template": template_source,
            "templateSize": [int(template.shape[1]), int(template.shape[0])],
            "templateKeypoints": len(tkp),
            "candidates": candidates,
        }

    (OUT / "report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    lines = [
        "# Authentic teacher-flipchart art audit",
        "",
        f"Teacher pages checked: **{len(pages)} / 62**",
        "",
        "This report only locates candidates. It does not alter the workbook, generated art, or page layouts.",
        "",
        "| Target | Status | Best teacher page | Inliers | Ratio | Candidate crop |",
        "|---|---|---:|---:|---:|---|",
    ]
    for slug, data in report["targets"].items():
        best = data.get("candidates", [{}])[0] if data.get("candidates") else {}
        crop = best.get("candidate_crop") or ""
        crop_link = f"[{crop}]({crop})" if crop else ""
        lines.append(
            f"| {slug} | {data['status']} | {best.get('teacher_page','')} | "
            f"{best.get('inliers','')} | {best.get('inlier_ratio','')} | {crop_link} |"
        )
    (OUT / "report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
