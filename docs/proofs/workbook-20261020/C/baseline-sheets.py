from pathlib import Path
from PIL import Image,ImageDraw
r=Path(__file__).resolve().parent
for size in ['1440x900','1280x800','390x844','844x390']:
 ims=sorted((r/'final').glob(size+'-L*-p*.png'));ims=[x for x in ims if x.stem.split('-')[-1].startswith('p')]
 for k in range(0,len(ims),4):
  c=Image.new('RGB',(1600,1250),'white');d=ImageDraw.Draw(c)
  for i,x in enumerate(ims[k:k+4]):
   xx=i%2*800;yy=i//2*625;d.text((xx+8,yy+5),x.name+' / cream baseline left, draft right',fill='black')
   for j,folder in enumerate(['before','final']):
    path=r/folder/x.name
    if size=='844x390':path=path.with_name(path.stem+'-full.png')
    if not path.exists():continue
    im=Image.open(path);im.thumbnail((390,590));c.paste(im,(xx+j*400,yy+25))
  c.save(r/f'baseline-final-{size}-{k//4+1}.jpg',quality=75)
