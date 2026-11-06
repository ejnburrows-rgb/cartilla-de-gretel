import os, json, numpy as np
from PIL import Image
ROOT = 'C:/Users/EJN/Downloads/La Cartilla de Gretel'
D = ROOT + '/public/cartilla/art/owner-intake/imagegen-2026-11-06'
rows = json.load(open(ROOT + '/docs/art-board/board-data.json', encoding='utf-8'))['rows']

def sil(path, n=40):
    im = Image.open(path).convert('RGBA')
    bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im)
    g = np.array(bg.convert('L')); a = np.array(im.split()[3])
    m = (g < 235) | ((a > 20) & (a < 255) & False)
    if a.min() < 250: m = a > 40
    ys, xs = np.where(m)
    if len(ys) < 20: return None, 1
    m = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    ar = m.shape[1] / m.shape[0]
    # fill holes loosely by closing: resize
    s = np.array(Image.fromarray((m * 255).astype('uint8')).resize((n, n), Image.BILINEAR)) / 255.0
    return s, ar

cands = []
for r in rows:
    p = ROOT + '/' + r['original']
    if os.path.exists(p):
        s, ar = sil(p)
        if s is not None: cands.append((r, s, ar))
out = []
for f in sorted(os.listdir(D)):
    if not f.endswith('.png'): continue
    s, ar = sil(D + '/' + f)
    sc = []
    for r, cs, car in cands:
        iou = np.minimum(s, cs).sum() / max(1e-6, np.maximum(s, cs).sum())
        pen = abs(np.log(ar / car))
        sc.append((iou - 0.5 * pen, r))
    sc.sort(key=lambda x: -x[0])
    out.append({'file': f, 'top': [{'score': round(float(a), 3), 'id': r['id'], 'label': r.get('appLabel') or r['label'], 'page': r['page'], 'book': r['book'], 'original': r['original'], 'current': r['current']} for a, r in sc[:3]]})
json.dump(out, open(D + '/match-proposals.json', 'w'), indent=1, ensure_ascii=False)
# board image: new | best | 2nd | 3rd originals
from PIL import ImageDraw
def th(p):
    im = Image.open(p).convert('RGBA'); im.thumbnail((150, 120)); b = Image.new('RGB', (150, 120), (235, 235, 235)); b.paste(im, ((150 - im.width) // 2, (120 - im.height) // 2), im); return b
for k in range(0, len(out), 10):
    sh = Image.new('RGB', (4 * 160 + 200, 10 * 135), 'white'); dr = ImageDraw.Draw(sh)
    for i, o in enumerate(out[k:k + 10]):
        y = i * 135; sh.paste(th(D + '/' + o['file']), (0, y)); dr.text((2, y + 121), f"{k+i} NEW {o['file'][:24]}", fill='red')
        for j, t in enumerate(o['top']):
            sh.paste(th(ROOT + '/' + t['original']), (160 * (j + 1), y)); dr.text((160 * (j + 1) + 2, y + 121), f"{t['label'][:14]} {t['score']}", fill='black')
    sh.save(f"C:/Users/EJN/.gemini/antigravity/brain/4d988945-1e4c-4200-80b6-e46038f95e6b/scratch/match{k//10}.png")
print(len(out))
