"""Build matched-scale source/browser comparisons; screenshots must already exist."""
from pathlib import Path
from PIL import Image, ImageDraw
import json, hashlib, shutil, zipfile
root=Path(__file__).resolve().parents[1]
proof=root/'docs/proofs/lane-b-2026-10-20'
run=proof/'round-22'
package=root/'output/Lane_B_Proof'
package.mkdir(parents=True,exist_ok=True)
for name in ['side-by-sides','originals','phone','tests','scripts','source-provenance']:(package/name).mkdir(exist_ok=True)
rows=[]
for n in range(23,67):
 lesson=8+(n-23)//4
 original=root/f'public/cartilla/art/source/workbook/page-{n:03}.jpg'
 actual=run/f'page-{n:03}-390x844-paper.png'
 canvas=Image.new('RGB',(1000,670),'#e9ece7');d=ImageDraw.Draw(canvas)
 d.text((15,10),f'Lesson {lesson} / page {n} | ORIGINAL SCAN',fill='#152a23')
 d.text((515,10),'ACTUAL CHROMIUM | phone 390 x 844',fill='#152a23')
 for x,p in [(15,original),(515,actual)]:
  im=Image.open(p).convert('RGB').resize((470,608),Image.Resampling.LANCZOS);canvas.paste(im,(x,38))
 canvas.save(package/f'side-by-sides/page-{n:03}.jpg',quality=92)
 shutil.copy(original,package/'originals'/original.name)
 shutil.copy(actual,package/'phone'/actual.name)
 screen=run/f'page-{n:03}-390x844-screen.png';shutil.copy(screen,package/'phone'/screen.name)
 rows.append(f'<article id="p{n}"><h2>Lesson {lesson} · page {n}</h2><a href="side-by-sides/page-{n:03}.jpg"><img loading="lazy" src="side-by-sides/page-{n:03}.jpg" alt="Original left; actual browser page {n} right"></a></article>')
for lesson in range(8,19):
 sheet=Image.new('RGB',(1600,1072),'white')
 for i in range(4):
  n=23+(lesson-8)*4+i
  im=Image.open(package/f'side-by-sides/page-{n:03}.jpg').resize((800,536),Image.Resampling.LANCZOS)
  sheet.paste(im,((i%2)*800,(i//2)*536))
 sheet.save(package/f'side-by-sides/lesson-{lesson:02}.jpg',quality=92)
for p in run.iterdir():
 if p.suffix in ['.json','.log'] or (p.suffix=='.png' and '390x844-' not in p.name):shutil.copy(p,package/'tests'/p.name)
for p in ['capture-lane-b.mjs','verify-lane-b.mjs','package-lane-b-proof.py','measure-lane-b-source.py','build-lane-b-source-font.py','lane_b_source_contours.py','lane_b_source_activities.py']:shutil.copy(root/'scripts'/p,package/'scripts'/p)
nav=' '.join(f'<a href="#p{n}">{n}</a>' for n in range(23,67))
(package/'index.html').write_text('''<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Lane B source/browser proof</title><style>body{font:16px system-ui;background:#f3f4ef;color:#18372c;margin:20px auto;max-width:1100px;padding:0 12px}img{width:100%;height:auto}nav{display:flex;gap:10px;flex-wrap:wrap}article{margin:36px 0}a{color:#12675b}h2{font-size:20px}</style><h1>Lane B · Lessons 8–18 · pages 23–66</h1><p>Original scan left; actual live page rendered in Chromium right. Both shown at the same scale. Open README.md for the evidence limits. No scan is used as the live page background.</p><nav>'''+nav+'</nav>'+''.join(rows))
checks=json.loads((run/'capture-390x844.json').read_text())
assert len(checks)==44 and all(not r['errors'] for r in checks)
assert all(r['subjectImages']==0 and r['documentWidth']<=r['viewportWidth']+1 and r['fontLoaded'] for r in checks)
interactions=json.loads((run/'interactions.json').read_text())
assert len(interactions)==20 and all(r['pass'] for r in interactions)
source_files=['src/components/cartilla/FaithfulPageRenderer.tsx', 'src/components/cartilla/PageFrame.tsx', 'src/styles/workbook-middle-lessons.css', 'src/lib/__tests__/workbook-middle-source.test.ts', 'src/data/workbook-middle-source-geometry.json', 'src/data/workbook-source-font-400.json', 'src/data/workbook-source-font-700.json', 'public/fonts/cartilla-source-400.woff', 'public/fonts/cartilla-source-700.woff', 'public/fonts/cartilla-source-PROVENANCE.md', 'scripts/measure-lane-b-source.py', 'scripts/build-lane-b-source-font.py', 'scripts/lane_b_source_contours.py', 'scripts/capture-lane-b.mjs', 'scripts/verify-lane-b.mjs', 'scripts/package-lane-b-proof.py', 'src/cartilla/interactions/SyllableWordCircle.tsx', 'src/components/cartilla/InteractivePageExercises.tsx', 'src/components/cartilla/WorkbookWritingResponse.tsx', 'src/lib/workbook-source-geometry.ts', 'scripts/lane_b_source_activities.py', 'src/cartilla/interactions/DibujaHost.tsx', 'src/cartilla/interactions/faithfulAdapters.tsx', 'src/lib/use-fit-to-page.ts', 'src/cartilla/interactions/__tests__/SyllableWordCircle.test.tsx', 'public/fonts/workbook-gothic-400.woff', 'public/fonts/workbook-gothic-700.woff', 'src/data/page-layouts.json', 'src/data/book-transcription/lessons-08-24.json']
hashes={path:hashlib.sha256((root/path).read_bytes()).hexdigest() for path in source_files}
(package/'tested-source-sha256.json').write_text(json.dumps(hashes,indent=2))
print(package)

for path in ['src/data/workbook-middle-source-geometry.json','src/data/workbook-source-font-400.json','src/data/workbook-source-font-700.json','public/fonts/cartilla-source-PROVENANCE.md']:
 shutil.copy(root/path,package/'source-provenance'/Path(path).name)
