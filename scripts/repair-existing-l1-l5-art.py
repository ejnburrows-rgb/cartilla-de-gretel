"""Recover intact lesson drawings from the repository's existing source pages."""
import hashlib
import io
import json
import os
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'public/cartilla/art'
# Coordinates were inspected on 760px teacher / 900px student page previews.
# Rectangles exclude printed answer labels and adjacent exercise cells.
TEACHER = {
 'vocal-a/abanico': (5,760,(53,490,225,663)),
 'vocal-a/alas': (5,760,(30,780,245,950)),
 'vocal-a/anillo': (5,760,(300,492,465,644)),
 'vocal-a/arana': (5,760,(548,486,690,661)),
 'vocal-o/olla': (4,760,(50,490,217,630)),
 'vocal-o/oveja': (4,760,(542,480,710,636)),
 'vocal-o/oso': (4,760,(48,744,215,941)),
 'vocal-o/oreja': (4,760,(313,743,442,940)),
 'vocal-o/ocho': (4,760,(548,740,715,938)),
 'vocal-e/elefante': (6,760,(42,480,222,662)),
 'vocal-e/espejo': (6,760,(280,475,469,660)),
 'vocal-e/estrella': (6,760,(38,745,219,958)),
 'vocal-e/erizo': (6,760,(275,740,470,960)),
 'vocal-e/escalera': (6,760,(536,744,705,962)),
 'vocal-i/iman': (7,760,(50,486,226,651)),
 'vocal-i/indio': (7,760,(540,442,697,663)),
 'vocal-i/insecto': (7,760,(43,756,231,933)),
 'vocal-i/isla': (7,760,(270,752,480,949)),
 'vocal-u/uno': (8,760,(54,429,230,612)),
 'vocal-u/uvas': (8,760,(296,428,474,610)),
 'vocal-u/unicornio': (8,760,(40,680,242,887)),
 'vocal-u/uniforme': (8,760,(325,683,451,879)),
 'leccion-1/aguila': (8,760,(548,422,718,596)),
 'leccion-1/arco': (3,753,(428,853,552,987)),
}
WORKBOOK = {
 'leccion-1/ojos-pagina-1': (3,900,(39,920,195,1005)),
 'leccion-1/manzana': (4,900,(531,211,675,368)),
 'leccion-1/libro': (4,900,(706,245,870,349)),
 'leccion-19-c/casa': (4,900,(327,375,493,532)),
 'vocal-a/arbol': (4,900,(528,375,669,532)),
 'leccion-1/taza': (4,900,(344,580,449,667)),
 'leccion-1/pera': (4,900,(703,539,873,697)),
 'leccion-1/pajaro': (4,900,(330,703,493,858)),
 'leccion-1/carro': (4,900,(699,721,872,852)),
 'leccion-1/dulce': (4,900,(697,871,871,1024)),
 'leccion-1/maiz': (3,900,(222,890,386,1046)),
 'vocal-e/escuela': (3,900,(398,561,568,714)),
 'vocal-a/avion': (3,900,(209,403,389,539)),
 'vocal-i/iglesia': (5,900,(39,274,234,474)),
 'vocal-a/ardilla': (9,900,(575,603,755,764)),
 'leccion-1/ojos': (9,900,(32,836,204,909)),
 'vocal-i/iguana': (15,900,(394,267,566,393)),
 'vocal-i/invierno': (15,900,(581,423,752,591)),
 'leccion-1/pez': (15,900,(209,245,383,407)),
 'vocal-i/igual': (15,900,(242,824,341,899)),
 'vocal-o/ola': (15,900,(42,603,199,774)),
}

def sha(path):
 return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
 manifest_path = ART / 'faithful/manifest.json'
 manifest = json.loads(manifest_path.read_text())
 by_src = {e['src']: e for e in manifest}
 proof = []
 for kind, entries in [('teacher', TEACHER), ('workbook', WORKBOOK)]:
  for slug,(page,width,rect) in entries.items():
   source = ART / (f'hd/flipchart/page-{page:03}.jpg' if kind=='teacher' else f'restored/workbook/page-{page:03}.png')
   im = Image.open(source).convert('RGB')
   box = tuple(round(v*im.width/width) for v in rect)
   crop = im.crop(box)
   dest = ART / f'faithful/{slug}.webp'
   encoded = io.BytesIO()
   crop.save(encoded, 'WEBP', lossless=True, exact=True)
   temp = dest.with_suffix('.webp.tmp')
   with temp.open('wb') as handle:
    handle.write(encoded.getvalue())
    handle.flush()
    os.fsync(handle.fileno())
   temp.replace(dest)
   assert Image.open(dest).convert('RGB').tobytes() == crop.tobytes()
   src = '/cartilla/art/faithful/'+slug+'.webp'
   e = by_src.get(src)
   if e is None:
    e = {'slug':slug.split('/')[-1], 'word':slug.split('/')[-1], 'src':src}
    manifest.append(e)
   e.update(source=str(source.relative_to(ROOT)),cropBox=[box[0],box[1],box[2]-box[0],box[3]-box[1]],sourceSha256=sha(source),provenanceStatus='VERIFIED-EXACT-SOURCE-CROP-2026-09-08')
   if kind=='teacher':
    e['sourceFlipchartPage']=page
    e['note']='Lossless crop of the existing authentic teacher page; complete drawing, no answer label, recoloring or generative edits.'
   else:
    e.pop('sourceFlipchartPage',None)
    e['teacherCounterpart']='absent-after-62-page-review'
    e['note']='Exact student drawing. All 62 teacher pages visually reviewed; differently drawn counterparts rejected. Source pixels retained unchanged.'
   proof.append({'src':src,'kind':kind,'source':e['source'],'sourceSha256':e['sourceSha256'],'cropBox':e['cropBox'],'outputSha256':sha(dest),'pixelExact':True})
 manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 (ROOT/'repaired-art-results.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n')
 print(f'Recovered {len(proof)} intact source crops; all lossless pixel comparisons passed.')

if __name__=='__main__':main()
