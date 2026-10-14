"""Measure the printed syllable crescent ("moon") on each consonant sheet.

The crescent is a lens-shaped colour field beside the letter medallion.
For each sheet with a sampled crescent colour (flipchart-source-colors.json)
this masks that colour on the HD scan, takes the outer edge (rightmost
pixel per row) and the inner edge (where the colour ends going left), and
fits a circle to each. Output: src/data/flipchart-crescents.json
  { page: { "outer": [cx, cy, R], "inner": [cx, cy, r], "tips": [[x, y], [x, y]] } }
in sheet units (1000 = sheet width).
"""
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
COLORS = json.loads((ROOT / "src/data/flipchart-source-colors.json").read_text())["pages"]
WORK = 1000


def hex_rgb(value):
    value = value.lstrip("#")
    return np.array([int(value[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32)


def fit_circle(points):
    """Algebraic least-squares circle, then two rounds trimming outliers."""
    pts = np.asarray(points, dtype=np.float64)
    for _ in range(3):
        x, y = pts[:, 0], pts[:, 1]
        a = np.c_[2 * x, 2 * y, np.ones(len(pts))]
        b = x ** 2 + y ** 2
        (cx, cy, c), *_ = np.linalg.lstsq(a, b, rcond=None)
        r = np.sqrt(c + cx ** 2 + cy ** 2)
        resid = np.abs(np.hypot(x - cx, y - cy) - r)
        keep = resid <= np.quantile(resid, 0.8)
        if keep.sum() < 12:
            break
        pts = pts[keep]
    return float(cx), float(cy), float(r), float(np.median(resid))


def ransac_circle(points, tol=2.5, rounds=1500, seed=7, rmin=80, rmax=3000):
    """Circle through most edge points (printed syllables and art that touch
    the edge are outliers), refined by least squares on the inliers."""
    pts = np.asarray(points, dtype=np.float64)
    rng = np.random.default_rng(seed)
    best = None
    for _ in range(rounds):
        a, b, c = pts[rng.choice(len(pts), 3, replace=False)]
        d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]))
        if abs(d) < 1e-6:
            continue
        ux = ((a @ a) * (b[1] - c[1]) + (b @ b) * (c[1] - a[1]) + (c @ c) * (a[1] - b[1])) / d
        uy = ((a @ a) * (c[0] - b[0]) + (b @ b) * (a[0] - c[0]) + (c @ c) * (b[0] - a[0])) / d
        r = np.hypot(a[0] - ux, a[1] - uy)
        if not rmin < r < rmax:
            continue
        inl = np.abs(np.hypot(pts[:, 0] - ux, pts[:, 1] - uy) - r) < tol
        if best is None or inl.sum() > best.sum():
            best = inl
    cx, cy, r, err = fit_circle(pts[best]) if best is not None and best.sum() >= 12 else fit_circle(pts)
    return cx, cy, r, err


def circle_through(a, b, points):
    """Circle through both tips (a, b) that best follows an edge: one free
    parameter (the centre's offset along the chord's bisector), chosen by
    the median distance to the edge points, so printed syllables touching the
    edge don't pull it."""
    pts = np.asarray(points, dtype=np.float64)
    ax, ay = a
    bx, by = b
    mx, my = (ax + bx) / 2, (ay + by) / 2
    dx, dy = bx - ax, by - ay
    half = np.hypot(dx, dy) / 2
    nx, ny = dy / (2 * half), -dx / (2 * half)  # unit normal to the chord
    best = (np.inf, None, None)
    for s in np.linspace(-3000, 3000, 6001):
        cx, cy = mx + s * nx, my + s * ny
        r = np.hypot(half, s)
        err = np.median(np.abs(np.hypot(pts[:, 0] - cx, pts[:, 1] - cy) - r))
        if err < best[0]:
            best = (err, (float(cx), float(cy)), float(r))
    return best[1], best[2], float(best[0])


def circle_through(a, b, points):
    """Circle through both tips (a, b) that best follows an edge: one free
    parameter (the centre's offset along the chord's bisector), chosen by
    the median distance to the edge points, so printed syllables touching the
    edge don't pull it."""
    pts = np.asarray(points, dtype=np.float64)
    ax, ay = a
    bx, by = b
    mx, my = (ax + bx) / 2, (ay + by) / 2
    dx, dy = bx - ax, by - ay
    half = np.hypot(dx, dy) / 2
    nx, ny = dy / (2 * half), -dx / (2 * half)  # unit normal to the chord
    best = (np.inf, None, None)
    for s in np.linspace(-3000, 3000, 3001):
        cx, cy = mx + s * nx, my + s * ny
        r = np.hypot(half, s)
        err = np.median(np.abs(np.hypot(pts[:, 0] - cx, pts[:, 1] - cy) - r))
        if err < best[0]:
            best = (err, (float(cx), float(cy)), float(r))
    return best[1], best[2], float(best[0])


def main():
    out = {}
    for page, info in sorted(COLORS.items(), key=lambda kv: int(kv[0])):
        if "crescentLight" not in info:
            continue
        scan = cv2.imread(str(ROOT / f"public/cartilla/art/hd/flipchart/page-{int(page):03d}.jpg"))
        k = WORK / scan.shape[1]
        img = cv2.resize(scan, (WORK, round(scan.shape[0] * k)), interpolation=cv2.INTER_AREA)
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32)
        light, edge = hex_rgb(info["crescentLight"]), hex_rgb(info["crescentEdge"])
        # Distance to the light→edge colour ramp.
        d = edge - light
        t = np.clip(((rgb - light) @ d) / max(1.0, float(d @ d)), 0, 1)
        dist = np.linalg.norm(rgb - (light + t[..., None] * d), axis=2)
        mask = (dist < 34) & (rgb.sum(axis=2) < 715)
        h = int(0.45 * img.shape[0])
        mask[h:, :] = False
        mask[:, :420] = False
        mask = cv2.morphologyEx(mask.astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
        n, labels, stats, _ = cv2.connectedComponentsWithStats(mask)
        if n < 2:
            print(page, "no crescent mask")
            continue
        # The crescent: the component reaching furthest right among big ones.
        big = [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] > 3000]
        if not big:
            print(page, "no big component")
            continue
        comp = max(big, key=lambda i: stats[i, cv2.CC_STAT_LEFT] + stats[i, cv2.CC_STAT_WIDTH])
        m = (labels == comp).astype(np.uint8)
        # Fill the holes the printed syllables leave in the colour field.
        flood = m.copy()
        pad = np.zeros((m.shape[0] + 2, m.shape[1] + 2), np.uint8)
        cv2.floodFill(flood, pad, (0, 0), 1)
        m = (m | (1 - flood)).astype(bool)
        outer, inner = [], []
        for y in range(m.shape[0]):
            xs = np.flatnonzero(m[y])
            if len(xs) < 4:
                continue
            right = xs[-1]
            x = right
            while x > 0 and m[y, x]:  # walk left to where the colour ends
                x -= 1
            if right < WORK - 8:  # the field can run off the sheet edge
                outer.append((right, y))
            if 30 <= right - x <= 230:  # a band, not the medallion's halo
                inner.append((x + 1, y))
        if len(outer) < 40:
            print(page, "too few rows")
            continue
        ofit = ransac_circle(outer, rmin=200, rmax=360)
        ifit = ransac_circle(inner, rmin=240, rmax=700) if len(inner) >= 30 else None
        # Printed moons are consistent: outer centre x 640-770, R 220-320;
        # inner centre x 380-560, r 280-460; about 143 thick at the middle.
        o_ok = 640 <= ofit[0] <= 770 and 220 <= ofit[2] <= 320
        i_ok = bool(ifit) and 380 <= ifit[0] <= 560 and 280 <= ifit[2] <= 460
        if o_ok and i_ok and not 110 <= (ofit[0] + ofit[2]) - (ifit[0] + ifit[2]) <= 180:
            i_ok = False
        source = "scan"
        if o_ok and not i_ok:
            r = 1.27 * ofit[2]
            ifit = (ofit[0] + ofit[2] - 143 - r, ofit[1], r, -1)
            source = "inner-typical"
        elif i_ok and not o_ok:
            R = ifit[2] / 1.27
            ofit = (ifit[0] + ifit[2] + 143 - R, ifit[1], R, -1)
            source = "outer-typical"
        elif not o_ok:
            print(page, "no reliable fit")
            continue
        ocx, ocy, R, oerr = ofit
        icx, icy, r, ierr = ifit
        thick = (ocx + R) - (icx + r)
        out[page] = {
            "outer": [round(ocx, 1), round(ocy, 1), round(R, 1)],
            "inner": [round(icx, 1), round(icy, 1), round(r, 1)],
            "source": source,
        }
        print(page, out[page], "err", round(oerr, 1), round(ierr, 1), "thick", round(thick))
    (ROOT / "src/data/flipchart-crescents.json").write_text(json.dumps(out, indent=1, sort_keys=True) + "\n")


if __name__ == "__main__":
    main()
