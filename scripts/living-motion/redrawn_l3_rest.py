"""Source-preserving motion for seven ORIGINAL main pictures.

Measured on c99ab4ee26175e0ea2b494e56c39dfaa31f42e5d, not PR #888.
OriginalSvg embeds the exact original WebP bytes. Displacement affects only
anatomical parts; paper, alpha, crop, colours and object count are preserved.
No eyelids, ornaments, glow, whole-image bob or new illustration are added.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, cv2
from PIL import Image
from lib import load, soft_mask, grid, field_rotate, b64
from wb_vowels import OriginalSvg, _out
from redrawn_common import soften


def _smooth(v):
    t = np.clip(v, 0, 1)
    return t * t * (3 - 2 * t)


def _zone(size, poly):
    return soft_mask(size, [('poly', poly)], 0) > .5


class MainOriginalSvg(OriginalSvg):
    """Exact neutral displacement outside the measured moving part.

    An 8-bit value of 128 is not SVG's neutral .5; compensate its half-step
    explicitly, otherwise even unmasked pixels drift. Keep maps native-size
    so transparency/linework boundaries do not inherit downsampling bleed.
    """
    def warp(self, vx, vy, amps, dur, **kw):
        magnitude = float(max(abs(vx).max(), abs(vy).max(), 1e-6))
        shape = vx.shape
        rgba = np.dstack([
            np.clip(np.round(128 + 127 * vx / magnitude), 0, 255).astype('uint8'),
            np.clip(np.round(128 + 127 * vy / magnitude), 0, 255).astype('uint8'),
            np.full(shape, 128, 'uint8'), np.full(shape, 255, 'uint8')])
        vals = ';'.join(f'{255 * magnitude * a / 127:.6f}' for a in amps)
        self.fx.append((b64(Image.fromarray(rgba)), vals, dur, len(amps)))

    def render(self, path):
        w, h = self.W, self.H
        out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid meet">',
               '<style>.alive{filter:url(#alive)}@media (prefers-reduced-motion:reduce){.alive{filter:none}}</style>',
               f'<defs><filter id="alive" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="0" y="0" width="{w}" height="{h}" color-interpolation-filters="sRGB">']
        prev = 'SourceGraphic'
        for i, (uri, vals, dur, n) in enumerate(self.fx):
            times = ';'.join(f'{j/(n-1):.6f}' for j in range(n))
            splines = ';'.join(['.45 0 .55 1']*(n-1))
            out += [f'<feImage href="{uri}" x="0" y="0" width="{w}" height="{h}" preserveAspectRatio="none" result="map{i}"/>',
                    f'<feComponentTransfer in="map{i}" result="neutral{i}"><feFuncR type="linear" slope="1" intercept="-0.00196078431372549"/><feFuncG type="linear" slope="1" intercept="-0.00196078431372549"/></feComponentTransfer>',
                    f'<feDisplacementMap in="{prev}" in2="neutral{i}" xChannelSelector="R" yChannelSelector="G" scale="0" result="part{i}"><animate attributeName="scale" values="{vals}" keyTimes="{times}" dur="{dur}" repeatCount="indefinite" calcMode="spline" keySplines="{splines}"/></feDisplacementMap>']
            prev = f'part{i}'
        out += ['</filter></defs>', f'<g class="alive">{self.image(self.base, 0, 0)}</g>', '</svg>']
        text = '\n'.join(out)
        with open(path, 'w') as f:
            f.write(text)
        return len(text)


# OJOS — 677x377. Two tilted, disjoint eyes, NOT the old horizontal pair.
# Iris centres measured at (188,252) and (507,100). No flesh lid exists.
# A tiny coordinated gaze uses the original irises; rims stay stationary.
def leccion_1_ojos():
    n = 'leccion-1-ojos'; base = load(n); svg = MainOriginalSvg(n, base)
    xs, ys = grid(base.size)
    weight = np.zeros(base.size[::-1], np.float32)
    for cx, cy, radius in [(188, 252, 67), (507, 100, 63)]:
        d = np.hypot(xs-cx, ys-cy)
        weight = np.maximum(weight, _smooth((radius+17-d)/17))
    # Fade entirely inside the opaque eye surface: outer rims and every
    # transparent source pixel stay fixed, even where an iris meets a lid.
    alpha = np.array(base)[..., 3]
    interior = cv2.distanceTransform((alpha > 250).astype(np.uint8), cv2.DIST_L2, 5)
    weight *= _smooth((interior-10)/15)
    svg.warp(-3.2*weight, -.9*weight, [0, 1, 0, -.65, 0], '4.8s')
    return svg.render(_out(n))


# ARDILLA — 870x751. One eye; large free tail at left, acorn at right.
# Tail joins the haunch near (235,540). Only its free upper curl swishes.
ARD_TAIL_ZONE = [(0,0),(400,0),(400,401),(320,434),(285,470),
                 (290,520),(240,555),(174,555),(120,505),(120,447),
                 (170,400),(227,372),(216,360),(0,385)]
ARD_TAIL_PIVOT = (235, 540)

def vocal_a_ardilla():
    n = 'vocal-a-ardilla'; base = load(n); svg = MainOriginalSvg(n, base)
    xs, ys = grid(base.size)
    z = _zone(base.size, ARD_TAIL_ZONE)
    # Ramp is zero before the tail meets the body; acorn, head and feet stay.
    w = soften(z, 3) * _smooth((510-ys)/140)
    tx, ty = field_rotate(base.size, w, ARD_TAIL_PIVOT)
    svg.warp(tx, ty, [0, .014, 0, -.010, 0], '4s')
    return svg.render(_out(n))


# ORUGA — 580x570. Original grey drawing; hand is at x244..315,y168..256.
# A small wave pivots at the actual wrist/forearm, never across the face.
ORU_HAND_ZONE = [(241,157),(323,157),(328,247),(293,265),
                 (284,294),(255,294),(249,253),(232,214)]
ORU_HAND_PIVOT = (267, 290)

def vocal_o_oruga():
    n = 'vocal-o-oruga'; base = load(n); svg = MainOriginalSvg(n, base)
    xs, ys = grid(base.size)
    z = _zone(base.size, ORU_HAND_ZONE)
    w = soften(z, 2) * _smooth((289-ys)/43)
    tx, ty = field_rotate(base.size, w, ORU_HAND_PIVOT)
    svg.warp(tx, ty, [0, .045, -.025, .035, 0], '3.2s')
    return svg.render(_out(n))


# ALAS — 870x636. Separate source wings attach at the two inner shoulders.
# Move each free wing rigidly, opposite directions, with a short fixed root.
# Original alpha holes on the right wing are source pixels, not repaired here.
ALAS_L_PIVOT = (386, 207)
ALAS_R_PIVOT = (455, 207)

def vocal_a_alas():
    n = 'vocal-a-alas'; base = load(n); svg = MainOriginalSvg(n, base)
    xs, ys = grid(base.size)
    vx = np.zeros(base.size[::-1], np.float32); vy = np.zeros_like(vx)
    for pivot, side, sign in [(ALAS_L_PIVOT, xs < 423, 1),
                              (ALAS_R_PIVOT, xs > 427, -1)]:
        d = np.hypot(xs-pivot[0], ys-pivot[1])
        w = soften(side, 2) * _smooth((d-18)/65)
        tx, ty = field_rotate(base.size, w, pivot)
        vx += sign*tx; vy += sign*ty
    svg.warp(vx, vy, [0, .018, 0, -.012, 0], '3.6s')
    return svg.render(_out(n))


# ESTRELLA — 757x864. Printed five-point symbol, no anatomical moving part.
# Preserve its original dots/scan streaks too. No invented twinkle, colour
# shift, wobble, extra sparkle or point deformation is source-justified.
def vocal_e_estrella():
    n = 'vocal-e-estrella'; base = load(n)
    svg = OriginalSvg(n, base)
    return svg.render(_out(n))


# AGUJA — 413x495. Rigid needle and eye remain fixed. The existing free
# thread end above/right of the eye flexes gently, attached at (302,108).
AGU_THREAD_ZONE = [(297,4),(413,4),(413,88),(330,129),(296,139)]
AGU_PIVOT = (302, 108)

def vocal_a_aguja():
    n = 'vocal-a-aguja'; base = load(n); svg = MainOriginalSvg(n, base)
    xs, ys = grid(base.size)
    z = _zone(base.size, AGU_THREAD_ZONE)
    d = np.hypot(xs-AGU_PIVOT[0], ys-AGU_PIVOT[1])
    w = soften(z, 2) * _smooth((d-12)/40)
    tx, ty = field_rotate(base.size, w, AGU_PIVOT)
    svg.warp(tx, ty, [0, .028, 0, -.020, 0], '4s')
    return svg.render(_out(n))


# MAIZ — 799x870. Only the left free curled husk (x70..260,y330..501).
# Cob, kernels, stem, other husks and original top/left scan frame stay fixed.
MAIZ_LEAF_ZONE = [(62,319),(247,319),(263,383),(247,428),
                  (204,439),(150,485),(63,510)]
MAIZ_PIVOT = (256, 398)

def leccion_1_maiz():
    n = 'leccion-1-maiz'; base = load(n); svg = MainOriginalSvg(n, base)
    xs, ys = grid(base.size)
    z = _zone(base.size, MAIZ_LEAF_ZONE)
    w = soften(z, 2) * _smooth((252-xs)/55)
    tx, ty = field_rotate(base.size, w, MAIZ_PIVOT)
    svg.warp(tx, ty, [0, .024, 0, -.016, 0], '3.8s')
    return svg.render(_out(n))
