"""One command to rebuild every moving ("alive") picture from its still picture.

    python3 scripts/living-motion/build.py            # rebuild all
    python3 scripts/living-motion/build.py iman olla  # rebuild some

For each picture it: reads the still (an SVG with an embedded PNG, or a PNG/WebP),
rebuilds `<name>-alive.svg` next to the still, and records the still's fingerprint in
manifest.json. The test src/lib/__tests__/living-alive-freshness.test.ts fails if a
still picture is replaced without re-running this script.

IMPORTANT when a picture is REPLACED with new art: the motion in all.py uses
coordinates drawn for the current picture (where the ears, propeller, poles, lid
are). New art needs those coordinates re-checked, or the motion will land in the
wrong place. Until then, remove that picture's `aliveSrc` line in
src/lib/living-actor-registry.ts and it simply shows the still picture.
"""
import base64, hashlib, io, json, os, re, subprocess, sys, tempfile
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
W1 = 'public/cartilla/art/optimized/workbook/leccion-1'
P1 = 'public/cartilla/art/faithful/leccion-1/wb-p1'
# name -> still picture (relative to repo root). Keep in sync with aliveSrc in the registry.
STILLS = {
    'oso': f'{W1}/oso.svg', 'oveja': f'{W1}/oveja.svg', 'avion': f'{W1}/avion.svg',
    'abanico': f'{W1}/abanico.svg', 'elefante': f'{W1}/elefante.svg', 'iman': f'{W1}/iman.svg',
    'olla': f'{W1}/olla.svg', 'abeja': f'{P1}/abeja.svg',
}

def still_png(path):
    data = open(path, 'rb').read()
    if path.endswith('.svg'):
        m = re.search(rb'data:image/(?:png|webp|jpeg);base64,([A-Za-z0-9+/=]+)', data)
        if not m: sys.exit(f'{path}: no embedded picture found (expected <image href="data:image/png;base64,...">)')
        data = base64.b64decode(m.group(1))
    return Image.open(io.BytesIO(data)).convert('RGBA')

def main(names):
    names = names or list(STILLS)
    man_path = os.path.join(HERE, 'manifest.json')
    manifest = json.load(open(man_path)) if os.path.exists(man_path) else {}
    with tempfile.TemporaryDirectory() as src, tempfile.TemporaryDirectory() as out:
        for n in names:
            if n not in STILLS: sys.exit(f'unknown picture: {n} (known: {", ".join(STILLS)})')
            still_png(os.path.join(ROOT, STILLS[n])).save(f'{src}/{n}.png')
        subprocess.run([sys.executable, os.path.join(HERE, 'all.py'), out, *names], check=True,
                       env={**os.environ, 'LIVING_SRC': src})
        for n in names:
            still = STILLS[n]; alive = still[:-len(os.path.splitext(still)[1])] + '-alive.svg'
            os.replace(f'{out}/{n}-alive.svg', os.path.join(ROOT, alive))
            manifest[n] = {'still': still, 'alive': alive,
                           'stillSha256': hashlib.sha256(open(os.path.join(ROOT, still), 'rb').read()).hexdigest()}
            print(f'rebuilt {alive}')
    json.dump(dict(sorted(manifest.items())), open(man_path, 'w'), indent=2); open(man_path, 'a').write('\n')

if __name__ == '__main__':
    main(sys.argv[1:])
