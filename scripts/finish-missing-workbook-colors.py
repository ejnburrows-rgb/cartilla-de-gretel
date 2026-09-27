"""Transfer color from reviewed page references into the original Workbook art.

Generated pages are used only as color references. The locked deterministic
master supplies every final pixel outside the 50 verified target boxes and
every original line inside them.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import cv2
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
PLAN = ROOT / "src/data/reconstruction/reconstruction-plan.json"
REFERENCES = ROOT / "src/data/reconstruction/color-references"
DETERMINISTIC = ROOT / "public/cartilla/art/reconstructed/workbook-deterministic"
FINAL = ROOT / "public/cartilla/art/reconstructed/workbook"
MANIFEST = ROOT / "src/data/reconstruction/color-finishing-manifest.json"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def align_reference(reference: np.ndarray, original: np.ndarray) -> tuple[np.ndarray, int]:
    height, width = original.shape[:2]
    small_width = 1104
    small_height = round(height * small_width / width)
    small_original = cv2.resize(original, (small_width, small_height))
    sift = cv2.SIFT_create(nfeatures=5000)
    source_keypoints, source_descriptors = sift.detectAndCompute(
        cv2.cvtColor(reference, cv2.COLOR_BGR2GRAY), None
    )
    target_keypoints, target_descriptors = sift.detectAndCompute(
        cv2.cvtColor(small_original, cv2.COLOR_BGR2GRAY), None
    )
    if source_descriptors is None or target_descriptors is None:
        raise ValueError("Could not align color reference")
    matches = cv2.FlannBasedMatcher(
        dict(algorithm=1, trees=5), dict(checks=50)
    ).knnMatch(source_descriptors, target_descriptors, k=2)
    good = [first for first, second in matches if first.distance < 0.75 * second.distance]
    if len(good) < 40:
        raise ValueError(f"Insufficient color reference matches: {len(good)}")
    source_points = np.float32(
        [source_keypoints[m.queryIdx].pt for m in good]
    ).reshape(-1, 1, 2)
    target_points = np.float32(
        [target_keypoints[m.trainIdx].pt for m in good]
    ).reshape(-1, 1, 2)
    homography, inliers = cv2.findHomography(
        source_points, target_points, cv2.RANSAC, 4
    )
    if homography is None or inliers is None or int(inliers.sum()) < 30:
        raise ValueError("Color reference alignment failed")
    scale = np.diag([width / small_width, height / small_height, 1.0])
    aligned = cv2.warpPerspective(reference, scale @ homography, (width, height))
    return aligned, int(inliers.sum())


def target_box(item: dict, width: int, height: int) -> tuple[int, int, int, int]:
    box = item["workbook_box_norm"]
    return (
        round(box["x"] * width),
        round(box["y"] * height),
        round((box["x"] + box["width"]) * width),
        round((box["y"] + box["height"]) * height),
    )


def transfer_crop(original: np.ndarray, reference: np.ndarray, object_name: str) -> tuple[np.ndarray, int]:
    original_hsv = cv2.cvtColor(original, cv2.COLOR_BGR2HSV)
    reference_hsv = cv2.cvtColor(reference, cv2.COLOR_BGR2HSV)
    original_gray = cv2.cvtColor(original, cv2.COLOR_BGR2GRAY)

    # The original drawing defines the editable subject. Teal grid and any
    # already colored pixels are excluded by the saturation threshold.
    marks = ((original_gray < 220) & (original_hsv[:, :, 1] < 55)).astype(np.uint8) * 255
    marks = cv2.morphologyEx(marks, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    contours, _ = cv2.findContours(marks, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    subject = np.zeros_like(marks)
    for contour in contours:
        if cv2.contourArea(contour) > 35:
            cv2.drawContours(subject, [contour], -1, 255, -1)
    subject = cv2.dilate(subject, np.ones((3, 3), np.uint8))

    original_lab = cv2.cvtColor(original, cv2.COLOR_BGR2LAB)
    reference_lab = cv2.cvtColor(reference, cv2.COLOR_BGR2LAB)
    mask = (
        (subject > 0)
        & (reference_hsv[:, :, 1] > 32)
        & (reference_hsv[:, :, 2] > 70)
        & (original_hsv[:, :, 1] < 80)
        & (original_lab[:, :, 0] > 80)
    )
    result_lab = original_lab.copy()
    result_lab[:, :, 1][mask] = reference_lab[:, :, 1][mask]
    result_lab[:, :, 2][mask] = reference_lab[:, :, 2][mask]
    result_lab[:, :, 0][mask] = np.minimum(
        original_lab[:, :, 0][mask],
        (0.85 * reference_lab[:, :, 0][mask] + 0.15 * original_lab[:, :, 0][mask]).astype(np.uint8),
    )
    result = original.copy()
    recolored = cv2.cvtColor(result_lab, cv2.COLOR_LAB2BGR)
    result[mask] = recolored[mask]
    # These are printed symbols/lines, not filled illustrations. Use the
    # verified deep-blue artwork palette on the existing ink pixels only.
    if object_name in {"igual", "aguja"}:
        ink = (original_gray < 220) & (original_hsv[:, :, 1] < 55)
        tone = np.clip(original_gray.astype(np.float32) / 255.0, 0, 1)
        blue = (110, 52, 22) if object_name == "igual" else (130, 91, 48)
        for channel, base in enumerate(blue):
            result[:, :, channel][ink] = np.clip(
                base * (0.65 + 0.35 * tone[ink]), 0, 255
            ).astype(np.uint8)
    return result, int(mask.sum())


def main() -> None:
    plan = json.loads(PLAN.read_text(encoding="utf-8"))
    grouped: dict[int, list[dict]] = {}
    for item in plan["items"]:
        if item["strategy"] == "NO_VALID_COUNTERPART":
            grouped.setdefault(item["printed_page"], []).append(item)

    manifest = {
        "version": "2026-09-27",
        "status": "REVIEW_CANDIDATE",
        "method": "AI color reference aligned to locked deterministic master; color transferred only inside original object shapes",
        "pages": [],
    }
    for page_number, items in sorted(grouped.items()):
        page_name = f"page-{page_number:03}.png"
        source_path = DETERMINISTIC / page_name
        reference_path = REFERENCES / page_name
        output_path = FINAL / page_name
        original = cv2.imread(str(source_path), cv2.IMREAD_COLOR)
        reference = cv2.imread(str(reference_path), cv2.IMREAD_COLOR)
        if original is None or reference is None:
            raise FileNotFoundError(page_name)
        aligned, inliers = align_reference(reference, original)
        result = original.copy()
        editable = np.zeros(original.shape[:2], dtype=np.uint8)
        records = []
        for item in items:
            left, top, right, bottom = target_box(item, original.shape[1], original.shape[0])
            crop, colored_pixels = transfer_crop(
                original[top:bottom, left:right], aligned[top:bottom, left:right], item["object_name"]
            )
            result[top:bottom, left:right] = crop
            editable[top:bottom, left:right] = 1
            records.append(
                {
                    "id": item["id"],
                    "object_name": item["object_name"],
                    "workbook_box_norm": item["workbook_box_norm"],
                    "colored_pixels": colored_pixels,
                }
            )
        outside_changed = int(np.count_nonzero(np.any(result != original, axis=2) & (editable == 0)))
        if outside_changed:
            raise ValueError(f"Page {page_number}: {outside_changed} pixels changed outside target boxes")
        cv2.imwrite(str(output_path), result)
        manifest["pages"].append(
            {
                "printed_page": page_number,
                "source_path": f"/cartilla/art/reconstructed/workbook-deterministic/{page_name}",
                "source_sha256": sha(source_path),
                "reference_path": f"src/data/reconstruction/color-references/{page_name}",
                "reference_sha256": sha(reference_path),
                "output_path": f"/cartilla/art/reconstructed/workbook/{page_name}",
                "output_sha256": sha(output_path),
                "reference_alignment_inliers": inliers,
                "changed_pixels_outside_targets": outside_changed,
                "objects": records,
            }
        )
        print(page_number, inliers, ", ".join(f"{r['object_name']}:{r['colored_pixels']}" for r in records))
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
