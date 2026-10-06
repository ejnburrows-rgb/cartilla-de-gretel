import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
OUT = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1].startswith('/') else '/data/proto/alive/out'
ARGS = [a for a in sys.argv[1:] if not a.startswith('/')]

# ---------- ELEFANTE: trunk swing, ears flap, both eyes blink ----------
def elefante():
    base = load('elefante'); size = base.size; svg = Svg(base)
    trunk = soft_mask(size, [('poly', [(130, 78), (168, 80), (172, 110), (168, 150), (150, 162), (118, 158), (100, 145), (98, 122), (110, 112), (127, 108)])], 2.5)
    ramp = np.clip((grid(size)[1] - 80) / 45, 0, 1)
    vx, vy = field_rotate(size, trunk * ramp, (150, 80))
    svg.warp(vx, vy, [0, 0.055, 0, -0.055, 0], '4.6s')
    ear_r = soft_mask(size, [('poly', [(189, 0), (222, 0), (222, 82), (182, 80), (177, 40), (186, 27)])], 2.5)
    ear_l = soft_mask(size, [('poly', [(92, 4), (118, 2), (121, 58), (104, 62), (92, 50)])], 2.5)
    vxr, vyr = field_scale(size, ear_r, (178, 40), 1, 0.15)
    vxl, vyl = field_scale(size, ear_l, (121, 35), 1, 0.15)
    svg.warp(vxr + vxl, vyr + vyl, [0, -0.10, 0, 0.05, 0], '3.4s', '0;0.3;0.55;0.8;1')
    lid = (64, 13, 72)
    add_blink(svg, [lid_patch(base, (121.5, 49.5, 133.5, 69), lid, line=(12, 2, 16)),
                    lid_patch(base, (149.5, 48, 163.5, 71), lid, line=(12, 2, 16))], 'blink', 4.8, -1.2)
    return svg.render(f'{OUT}/elefante-alive.svg')

# ---------- OSO: breathing, blinking, bee buzzing around the head ----------
def oso():
    base = load('oso'); size = base.size
    a = np.array(base).astype(np.int32); H, W = a.shape[:2]
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    poly = soft_mask(size, [('poly', [(132, 21), (154, 21), (154, 50), (146, 56), (141, 67), (125, 67), (121, 44), (131, 41)])], 0) > 0.5
    fur = (r > 110) & (g < 0.74 * r) & ((r + g + b) >= 200)
    light = (r > 200) & (g > 150) & (g < 0.84 * r) & (b < 150)
    brown = (r > 45) & (r > 1.25 * g)
    bee = poly & (al > 30) & ~fur & ~light & ~brown
    bee = cv2.morphologyEx(bee.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((2, 2), np.uint8)).astype(bool) & poly
    n_, lab, st, _ = cv2.connectedComponentsWithStats(bee.astype(np.uint8), 8)
    for k in range(1, n_):
        if st[k, cv2.CC_STAT_AREA] < 6: bee[lab == k] = False
    yy, xx = np.mgrid[0:H, 0:W]
    headside = ((151 - 131) * (yy - 41) - (60 - 41) * (xx - 131)) > 0
    headside |= (xx < 132) & (yy >= 41)
    bee_img = a.copy(); bee_img[..., 3] = np.where(bee, al, 0)
    base_a = a.copy()
    base_a[bee & ~headside, 3] = 0
    hole = (bee & headside).astype(np.uint8)
    hole_d = cv2.dilate(hole, np.ones((5, 5), np.uint8)) & headside.astype(np.uint8) & (fur | bee | ((r + g + b) < 330)).astype(np.uint8)
    known = (fur & ~bee).astype(np.float32)
    acc = np.zeros((H, W, 3), np.float32); wsum = np.zeros((H, W), np.float32)
    for sig in (3, 6, 10):
        k = cv2.GaussianBlur(known, (0, 0), sig)
        c = np.dstack([cv2.GaussianBlur(base_a[..., ch].astype(np.float32) * known, (0, 0), sig) for ch in range(3)])
        sel = (wsum < 0.05) & (k > 0.02)
        acc[sel] = c[sel] / k[sel, None]; wsum[sel] = 1
    rng = np.random.default_rng(3)
    noise = rng.normal(0, 6, (H, W, 1))
    m = hole_d.astype(bool)
    base_a[m, :3] = np.clip(acc[m] + noise[m], 0, 255)
    base_a[m, 3] = 255
    # keep the area outside the head (above the outline) transparent
    base_a[poly & ~headside, 3] = np.where(fur[poly & ~headside] | light[poly & ~headside], base_a[poly & ~headside, 3], 0)
    bi = Image.fromarray(base_a.astype(np.uint8), 'RGBA')
    big = bi.resize((W * 4, H * 4), Image.LANCZOS); dd = ImageDraw.Draw(big)
    dd.line([(131 * 4, 39 * 4), (136 * 4, 44.5 * 4), (142 * 4, 50 * 4), (147 * 4, 55 * 4), (150.5 * 4, 60 * 4)], fill=(22, 12, 8, 255), width=9, joint='curve')
    small = np.array(big.resize((W, H), Image.LANCZOS))
    near = cv2.dilate(bee.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    fin = np.where(near[..., None], small, base_a.astype(np.uint8))
    base_img = Image.fromarray(fin.astype(np.uint8), 'RGBA')
    svg = Svg(base_img)
    belly = soft_mask(size, [('ellipse', (18, 92, 194, 236))], 9)
    vx, vy = field_scale(size, belly, (105, 236), 1, 1)
    svg.warp(vx, vy, [0, 0.024, 0], '4.2s')
    lidc = (240, 186, 104)
    add_blink(svg, [lid_patch(base, (84.5, 60.5, 104.5, 83.5), lidc), lid_patch(base, (104.5, 62.5, 122.5, 87.5), lidc)], 'blink', 5.2, -2.0)
    ys_, xs_ = np.nonzero(bee); x0, x1, y0, y1 = xs_.min(), xs_.max() + 1, ys_.min(), ys_.max() + 1
    crop = Image.fromarray(bee_img.astype(np.uint8), 'RGBA').crop((x0, y0, x1, y1))
    svg.css.append('@keyframes buzz{0%,100%{transform:translate(0px,0px) rotate(0deg)}15%{transform:translate(7px,-6px) rotate(8deg)}32%{transform:translate(13px,3px) rotate(3deg)}50%{transform:translate(5px,10px) rotate(-6deg)}68%{transform:translate(-8px,4px) rotate(-10deg)}84%{transform:translate(-5px,-5px) rotate(-3deg)}}')
    svg.css.append('@keyframes wing{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.68)}}')
    ca = np.array(crop); wing = ca.copy(); body = ca.copy()
    cy_, cx_ = np.mgrid[0:ca.shape[0], 0:ca.shape[1]]
    wsel = ((cx_ + x0) >= 131) & ((cy_ + y0) < 50)
    wing[..., 3] = np.where(wsel, ca[..., 3], 0); body[..., 3] = np.where(wsel, 0, ca[..., 3])
    wing_i = Image.fromarray(wing, 'RGBA'); body_i = Image.fromarray(body, 'RGBA')
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    g = f'<g class="ov" style="transform-origin:{cx:.1f}px {cy:.1f}px;animation:buzz 3.2s cubic-bezier(.45,0,.55,1) infinite">'
    g += f'<g style="transform-origin:132px 50px;animation:wing .16s linear infinite">' + svg.image(wing_i, x0, y0) + '</g>'
    g += svg.image(body_i, x0, y0) + '</g>'
    svg.over.append(g)
    return svg.render(f'{OUT}/oso-alive.svg')

# ---------- OVEJA: blink + small ear flick ----------
def oveja():
    base = load('oveja'); size = base.size; svg = Svg(base)
    ear_l = soft_mask(size, [('poly', [(28, 42), (60, 44), (62, 66), (30, 68)])], 2)
    ear_r = soft_mask(size, [('poly', [(84, 38), (112, 38), (112, 58), (84, 58)])], 2)
    vl = field_rotate(size, ear_l, (59, 55)); vr = field_rotate(size, ear_r, (87, 48))
    svg.warp(vl[0] - vr[0], vl[1] - vr[1], [0, 0, 0.16, -0.05, 0.03, 0], '5.6s', '0;0.62;0.68;0.74;0.8;1')
    face = (252, 244, 196)
    try:
        aa = np.array(base).astype(int); face = tuple(int(v) for v in np.median(aa[57:61, 70:79, :3].reshape(-1, 3), axis=0))
    except Exception: pass
    add_blink(svg, [lid_patch(base, (69.6, 53.2, 74.2, 57.6), face, line=(25, 20, 10), lash_w=0.9, pad=0.3, outline=False),
                    lid_patch(base, (74.8, 53.6, 79.2, 58), face, line=(25, 20, 10), lash_w=0.9, pad=0.3, outline=False)], 'blink', 4.4, -0.6)
    return svg.render(f'{OUT}/oveja-alive.svg')

# ---------- ABANICO: opens and closes slightly ----------
def abanico():
    base = load('abanico'); size = base.size; svg = Svg(base)
    px, py = 28, 199
    xs, ys = grid(size)
    th = np.clip(np.arctan2(xs - px, py - ys), 0, math.pi / 2) / (math.pi / 2)
    tab = soft_mask(size, [('poly', [(0, 194), (34, 194), (34, 221), (0, 221)])], 1.5)
    w = th * (1 - tab)
    vx, vy = (ys - py) * w, -(xs - px) * w
    svg.warp(vx, vy, [0, 0.045, 0, -0.03, 0], '5.2s')
    return svg.render(f'{OUT}/abanico-alive.svg')

# ---------- AVION: propeller spins at the nose ----------
def avion():
    base = load('avion'); svg = Svg(base)
    svg.css.append('@keyframes prop{0%{transform:scaleY(1)}25%{transform:scaleY(.06)}50%{transform:scaleY(-1)}75%{transform:scaleY(.06)}100%{transform:scaleY(1)}}')
    cx, cy = 205.2, 90
    svg.over.append(f'''<g class="ov">
<ellipse cx="{cx}" cy="{cy}" rx="2.4" ry="15" fill="#c3cad3" opacity=".45"/>
<g style="transform-origin:{cx}px {cy}px;animation:prop .2s linear infinite"><path d="M {cx} {cy-14.5} q 1.8 7 0 14.5 q -1.8 7 0 14.5 q -1.3 -7 0 -14.5 q 1.3 -7 0 -14.5 z" fill="#2f343b"/></g>
<path d="M 200.8 85.6 Q 207.6 90 200.8 94.4 Z" fill="#d4d9df" stroke="#1d2126" stroke-width=".8"/>
</g>''')
    return svg.render(f'{OUT}/avion-alive.svg')

# ---------- IMAN: subtle spark flicker ----------
def iman():
    base = load('iman'); size = base.size; svg = Svg(base)
    a = np.array(base).astype(int); r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    dark = (r + g + b) < 230; pink = (r > 170) & (g < 120) & (b > 70)
    right = soft_mask(size, [('poly', [(161, 98), (214, 98), (214, 166), (161, 166)])], 0) > .5
    bottom = soft_mask(size, [('poly', [(92, 143), (152, 143), (152, 214), (92, 214)])], 0) > .5
    for nm, reg, root, dl in [('r', right, (162, 128), 0), ('b', bottom, (118, 144), .9)]:
        m = reg & (al > 40) & (dark | pink)
        lay = a.copy(); lay[..., 3] = np.where(m, al, 0)
        glow = cv2.GaussianBlur(cv2.dilate(m.astype(np.uint8) * 255, np.ones((3, 3), np.uint8)).astype(np.float32), (0, 0), 2.2)
        gl = np.zeros((size[1], size[0], 4), np.uint8); gl[..., 0] = 255; gl[..., 1] = 236; gl[..., 2] = 120; gl[..., 3] = np.clip(glow * 1.4, 0, 255).astype(np.uint8)
        svg.css.append(f'@keyframes fl{nm}{{0%,100%{{opacity:0}}9%{{opacity:.85}}14%{{opacity:.25}}22%{{opacity:.9}}30%{{opacity:0}}55%{{opacity:0}}61%{{opacity:.7}}66%{{opacity:.15}}72%{{opacity:0}}}}')
        svg.css.append(f'@keyframes jt{nm}{{0%,100%{{transform:scale(1)}}9%{{transform:scale(1.06)}}14%{{transform:scale(1.01)}}22%{{transform:scale(1.07)}}30%{{transform:scale(1)}}61%{{transform:scale(1.05)}}72%{{transform:scale(1)}}}}')
        svg.over.append(svg.image(Image.fromarray(gl, 'RGBA'), 0, 0, cls='ov', extra=f'style="animation:fl{nm} 2.6s linear {dl}s infinite;opacity:0"'))
        svg.over.append(svg.image(Image.fromarray(lay.astype(np.uint8), 'RGBA'), 0, 0, cls='ov', extra=f'style="transform-origin:{root[0]}px {root[1]}px;animation:jt{nm} 2.6s linear {dl}s infinite"'))
    return svg.render(f'{OUT}/iman-alive.svg')

# ---------- OLLA: light steam rises ----------
def olla():
    base = load('olla'); svg = Svg(base)
    svg.css.append('@keyframes steam{0%{transform:translateY(8px) scaleX(.8);opacity:0}22%{opacity:.95}65%{opacity:.6}100%{transform:translateY(-16px) scaleX(1.25);opacity:0}}')
    wisps = [((76, 44), 0.0), ((156, 44), 1.4), ((116, 40), 2.7), ((98, 46), 3.6)]
    svg.over.append('<defs><filter id="sb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter></defs>')
    for (x, y), dl in wisps:
        d = f'M {x} {y} c -5 -6 5 -9 0 -15 c -5 -6 5 -9 0 -15'
        svg.over.append(f'<g class="ov" style="transform-origin:{x}px {y}px;animation:steam 4.6s ease-in-out {dl}s infinite;opacity:0"><path d="{d}" fill="none" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round" filter="url(#sb)"/><path d="{d}" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"/></g>')
    return svg.render(f'{OUT}/olla-alive.svg')


# ---------- ABEJA: wings flutter (current Page 1 drawing) ----------
def abeja():
    base = load('abeja'); size = base.size; svg = Svg(base)
    wr = soft_mask(size, [('poly', [(97, 0), (152, 0), (152, 42), (132, 64), (104, 72), (94, 64)])], 1.6)
    wl = soft_mask(size, [('poly', [(50, 4), (94, 2), (96, 58), (90, 62), (84, 40), (62, 34), (50, 30)])], 1.6)
    vxr, vyr = field_rotate(size, wr, (97, 68))
    vxl, vyl = field_rotate(size, wl, (92, 62))
    svg.warp(vxr - vxl, vyr - vyl, [0, 0.07, 0, -0.03, 0], '0.26s', splines=False)
    return svg.render(f'{OUT}/abeja-alive.svg')

if __name__ == '__main__':
    import os; os.makedirs(OUT, exist_ok=True)
    for f in ARGS or ['elefante', 'oso', 'oveja', 'abanico', 'avion', 'iman', 'olla', 'abeja']:
        print(f, globals()[f]())
