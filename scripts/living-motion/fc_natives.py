"""Teacher Flip Chart pictures (native sheets): natural part motion.

The Flip Chart native pictures below (public/cartilla/art/optimized/flipchart-native/)
contain, pixel for pixel, the same drawings as the owner-approved Workbook Page 1
pictures: the Page 1 stills are exact crops of them (SIFT + RANSAC fit: scale 1.000,
whole-pixel offsets, mean error <= 0.01 px). So each recipe is the approved Page 1
motion moved by that offset. Only the moving parts move; the sheet picture is
embedded byte-for-byte (original PNG), never redrawn or re-encoded.

Lámina 4 (Lección 2): oso, oveja, olla · Lámina 6 (Lección 4): elefante ·
Lámina 7 (Lección 5): imán.
"""
import base64, os
import numpy as np, cv2
from PIL import Image
from lib import Svg, load, soft_mask, grid, field_rotate, field_scale, lid_patch, add_blink
from build import STILLS, ROOT

# Page 1 still -> Flip Chart picture: x' = x + tx, y' = y + ty (measured, see above).
FITS = {
    'fc_p004_oso':      dict(tx=56, ty=44),
    'fc_p004_oveja':    dict(tx=52, ty=57),
    'fc_p004_olla':     dict(tx=53, ty=74),
    'fc_p006_elefante': dict(a=1.316565, b=0.020121, tx=15.407558, ty=15.219690),
    'fc_p007_iman':     dict(tx=52, ty=59),
}

class Fit:
    s = 1.0
    def __init__(self, name):
        self.a = 1; self.b = 0
        self.__dict__.update(FITS[name])
        self.s = float(np.hypot(self.a, self.b))
    def p(self, x, y): return (self.a*x - self.b*y + self.tx, self.b*x + self.a*y + self.ty)
    def poly(self, pts): return [self.p(x, y) for x, y in pts]
    def box(self, x0, y0, x1, y1):
        ax, ay = self.p(x0, y0); bx, by = self.p(x1, y1)
        return (min(ax, bx), min(ay, by), max(ax, bx), max(ay, by))
    def d(self, v): return v*self.s

class OriginalSvg(Svg):
    """Embeds the sheet picture's original bytes instead of a re-encoded copy."""
    def __init__(self, name, base, **kw):
        super().__init__(base, **kw)
        path = os.path.join(ROOT, STILLS[name]); ext = os.path.splitext(path)[1].lstrip('.').replace('jpg', 'jpeg')
        self.base_uri = f'data:image/{ext};base64,' + base64.b64encode(open(path, 'rb').read()).decode()
    def image(self, im, x, y, cls='', extra=''):
        if im is self.base:
            return f'<image class="{cls}" x="{x}" y="{y}" width="{im.width}" height="{im.height}" href="{self.base_uri}" {extra}/>'
        return super().image(im, x, y, cls, extra)

def ring_color(base, box, grow=0.35, exclude=None):
    """Median skin/fur colour just around an eye box (lid colour for the blink)."""
    a = np.array(base).astype(int); H, W = a.shape[:2]
    x0, y0, x1, y1 = box; gx, gy = (x1 - x0) * grow, (y1 - y0) * grow
    X0, Y0, X1, Y1 = int(max(0, x0 - gx)), int(max(0, y0 - gy)), int(min(W, x1 + gx)), int(min(H, y1 + gy))
    reg = a[Y0:Y1, X0:X1].reshape(-1, 4)
    inner = np.zeros((Y1 - Y0, X1 - X0), bool); inner[int(y0) - Y0:int(y1) - Y0, int(x0) - X0:int(x1) - X0] = True
    reg = reg[~inner.reshape(-1)]
    s = reg[:, :3].sum(1)
    keep = (reg[:, 3] > 200) & (s > 150) & (s < 700)
    if exclude is not None: keep &= exclude(reg)
    pick = reg[keep] if keep.sum() > 20 else reg
    return tuple(int(v) for v in np.median(pick[:, :3], axis=0))

def _crop(rgba):
    ys, xs = np.nonzero(rgba[..., 3] > 2)
    x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    return Image.fromarray(np.ascontiguousarray(rgba[y0:y1, x0:x1]), 'RGBA'), x0, y0

def _out(name):
    # all.py sets LIVING_OUT to the builder's private temporary folder.
    out = os.environ.get('LIVING_OUT')
    if not out: raise SystemExit('LIVING_OUT is not set; run scripts/living-motion/build.py')
    return f'{out}/{name}-alive.svg'

# ---------- ELEFANTE (Lámina 6): trunk swing, ears flap, both eyes blink ----------
def fc_p006_elefante():
    n = 'fc_p006_elefante'; t = Fit(n); base = load(n); size = base.size; svg = OriginalSvg(n, base)
    trunk = soft_mask(size, [('poly', t.poly([(130, 78), (168, 80), (172, 110), (168, 150), (150, 162), (118, 158), (100, 145), (98, 122), (110, 112), (127, 108)]))], t.d(2.5))
    y80 = t.p(150, 80)[1]
    ramp = np.clip((grid(size)[1] - y80) / t.d(45), 0, 1)
    vx, vy = field_rotate(size, trunk * ramp, t.p(150, 80))
    svg.warp(vx, vy, [0, 0.055, 0, -0.055, 0], '4.6s')
    ear_r = soft_mask(size, [('poly', t.poly([(189, 0), (222, 0), (222, 82), (182, 80), (177, 40), (186, 27)]))], t.d(2.5))
    ear_l = soft_mask(size, [('poly', t.poly([(92, 4), (118, 2), (121, 58), (104, 62), (92, 50)]))], t.d(2.5))
    vxr, vyr = field_scale(size, ear_r, t.p(178, 40), 1, 0.15)
    vxl, vyl = field_scale(size, ear_l, t.p(121, 35), 1, 0.15)
    svg.warp(vxr + vxl, vyr + vyl, [0, -0.10, 0, 0.05, 0], '3.4s', '0;0.3;0.55;0.8;1')
    lids = []
    for bx in [(121.5, 49.5, 133.5, 69), (149.5, 48, 163.5, 71)]:
        box = t.box(*bx)
        lids.append(lid_patch(base, box, ring_color(base, box), line=(12, 2, 16), lash_w=t.d(1.4), pad=t.d(0.6)))
    add_blink(svg, lids, 'blink', 4.8, -1.2)
    return svg.render(_out(n))

# ---------- OVEJA (Lámina 4): blink + small ear flick ----------
def fc_p004_oveja():
    n = 'fc_p004_oveja'; t = Fit(n); base = load(n); size = base.size; svg = OriginalSvg(n, base)
    ear_l = soft_mask(size, [('poly', t.poly([(28, 42), (60, 44), (62, 66), (30, 68)]))], t.d(2))
    ear_r = soft_mask(size, [('poly', t.poly([(84, 38), (112, 38), (112, 58), (84, 58)]))], t.d(2))
    vl = field_rotate(size, ear_l, t.p(59, 55)); vr = field_rotate(size, ear_r, t.p(87, 48))
    svg.warp(vl[0] - vr[0], vl[1] - vr[1], [0, 0, 0.16, -0.05, 0.03, 0], '5.6s', '0;0.62;0.68;0.74;0.8;1')
    face_box = t.box(70, 57, 79, 61)
    a = np.array(base).astype(int); x0, y0, x1, y1 = (int(v) for v in face_box)
    face = tuple(int(v) for v in np.median(a[y0:y1, x0:x1, :3].reshape(-1, 3), axis=0))
    lids = [lid_patch(base, t.box(69.6, 53.2, 74.2, 57.6), face, line=(25, 20, 10), lash_w=t.d(0.9), pad=t.d(0.3), outline=False),
            lid_patch(base, t.box(74.8, 53.6, 79.2, 58), face, line=(25, 20, 10), lash_w=t.d(0.9), pad=t.d(0.3), outline=False)]
    add_blink(svg, lids, 'blink', 4.4, -0.6)
    return svg.render(_out(n))

# ---------- OLLA (Lámina 4): soft steam curls rise from the lid ----------
def fc_p004_olla():
    n = 'fc_p004_olla'; t = Fit(n); base = load(n); s = t.s
    svg = OriginalSvg(n, base)  # room above the pot already; no padding
    svg.css.append(f'@keyframes steam{{0%{{transform:translateY({10*s:.1f}px) scale(.7,.8);opacity:0}}18%{{opacity:.95}}60%{{opacity:.75}}100%{{transform:translateY({-18*s:.1f}px) scale(1.25,1.15);opacity:0}}}}')
    svg.css.append(f'@keyframes curl{{0%,100%{{transform:translateX({-2*s:.1f}px)}}50%{{transform:translateX({2.5*s:.1f}px)}}}}')
    wisps = [((70, 40), 0.0), ((112, 18), 1.1), ((150, 40), 2.2), ((94, 24), 3.0), ((132, 22), 0.55)]
    svg.over.append(f'<defs><filter id="sb" filterUnits="userSpaceOnUse" x="{-50*s:.0f}" y="{-80*s:.0f}" width="{400*s:.0f}" height="{400*s:.0f}"><feGaussianBlur stdDeviation="{2*s:.1f}"/></filter></defs>')
    for (x, y), dl in wisps:
        X, Y = t.p(x, y); k = s
        d = f'M {X:.1f} {Y:.1f} c {-7*k:.1f} {-7*k:.1f} {7*k:.1f} {-11*k:.1f} 0 {-18*k:.1f} c {-7*k:.1f} {-7*k:.1f} {7*k:.1f} {-11*k:.1f} 0 {-18*k:.1f}'
        svg.over.append(f'<g class="ov" style="transform-origin:{X:.1f}px {Y:.1f}px;animation:steam 3.8s ease-out {dl}s infinite;opacity:0"><g style="animation:curl 1.9s ease-in-out {dl}s infinite">'
                        f'<path d="{d}" fill="none" stroke="#7d93ab" stroke-width="{10*k:.1f}" stroke-linecap="round" opacity=".6" filter="url(#sb)"/>'
                        f'<path d="{d}" fill="none" stroke="#a9bccf" stroke-width="{5.5*k:.1f}" stroke-linecap="round" opacity=".9"/>'
                        f'<path d="{d}" fill="none" stroke="#ffffff" stroke-width="{2*k:.1f}" stroke-linecap="round"/></g></g>')
    return svg.render(_out(n))

# ---------- OSO (Lámina 4): breathing, blinking, the bee's wings buzz ----------
def fc_p004_oso():
    # The bee stays where the drawing puts it (on the bear's head); only its wings
    # buzz. (Page 1's looping bee needs a repainted head behind it, which is not
    # done on this scan.)
    n = 'fc_p004_oso'; t = Fit(n); base = load(n); size = base.size; svg = OriginalSvg(n, base)
    belly = soft_mask(size, [('ellipse', t.box(18, 92, 194, 236))], t.d(9))
    vx, vy = field_scale(size, belly, t.p(105, 236), 1, 1)
    svg.warp(vx, vy, [0, 0.024, 0], '4.2s')
    lids = []
    for bx in [(84.5, 60.5, 104.5, 83.5), (104.5, 62.5, 122.5, 87.5)]:
        box = t.box(*bx)
        lids.append(lid_patch(base, box, ring_color(base, box, exclude=lambda r: (r[:, 0] > 150) & (r[:, 1] > 110)), lash_w=t.d(1.4), pad=t.d(0.6)))
    add_blink(svg, lids, 'blink', 5.2, -2.0)
    wing = soft_mask(size, [('poly', t.poly(OSO_BEE_WING))], t.d(0.8))
    wx, wy = field_scale(size, wing, t.p(*OSO_BEE_WING_ROOT), 0.2, 1)
    svg.warp(wx, wy, [0, -0.32, 0], '0.16s', splines=False)
    return svg.render(_out(n))

# Bee wing on the Page 1 bear (x >= 131, y < 50 inside the bee box), root at (132, 50).
OSO_BEE_WING = [(131, 21), (154, 21), (154, 49), (131, 49)]
OSO_BEE_WING_ROOT = (132, 50)

# ---------- IMAN (Lámina 7): clips are pulled in, field lines flow, sparks flicker ----------
def fc_p007_iman():
    n = 'fc_p007_iman'; t = Fit(n); base = load(n); size = base.size; svg = OriginalSvg(n, base); k = t.s
    a = np.array(base).astype(int); r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    dark = (r + g + b) < 230; pink = (r > 170) & (g < 120) & (b > 70)
    right = soft_mask(size, [('poly', t.poly([(161, 98), (214, 98), (214, 166), (161, 166)]))], 0) > .5
    bottom = soft_mask(size, [('poly', t.poly([(92, 143), (152, 143), (152, 214), (92, 214)]))], 0) > .5
    ker = max(3, int(round(3 * k)) | 1)
    for nm, reg, root, dl in [('r', right, t.p(162, 128), 0), ('b', bottom, t.p(118, 144), .9)]:
        m = reg & (al > 40) & (dark | pink)
        lay = a.copy(); lay[..., 3] = np.where(m, al, 0)
        glow = cv2.GaussianBlur(cv2.dilate(m.astype(np.uint8) * 255, np.ones((ker, ker), np.uint8)).astype(np.float32), (0, 0), 2.2 * k)
        gl = np.zeros((size[1], size[0], 4), np.uint8); gl[..., 0] = 255; gl[..., 1] = 236; gl[..., 2] = 120; gl[..., 3] = np.clip(glow * 1.6, 0, 255).astype(np.uint8)
        svg.css.append(f'@keyframes fl{nm}{{0%,100%{{opacity:0}}9%{{opacity:1}}14%{{opacity:.3}}22%{{opacity:1}}30%{{opacity:0}}55%{{opacity:0}}61%{{opacity:.85}}66%{{opacity:.2}}72%{{opacity:0}}}}')
        svg.css.append(f'@keyframes jt{nm}{{0%,100%{{transform:scale(1)}}9%{{transform:scale(1.1)}}14%{{transform:scale(1.02)}}22%{{transform:scale(1.12)}}30%{{transform:scale(1)}}61%{{transform:scale(1.08)}}72%{{transform:scale(1)}}}}')
        # Overlays are cropped to their own box (keeps the file light at this scan size).
        gim, gx, gy = _crop(gl); lim, lx, ly = _crop(lay.astype(np.uint8))
        svg.over.append(svg.image(gim, gx, gy, cls='ov', extra=f'style="animation:fl{nm} 2.6s linear {dl}s infinite;opacity:0"'))
        svg.over.append(svg.image(lim, lx, ly, cls='ov', extra=f'style="transform-origin:{root[0]:.1f}px {root[1]:.1f}px;animation:jt{nm} 2.6s linear {dl}s infinite"'))
    svg.css.append(f'@keyframes flow{{to{{stroke-dashoffset:{-14*k:.1f}}}}}')
    svg.css.append('@keyframes fieldpulse{0%,100%{opacity:.45}50%{opacity:.85}}')
    def P(x, y): X, Y = t.p(x, y); return f'{X:.1f} {Y:.1f}'
    arcs = [f'M {P(172, 104)} C {P(198, 108)} {P(210, 132)} {P(186, 150)}',
            f'M {P(102, 158)} C {P(108, 186)} {P(132, 198)} {P(148, 174)}',
            f'M {P(180, 114)} C {P(214, 136)} {P(188, 202)} {P(126, 182)}']
    for i, d in enumerate(arcs):
        svg.over.append(f'<path class="ov" d="{d}" fill="none" stroke="#4a6e95" stroke-width="{1.3*k:.1f}" stroke-linecap="round" stroke-dasharray="{3*k:.1f} {4*k:.1f}" style="animation:flow 1.4s linear infinite, fieldpulse 2.8s ease-in-out {i*0.45:.2f}s infinite"/>')
    clip = (f'<g transform="scale({2.1*k:.2f})"><path d="M -7 -2.6 L 6 -2.6 A 2.6 2.6 0 0 1 6 2.6 L -5 2.6 A 1.8 1.8 0 0 1 -5 -1 L 4.2 -1" fill="none" stroke="#4f5964" stroke-width="1.6" stroke-linecap="round"/>'
            '<path d="M -7 -2.6 L 6 -2.6 A 2.6 2.6 0 0 1 6 2.6" fill="none" stroke="#e8edf2" stroke-width=".55" stroke-linecap="round"/></g>')
    pulls = [((206, 150), (158, 101), 32, 0.0), ((196, 120), (160, 92), -18, 1.7), ((140, 202), (109, 140), 64, 0.85)]
    for i, ((x0, y0), (x1, y1), rot, dl) in enumerate(pulls):
        (X0, Y0), (X1, Y1) = t.p(x0, y0), t.p(x1, y1)
        q = (X0 + (X1 - X0) * .25, Y0 + (Y1 - Y0) * .25); bump = 1.2 * k
        svg.css.append(f'@keyframes pull{i}{{0%{{transform:translate({X0:.1f}px,{Y0:.1f}px) rotate({rot+25}deg);opacity:0}}8%{{opacity:1}}34%{{transform:translate({q[0]:.1f}px,{q[1]:.1f}px) rotate({rot+15}deg)}}48%{{transform:translate({X1:.1f}px,{Y1:.1f}px) rotate({rot}deg)}}51%{{transform:translate({X1-bump:.1f}px,{Y1-bump:.1f}px) rotate({rot}deg)}}54%,86%{{transform:translate({X1:.1f}px,{Y1:.1f}px) rotate({rot}deg);opacity:1}}100%{{transform:translate({X1:.1f}px,{Y1:.1f}px) rotate({rot}deg);opacity:0}}}}')
        svg.over.append(f'<g class="ov" style="opacity:0;animation:pull{i} 3.4s cubic-bezier(.55,0,.9,.6) {dl}s infinite">{clip}</g>')
    return svg.render(_out(n))
