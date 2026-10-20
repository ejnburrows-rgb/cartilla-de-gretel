from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
p=Path('docs/mockups/platform-C-20261020'); f='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
font=lambda n:ImageFont.truetype(f,n)
pages=[]
for pg in [69,72]:
 for o in [1,2]:
  c=Image.new('RGB',(2200,900),'#f4efec');d=ImageDraw.Draw(c)
  d.text((42,25),f'{o}. '+('Learning studio' if o==1 else 'Focus mode')+f' | Printed page {pg}',font=font(32),fill='#251f21')
  for x,label,path in [(40,'CURRENT DRAFT',f'docs/proofs/workbook-20261020/C/final/1440x900-L{19 if pg==69 else 20}-p{pg}.png'),(1120,f'OPTION {o} - DRAFT ONLY',p/f'renders/option-{o}-p{pg}-1440x900.png')]:
   d.text((x,93),label,font=font(18),fill='#585254');im=Image.open(path).convert('RGB');im.thumbnail((1040,650));c.paste(im,(x,135))
  d.text((42,822),'Same source words. No new pictures or audio. Design study only, not installed live.',font=font(20),fill='#585254')
  c.save(p/f'comparison-p{pg}-option-{o}.jpg',quality=92);pages.append(c)
for pg in [69,72]:
 c=Image.new('RGB',(1320,1600),'#f4efec');d=ImageDraw.Draw(c)
 d.text((30,22),f'Phone comparison | Printed page {pg}',font=font(28),fill='#251f21')
 for x,label,path in [(30,'CURRENT',f'docs/proofs/workbook-20261020/C/final/390x844-L{19 if pg==69 else 20}-p{pg}.png'),(465,'1. STUDIO',p/f'renders/option-1-p{pg}-390x844.png'),(900,'2. FOCUS',p/f'renders/option-2-p{pg}-390x844.png')]:
  d.text((x,80),label,font=font(21),fill='#585254');im=Image.open(path).convert('RGB');im.thumbnail((390,1410));c.paste(im,(x,120))
 c.save(p/f'comparison-mobile-p{pg}.jpg',quality=92);pages.append(c)
pages[0].save(p/'platform-options-review.pdf',save_all=True,append_images=pages[1:],resolution=144)
# Compact overview includes every responsive capture, for direct visual screening.
c=Image.new('RGB',(1600,2200),'#e7e7e7');d=ImageDraw.Draw(c)
for i,path in enumerate(sorted((p/'renders').glob('*.png'))):
 im=Image.open(path).convert('RGB');im.thumbnail((380,480));x=i%4*400;y=i//4*550;d.text((x+8,y+8),path.stem,font=font(12),fill='black');c.paste(im,(x,y+35))
c.save(p/'responsive-contact.jpg',quality=92)
