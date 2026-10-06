import base64, io, math
import numpy as np, cv2
from PIL import Image, ImageDraw

import os
# Source PNGs: the embedded images of the Page 1 still SVGs (see README.md).
SRC = os.environ.get('LIVING_SRC', '/data/proto/blink')

def load(name):
    return Image.open(f'{SRC}/{name}.png').convert('RGBA')

def b64(im, fmt='PNG'):
    buf = io.BytesIO(); im.save(buf, fmt, optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()

def soft_mask(size, shapes, blur):
    """shapes: list of ('poly', pts) | ('ellipse', (x0,y0,x1,y1)); returns float mask 0..1"""
    S = 4
    m = Image.new('L', (size[0]*S, size[1]*S), 0); d = ImageDraw.Draw(m)
    for kind, g in shapes:
        if kind == 'poly': d.polygon([(x*S, y*S) for x, y in g], fill=255)
        else: d.ellipse([v*S for v in g], fill=255)
    m = m.resize(size, Image.LANCZOS)
    a = np.array(m).astype(np.float32) / 255
    if blur: a = cv2.GaussianBlur(a, (0, 0), blur)
    return a

def grid(size):
    W, H = size
    ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
    return xs + 0.5, ys + 0.5

def field_rotate(size, mask, pivot):
    """sampling offset per radian of rotation"""
    xs, ys = grid(size); px, py = pivot
    return mask * (ys - py), mask * -(xs - px)

def field_scale(size, mask, origin, sx=1.0, sy=1.0):
    """sampling offset per unit of (scale-1) growth"""
    xs, ys = grid(size); ox, oy = origin
    return -mask * (xs - ox) * sx, -mask * (ys - oy) * sy

def field_translate(size, mask, dx, dy):
    return -mask * dx, -mask * dy

def encode(vx, vy):
    M = float(max(np.abs(vx).max(), np.abs(vy).max(), 1e-6))
    r = np.clip(np.round(127.5 + 127.5 * vx / M), 0, 255).astype(np.uint8)
    g = np.clip(np.round(127.5 + 127.5 * vy / M), 0, 255).astype(np.uint8)
    H, W = vx.shape
    rgba = np.dstack([r, g, np.full((H, W), 128, np.uint8), np.full((H, W), 255, np.uint8)])
    return Image.fromarray(rgba, 'RGBA'), M

class Svg:
    def __init__(self, base, out_size=None, pad=(0, 0, 0, 0)):
        """pad = (left, top, right, bottom) extra room around the art for overlays
        (steam above the pot, the propeller past the plane's nose)."""
        self.base = base; self.W, self.H = base.size
        self.pad = pad
        l, t, r, b = pad
        self.out = out_size or (self.W + l + r, self.H + t + b)
        self.wrap = ''
        self.fx = []      # (map_uri, scale_values, dur, keytimes, begin)
        self.over = []    # raw svg strings
        self.css = []
    def warp(self, vx, vy, amps, dur, keytimes=None, splines=True, begin='0s'):
        """amps: list of motion amounts (radians / scale delta / px factor) as keyframe values"""
        im, M = encode(vx, vy)
        vals = ';'.join(f'{2*M*a:.3f}' for a in amps)
        n = len(amps)
        kt = keytimes or ';'.join(f'{i/(n-1):.4f}' for i in range(n))
        ks = ';'.join(['0.45 0 0.55 1'] * (n - 1))
        self.fx.append((b64(im), vals, dur, kt, ks if splines else None, begin))
    def image(self, im, x, y, cls='', extra=''):
        return f'<image class="{cls}" x="{x}" y="{y}" width="{im.width}" height="{im.height}" href="{b64(im)}" {extra}/>'
    def render(self, path):
        W, H = self.W, self.H
        l, t, r, b = self.pad
        out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.out[0]}" height="{self.out[1]}" viewBox="{-l} {-t} {W + l + r} {H + t + b}" preserveAspectRatio="xMidYMid meet">']
        css = '\n'.join(self.css)
        out.append('<style>' + css + '\n.alive{filter:url(#alive)}\n@media (prefers-reduced-motion: reduce){.alive{filter:none}.ov{display:none}.ov-wrap{animation:none!important}}</style>')
        if self.fx:
            out.append(f'<defs><filter id="alive" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="0" y="0" width="{W}" height="{H}" color-interpolation-filters="sRGB">')
            prev = 'SourceGraphic'
            for i, (uri, vals, dur, kt, ks, begin) in enumerate(self.fx):
                out.append(f'<feImage href="{uri}" x="0" y="0" width="{W}" height="{H}" preserveAspectRatio="none" result="m{i}"/>')
                spl = f' calcMode="spline" keySplines="{ks}"' if ks else ''
                out.append(f'<feDisplacementMap in="{prev}" in2="m{i}" xChannelSelector="R" yChannelSelector="G" scale="0" result="d{i}"><animate attributeName="scale" values="{vals}" keyTimes="{kt}" dur="{dur}" begin="{begin}" repeatCount="indefinite"{spl}/></feDisplacementMap>')
                prev = f'd{i}'
            out.append('</filter></defs>')
        body = [f'<g class="alive">{self.image(self.base, 0, 0)}</g>'] + self.over
        if self.wrap:
            out.append(f'<g class="ov-wrap" style="{self.wrap}">'); out.extend(body); out.append('</g>')
        else:
            out.extend(body)
        out.append('</svg>')
        s = '\n'.join(out)
        open(path, 'w').write(s)
        return len(s)

def lid_patch(base, box, color, line=(20, 10, 25), lash_w=1.4, pad=0.6, outline=True):
    """closed eyelid patch covering an eye box; returns (image, x, y)"""
    x0, y0, x1, y1 = box
    S = 8
    w, h = int(math.ceil(x1 - x0 + 2*pad)), int(math.ceil(y1 - y0 + 2*pad))
    im = Image.new('RGBA', (w*S, h*S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.ellipse((0, 0, w*S - 1, h*S - 1), fill=tuple(color) + (255,), outline=(line + (255,)) if outline else None, width=int(0.9*S) if outline else 0)
    # closed-lid crease: a soft downward arc near the lower third
    d.arc((w*S*0.08, -h*S*0.25, w*S*0.92, h*S*0.86), start=25, end=155, fill=line + (255,), width=int(lash_w*S))
    im = im.resize((w, h), Image.LANCZOS)
    return im, x0 - pad, y0 - pad

def add_blink(svg, lids, name, period, offset=0.0):
    """lids: list of (img, x, y). One synchronized blink for both eyes."""
    svg.css.append(f'@keyframes {name}{{0%,88%{{transform:scaleY(0)}}91%{{transform:scaleY(1)}}93.5%{{transform:scaleY(1)}}97%,100%{{transform:scaleY(0)}}}}')
    for im, x, y in lids:
        ox = x + im.width / 2
        svg.over.append(svg.image(im, f'{x:.2f}', f'{y:.2f}', cls='ov',
            extra=f'style="transform-origin:{ox:.2f}px {y:.2f}px;transform:scaleY(0);animation:{name} {period}s cubic-bezier(.45,0,.55,1) {offset}s infinite"'))
