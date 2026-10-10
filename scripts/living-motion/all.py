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
    # Owner 2026-10-07: the plane must visibly fly — a clear spinning propeller at the
    # nose plus a gentle up-and-down glide of the whole plane.
    base = load('avion'); svg = Svg(base, pad=(0, 6, 18, 6))
    svg.css.append('@keyframes prop{0%{transform:scaleY(1)}25%{transform:scaleY(.08)}50%{transform:scaleY(-1)}75%{transform:scaleY(.08)}100%{transform:scaleY(1)}}')
    svg.css.append('@keyframes glide{0%,100%{transform:translate(0px,0px) rotate(0deg)}30%{transform:translate(1px,-3.5px) rotate(-1.2deg)}65%{transform:translate(-1px,2.5px) rotate(0.8deg)}}')
    svg.wrap = 'transform-origin:104px 96px;animation:glide 3.6s cubic-bezier(.45,0,.55,1) infinite'
    cx, cy = 210.5, 89.5
    svg.over.append(f"""<g class="ov">
<ellipse cx="{cx}" cy="{cy}" rx="4.5" ry="22" fill="#8c99a8" opacity=".6"/>
<g style="transform-origin:{cx}px {cy}px;animation:prop .16s linear infinite"><path d="M {cx} {cy-20.5} q 2.6 10 0 20.5 q -2.6 10 0 20.5 q -1.8 -10 0 -20.5 q 1.8 -10 0 -20.5 z" fill="#2b3036"/></g>
<path d="M 201.5 84.2 Q 212.5 89.5 201.5 94.8 Z" fill="#e2e6eb" stroke="#1d2126" stroke-width="1.1"/>
<circle cx="{cx-0.6}" cy="{cy}" r="1.5" fill="#1d2126"/>
</g>""")
    # Air streaks rush past behind the tail so the plane reads as flying forward.
    svg.css.append('@keyframes streak{0%{transform:translateX(14px);opacity:0}25%{opacity:.9}100%{transform:translateX(-26px);opacity:0}}')
    for k, (x, y, w) in enumerate([(10, 72, 22), (4, 100, 28), (14, 124, 18)]):
        svg.over.append(f'<path class="ov" d="M {x} {y} h {w}" stroke="#5f7fa0" stroke-width="3" stroke-linecap="round" style="animation:streak 1.2s linear {k*0.4:.1f}s infinite;opacity:0"/>')
    return svg.render(f'{OUT}/avion-alive.svg')

# ---------- IMAN: subtle spark flicker ----------
def iman():
    # Owner 2026-10-07: show it is magnetic — little paper clips are pulled in and stick
    # to each pole, field lines flow between the poles, and the sparks flicker.
    base = load('iman'); size = base.size; svg = Svg(base)
    a = np.array(base).astype(int); r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    dark = (r + g + b) < 230; pink = (r > 170) & (g < 120) & (b > 70)
    right = soft_mask(size, [('poly', [(161, 98), (214, 98), (214, 166), (161, 166)])], 0) > .5
    bottom = soft_mask(size, [('poly', [(92, 143), (152, 143), (152, 214), (92, 214)])], 0) > .5
    for nm, reg, root, dl in [('r', right, (162, 128), 0), ('b', bottom, (118, 144), .9)]:
        m = reg & (al > 40) & (dark | pink)
        lay = a.copy(); lay[..., 3] = np.where(m, al, 0)
        glow = cv2.GaussianBlur(cv2.dilate(m.astype(np.uint8) * 255, np.ones((3, 3), np.uint8)).astype(np.float32), (0, 0), 2.2)
        gl = np.zeros((size[1], size[0], 4), np.uint8); gl[..., 0] = 255; gl[..., 1] = 236; gl[..., 2] = 120; gl[..., 3] = np.clip(glow * 1.6, 0, 255).astype(np.uint8)
        svg.css.append(f'@keyframes fl{nm}{{0%,100%{{opacity:0}}9%{{opacity:1}}14%{{opacity:.3}}22%{{opacity:1}}30%{{opacity:0}}55%{{opacity:0}}61%{{opacity:.85}}66%{{opacity:.2}}72%{{opacity:0}}}}')
        svg.css.append(f'@keyframes jt{nm}{{0%,100%{{transform:scale(1)}}9%{{transform:scale(1.1)}}14%{{transform:scale(1.02)}}22%{{transform:scale(1.12)}}30%{{transform:scale(1)}}61%{{transform:scale(1.08)}}72%{{transform:scale(1)}}}}')
        svg.over.append(svg.image(Image.fromarray(gl, 'RGBA'), 0, 0, cls='ov', extra=f'style="animation:fl{nm} 2.6s linear {dl}s infinite;opacity:0"'))
        svg.over.append(svg.image(Image.fromarray(lay.astype(np.uint8), 'RGBA'), 0, 0, cls='ov', extra=f'style="transform-origin:{root[0]}px {root[1]}px;animation:jt{nm} 2.6s linear {dl}s infinite"'))
    # Field lines: small, thin, soft arcs around the poles and outer field path.
    # Seamless dash animation (dasharray 3 4 => period 7, dashoffset -14).
    svg.css.append('@keyframes flow{to{stroke-dashoffset:-14}}')
    svg.css.append('@keyframes fieldpulse{0%,100%{opacity:.45}50%{opacity:.85}}')
    # Small, soft field lines sitting naturally around poles, completely outside magnet face
    arcs = [
        # Red pole small outer loop
        'M 172 104 C 198 108 210 132 186 150',
        # Blue pole small outer loop
        'M 102 158 C 108 186 132 198 148 174',
        # Soft outer arc connecting around the outside corner
        'M 180 114 C 214 136 188 202 126 182',
    ]
    for k, d in enumerate(arcs):
        svg.over.append(f'<path class="ov" d="{d}" fill="none" stroke="#4a6e95" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="3 4" style="animation:flow 1.4s linear infinite, fieldpulse 2.8s ease-in-out {k*0.45:.2f}s infinite"/>')
    # Paper clips pulled in (accelerating, like a real magnet) and sticking to each pole.
    clip = ('<g transform="scale(2.1)"><path d="M -7 -2.6 L 6 -2.6 A 2.6 2.6 0 0 1 6 2.6 L -5 2.6 A 1.8 1.8 0 0 1 -5 -1 L 4.2 -1" fill="none" stroke="#4f5964" stroke-width="1.6" stroke-linecap="round"/>'
            '<path d="M -7 -2.6 L 6 -2.6 A 2.6 2.6 0 0 1 6 2.6" fill="none" stroke="#e8edf2" stroke-width=".55" stroke-linecap="round"/></g>')
    pulls = [((206, 150), (158, 101), 32, 0.0), ((196, 120), (160, 92), -18, 1.7), ((140, 202), (109, 140), 64, 0.85)]
    for k, ((x0, y0), (x1, y1), rot, dl) in enumerate(pulls):
        svg.css.append(f'@keyframes pull{k}{{0%{{transform:translate({x0}px,{y0}px) rotate({rot+25}deg);opacity:0}}8%{{opacity:1}}34%{{transform:translate({x0+(x1-x0)*.25:.1f}px,{y0+(y1-y0)*.25:.1f}px) rotate({rot+15}deg)}}48%{{transform:translate({x1}px,{y1}px) rotate({rot}deg)}}51%{{transform:translate({x1-1.2:.1f}px,{y1-1.2:.1f}px) rotate({rot}deg)}}54%,86%{{transform:translate({x1}px,{y1}px) rotate({rot}deg);opacity:1}}100%{{transform:translate({x1}px,{y1}px) rotate({rot}deg);opacity:0}}}}')
        svg.over.append(f'<g class="ov" style="opacity:0;animation:pull{k} 3.4s cubic-bezier(.55,0,.9,.6) {dl}s infinite">{clip}</g>')
    return svg.render(f'{OUT}/iman-alive.svg')

# ---------- OLLA: light steam rises ----------
def olla():
    # Owner 2026-10-07: steam must clearly show — soft gray-blue curls rise from the
    # lid edges and the knob, above the pot (extra room on top so it is not cut off).
    base = load('olla'); svg = Svg(base, pad=(0, 48, 0, 0))
    svg.css.append('@keyframes steam{0%{transform:translateY(10px) scale(.7,.8);opacity:0}18%{opacity:.95}60%{opacity:.75}100%{transform:translateY(-18px) scale(1.25,1.15);opacity:0}}')
    svg.css.append('@keyframes curl{0%,100%{transform:translateX(-2px)}50%{transform:translateX(2.5px)}}')
    wisps = [((70, 40), 0.0), ((112, 18), 1.1), ((150, 40), 2.2), ((94, 24), 3.0), ((132, 22), 0.55)]
    svg.over.append('<defs><filter id="sb" filterUnits="userSpaceOnUse" x="-50" y="-80" width="400" height="400"><feGaussianBlur stdDeviation="2"/></filter></defs>')
    for (x, y), dl in wisps:
        d = f'M {x} {y} c -7 -7 7 -11 0 -18 c -7 -7 7 -11 0 -18'
        svg.over.append(f'<g class="ov" style="transform-origin:{x}px {y}px;animation:steam 3.8s ease-out {dl}s infinite;opacity:0"><g style="animation:curl 1.9s ease-in-out {dl}s infinite">'
                        f'<path d="{d}" fill="none" stroke="#7d93ab" stroke-width="10" stroke-linecap="round" opacity=".6" filter="url(#sb)"/>'
                        f'<path d="{d}" fill="none" stroke="#a9bccf" stroke-width="5.5" stroke-linecap="round" opacity=".9"/>'
                        f'<path d="{d}" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></g></g>')
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

# ---------- P009-SCENE (Lesson 7 mono scene): gentle head nod & breathing ----------
def p009_scene():
    base = load('p009-scene'); size = base.size; svg = Svg(base)
    head = soft_mask(size, [('ellipse', (120, 40, 420, 320))], 8)
    vx, vy = field_rotate(size, head, (265, 280))
    svg.warp(vx, vy, [0, 0.025, 0, -0.025, 0], '4.8s')
    body = soft_mask(size, [('ellipse', (80, 200, 450, 480))], 12)
    bx, by = field_scale(size, body, (265, 480), 1, 0.8)
    svg.warp(bx, by, [0, 0.015, 0], '4.2s')
    return svg.render(f'{OUT}/p009-scene-alive.svg')

if __name__ == '__main__':
    import os; os.makedirs(OUT, exist_ok=True)
    for f in ARGS or ['elefante', 'oso', 'oveja', 'abanico', 'avion', 'iman', 'olla', 'abeja', 'p009_scene']:
        fn = 'p009_scene' if f in ('p009-scene', 'p009_scene') else f
        print(f, globals()[fn]())
