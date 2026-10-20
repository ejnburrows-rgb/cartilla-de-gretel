from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import zipfile,json
r=Path(__file__).resolve().parent;repo=r.parents[3];out=r/'comparisons';out.mkdir(exist_ok=True)
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',24)
items=[]
for size in ['1440x900','1280x800','390x844','844x390']:
 for n,ps in [(19,[67,68,69,70]),(20,[71,72,73,74]),(21,[75,76,77,78]),(22,[79,80,81,82]),(23,[83,84,85]),(24,[88,89,90])]:
  for p in ps:
   name=f'{size}-L{n}-p{p}';a=r/'final'/f'{name}.png'
   if size=='844x390':a=r/'final'/f'{name}-full.png'
   if not a.exists():continue
   c=Image.new('RGB',(1700,1100),'#f4efec');d=ImageDraw.Draw(c);d.text((30,20),f'Lesson {n} / page {p} / {size}',font=f,fill='#251f21');d.text((30,65),'Original workbook',font=f,fill='#585254');d.text((710,65),'Draft interactive page - not installed live',font=f,fill='#585254')
   for x,path,sz in [(30,repo/f'public/cartilla/art/source/workbook/page-{p:03}.jpg',(620,930)),(710,a,(960,930))]:
    im=Image.open(path).convert('RGB');im.thumbnail(sz);c.paste(im,(x,110))
   d.text((30,1060),'No new pictures. Interactive layout differs from the printed writing lines.',font=f,fill='#585254');dest=out/f'{name}.jpg';c.save(dest,quality=65);items.append(dest)
summary=Image.new('RGB',(1700,1100),'white');d=ImageDraw.Draw(summary)
lines=['Lessons 19-24 / consolidated draft review','22 available workbook pages / four screen sizes','Pages 86-87 remain BLOCKED: missing original scans.','The original workbook has no subject pictures on these pages.','No pictures, audio, canonical text or derived exercises changed.','Full-width cream page, normal Listo and color controls.','Portrait uses short trace/write pads to fit; desktop pads are larger.','Sideways phone scrolls vertically, with navigation after the content.','Trace cards repeat canonical writing regions; unsupported letters use freehand.','No exact wide mockup approval claimed. Review before any live integration.','Checks and per-page status are in README.md and ledger.md.','Nothing merged, deployed or opened as a pull request.']
for i,t in enumerate(lines):d.text((50,55+i*72),t,font=f,fill='#251f21')
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.utils import ImageReader
pdf=Canvas(str(r/'lane-c-review.pdf'),pagesize=(1020,660))
pdf.drawImage(ImageReader(summary),0,0,width=1020,height=660);pdf.showPage()
for item in items:
 pdf.drawImage(str(item),0,0,width=1020,height=660);pdf.showPage()
pdf.save()
for size in ['1440x900','1280x800','390x844','844x390']:
 ims=sorted((r/'final').glob(size+'-L*-p*.png'));ims=[x for x in ims if x.stem.split('-')[-1].startswith('p')]
 for k in range(0,len(ims),6):
  c=Image.new('RGB',(1500,1200),'white');d=ImageDraw.Draw(c)
  for i,x in enumerate(ims[k:k+6]):
   im=Image.open(x);im.thumbnail((490,555));xx=i%3*500;yy=i//3*600;c.paste(im,(xx,yy+25));d.text((xx+8,yy+5),x.name,fill='black')
  c.save(r/f'contact-{size}-{k//6+1}.jpg',quality=88)
with zipfile.ZipFile(r/'lane-c-evidence.zip','w',zipfile.ZIP_DEFLATED) as z:
 for folder in ['logs']:
  for p in (r/folder).glob('*'):z.write(p,str(p.relative_to(r)))
 for p in r.glob('*.md'):z.write(p,p.name)
 for p in r.glob('contact-*.jpg'):z.write(p,p.name)
 for p in r.glob('baseline-final-*.jpg'):z.write(p,p.name)
 for p in (r/'final').glob('metrics-consolidated.json'):z.write(p,'metrics-consolidated.json')
print('comparisons',len(items),'PDF bytes',(r/'lane-c-review.pdf').stat().st_size,'ZIP bytes',(r/'lane-c-evidence.zip').stat().st_size)
