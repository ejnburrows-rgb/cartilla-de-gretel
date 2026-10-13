"""Workbook vowel-review pictures (Lessons 2-6 practice pages): natural part motion.

These faithful pictures (public/cartilla/art/faithful/vocal-*/...) are the same
drawings as the owner-approved Workbook Page 1 pictures, at a larger scan size
(oso, elefante and abeja are mirrored). Each recipe re-uses the approved Page 1
motion, with every coordinate carried over through a fitted similarity
transform (SIFT feature match + RANSAC between the Page 1 still and this still;
values below). Only the moving parts move; the drawing itself is embedded
byte-for-byte (original WebP), never redrawn or re-encoded.

Re-fit after replacing a picture: see README.md ("When you replace a picture").
"""
import base64, os
import numpy as np, cv2
from PIL import Image
from lib import Svg, load, soft_mask, grid, field_rotate, field_scale, lid_patch, add_blink
from build import STILLS, ROOT

# Page 1 still -> vowel still: x' = a*x - b*y + tx, y' = b*x + a*y + ty, after an
# optional left-right mirror of the Page 1 still (width W1).
FITS = {
    'vocal-o-oso':      dict(a=3.8570, b=-0.0004, tx=8.14,  ty=7.95,   mirror=True,  W1=209),
    'vocal-o-oveja':    dict(a=3.9953, b=0.0281,  tx=10.12, ty=6.33,   mirror=False, W1=216),
    'vocal-e-elefante': dict(a=3.8405, b=-0.0006, tx=10.66, ty=-20.12, mirror=True,  W1=222),
    'vocal-o-olla':     dict(a=4.0073, b=0.0002,  tx=6.41,  ty=7.90,   mirror=False, W1=213),
    'vocal-a-avion':    dict(a=3.9271, b=-0.0013, tx=9.48,  ty=189.56, mirror=False, W1=208),
    'vocal-a-abeja':    dict(a=2.8071, b=0.0087,  tx=27.65, ty=21.45,  mirror=True,  W1=158),
    'vocal-a-abanico':  dict(a=3.8403, b=-0.0475, tx=5.52,  ty=4.98,   mirror=False, W1=220),
    'vocal-i-iman':     dict(a=3.9389, b=0.0011,  tx=10.45, ty=8.28,   mirror=False, W1=215),
}

class Fit:
    def __init__(self, name):
        f = FITS[name]; self.__dict__.update(f); self.s = float(np.hypot(f['a'], f['b']))
    def p(self, x, y):
        if self.mirror: x = self.W1 - x
        return (self.a * x - self.b * y + self.tx, self.b * x + self.a * y + self.ty)
    def poly(self, pts): return [self.p(x, y) for x, y in pts]
    def box(self, x0, y0, x1, y1):
        (ax, ay), (bx, by) = self.p(x0, y0), self.p(x1, y1)
        return (min(ax, bx), min(ay, by), max(ax, bx), max(ay, by))
    def d(self, v): return v * self.s

class OriginalSvg(Svg):
    """Embeds the still picture's original bytes and lighter (1/MAP_DIV) motion maps."""
    MAP_DIV = 3
    def __init__(self, name, base, **kw):
        super().__init__(base, **kw)
        path = os.path.join(ROOT, STILLS[name]); ext = os.path.splitext(path)[1].lstrip('.').replace('jpg', 'jpeg')
        self.base_uri = f'data:image/{ext};base64,' + base64.b64encode(open(path, 'rb').read()).decode()
    def image(self, im, x, y, cls='', extra=''):
        if im is self.base:
            return f'<image class="{cls}" x="{x}" y="{y}" width="{im.width}" height="{im.height}" href="{self.base_uri}" {extra}/>'
        return super().image(im, x, y, cls, extra)
    def warp(self, vx, vy, *args, **kw):
        k = self.MAP_DIV; size = (max(1, self.W // k), max(1, self.H // k))
        return super().warp(cv2.resize(vx, size, interpolation=cv2.INTER_AREA), cv2.resize(vy, size, interpolation=cv2.INTER_AREA), *args, **kw)

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

def _out(name): return f'{os.environ.get("LIVING_OUT", "/tmp")}/{name}-alive.svg'

# ---------- ELEFANTE (vowel e): trunk swing, ears flap, both eyes blink ----------
def vocal_e_elefante():
    n = 'vocal-e-elefante'; t = Fit(n); base = load(n); size = base.size; svg = OriginalSvg(n, base)
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
        lids.append(lid_patch(base, box, ring_color(base, box), line=(12, 2, 16), lash_w=t.d(1.4), pad=t.d(0.6), outline_w=t.d(0.9)))
    add_blink(svg, lids, 'blink', 4.8, -1.2)
    return svg.render(_out(n))

# ---------- OVEJA (vowel o): blink + small ear flick ----------
def vocal_o_oveja():
    n = 'vocal-o-oveja'; t = Fit(n); base = load(n); size = base.size; svg = OriginalSvg(n, base)
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

# ---------- OLLA (vowel o): soft steam curls rise from the lid ----------
def vocal_o_olla():
    n = 'vocal-o-olla'; t = Fit(n); base = load(n); s = t.s
    svg = OriginalSvg(n, base, pad=(0, int(round(48 * s)), 0, 0))
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

# ---------- AVION (vowel a): propeller spins at the nose, air streaks rush past ----------
def vocal_a_avion():
    # Same owner-approved look as Page 1, but this scan includes its own sky and
    # sun, so the whole picture does not glide (the sky would move too): only the
    # propeller and the air streaks move.
    n = 'vocal-a-avion'; t = Fit(n); base = load(n); s = t.s
    cx, cy = t.p(210.5, 89.5)
    right_pad = int(max(0, np.ceil(cx + 6 * s - base.width)))
    svg = OriginalSvg(n, base, pad=(0, 0, right_pad, 0))
    svg.css.append('@keyframes prop{0%{transform:scaleY(1)}25%{transform:scaleY(.08)}50%{transform:scaleY(-1)}75%{transform:scaleY(.08)}100%{transform:scaleY(1)}}')
    k = s
    hx0, hy0 = t.p(201.5, 84.2); hx1, hy1 = t.p(212.5, 89.5); hx2, hy2 = t.p(201.5, 94.8)
    svg.over.append(f"""<g class="ov">
<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{4.5*k:.1f}" ry="{22*k:.1f}" fill="#8c99a8" opacity=".6"/>
<g style="transform-origin:{cx:.1f}px {cy:.1f}px;animation:prop .16s linear infinite"><path d="M {cx:.1f} {cy-20.5*k:.1f} q {2.6*k:.1f} {10*k:.1f} 0 {20.5*k:.1f} q {-2.6*k:.1f} {10*k:.1f} 0 {20.5*k:.1f} q {-1.8*k:.1f} {-10*k:.1f} 0 {-20.5*k:.1f} q {1.8*k:.1f} {-10*k:.1f} 0 {-20.5*k:.1f} z" fill="#2b3036"/></g>
<path d="M {hx0:.1f} {hy0:.1f} Q {hx1:.1f} {hy1:.1f} {hx2:.1f} {hy2:.1f} Z" fill="#e2e6eb" stroke="#1d2126" stroke-width="{1.1*k:.1f}"/>
<circle cx="{cx-0.6*k:.1f}" cy="{cy:.1f}" r="{1.5*k:.1f}" fill="#1d2126"/>
</g>""")
    svg.css.append(f'@keyframes streak{{0%{{transform:translateX({14*k:.1f}px);opacity:0}}25%{{opacity:.9}}100%{{transform:translateX({-26*k:.1f}px);opacity:0}}}}')
    for i, (x, y, w) in enumerate([(10, 72, 22), (4, 100, 28), (14, 124, 18)]):
        X, Y = t.p(x, y)
        svg.over.append(f'<path class="ov" d="M {X:.1f} {Y:.1f} h {w*k:.1f}" stroke="#5f7fa0" stroke-width="{3*k:.1f}" stroke-linecap="round" style="animation:streak 1.2s linear {i*0.4:.1f}s infinite;opacity:0"/>')
    return svg.render(_out(n))

# ---------- ABEJA (vowel a): wings flutter ----------
def vocal_a_abeja():
    n = 'vocal-a-abeja'; t = Fit(n); base = load(n); size = base.size; svg = OriginalSvg(n, base)
    wr = soft_mask(size, [('poly', t.poly([(97, 0), (152, 0), (152, 42), (132, 64), (104, 72), (94, 64)]))], t.d(1.6))
    wl = soft_mask(size, [('poly', t.poly([(50, 4), (94, 2), (96, 58), (90, 62), (84, 40), (62, 34), (50, 30)]))], t.d(1.6))
    vxr, vyr = field_rotate(size, wr, t.p(97, 68))
    vxl, vyl = field_rotate(size, wl, t.p(92, 62))
    svg.warp(vxr - vxl, vyr - vyl, [0, 0.07, 0, -0.03, 0], '0.26s', splines=False)
    return svg.render(_out(n))

# ---------- OSO (vowel o): breathing, blinking, the bee's wings buzz ----------
def vocal_o_oso():
    # The bee stays where the drawing puts it (on the bear's head); only its wings
    # buzz. (Page 1's looping bee needs a repainted head behind it, which is not
    # done on this scan.)
    n = 'vocal-o-oso'; t = Fit(n); base = load(n); size = base.size; svg = OriginalSvg(n, base)
    belly = soft_mask(size, [('ellipse', t.box(18, 92, 194, 236))], t.d(9))
    vx, vy = field_scale(size, belly, t.p(105, 236), 1, 1)
    svg.warp(vx, vy, [0, 0.024, 0], '4.2s')
    lids = []
    for bx in [(84.5, 60.5, 104.5, 83.5), (104.5, 62.5, 122.5, 87.5)]:
        box = t.box(*bx)
        lids.append(lid_patch(base, box, ring_color(base, box, exclude=lambda r: (r[:, 0] > 150) & (r[:, 1] > 110)), lash_w=t.d(1.4), pad=t.d(0.6), outline_w=t.d(0.9)))
    add_blink(svg, lids, 'blink', 5.2, -2.0)
    wing = soft_mask(size, [('poly', t.poly(OSO_BEE_WING))], t.d(0.8))
    wx, wy = field_scale(size, wing, t.p(*OSO_BEE_WING_ROOT), 0.2, 1)
    svg.warp(wx, wy, [0, -0.32, 0], '0.16s', splines=False)
    return svg.render(_out(n))

# Bee wing on the Page 1 bear (x >= 131, y < 50 inside the bee box), root at (132, 50).
OSO_BEE_WING = [(131, 21), (154, 21), (154, 49), (131, 49)]
OSO_BEE_WING_ROOT = (132, 50)

# ---------- ABANICO (vowel a): the fan opens and closes slightly ----------
def vocal_a_abanico():
    n = 'vocal-a-abanico'; t = Fit(n); base = load(n); size = base.size; svg = OriginalSvg(n, base)
    px, py = t.p(28, 199)
    xs, ys = grid(size)
    th = np.clip(np.arctan2(xs - px, py - ys), 0, np.pi / 2) / (np.pi / 2)
    tab = soft_mask(size, [('poly', t.poly([(0, 194), (34, 194), (34, 221), (0, 221)]))], t.d(1.5))
    w = th * (1 - tab)
    vx, vy = (ys - py) * w, -(xs - px) * w
    svg.warp(vx, vy, [0, 0.045, 0, -0.03, 0], '5.2s')
    return svg.render(_out(n))

# ---------- IMAN (vowel i): clips are pulled in, field lines flow, sparks flicker ----------
def vocal_i_iman():
    n = 'vocal-i-iman'; t = Fit(n); base = load(n); size = base.size; svg = OriginalSvg(n, base); k = t.s
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
