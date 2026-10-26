"""Build a partial source-derived typeface from OCR-verified printed glyphs.
No new book text is inferred: every sampled word must match canonical source text.
Unobserved characters retain the existing font fallback.
"""
from pathlib import Path
import csv,json,re,subprocess,unicodedata,statistics,importlib.util
import numpy as np
from PIL import Image
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.svgLib.path import parse_path
from fontTools.pens.transformPen import TransformPen
root=Path(__file__).resolve().parents[1]
from lane_b_source_contours import mask_path
layouts=json.loads((root/'src/data/page-layouts.json').read_text())['pages']
cache=Path('/tmp/lane-b-font-analysis');cache.mkdir(exist_ok=True)
def normal(text):return ''.join(c for c in unicodedata.normalize('NFD',text) if unicodedata.category(c)=='Ll' or unicodedata.category(c)=='Lu').lower()
def letters(text):return ''.join(c for c in text if unicodedata.category(c).startswith('L'))
samples={False:{},True:{}}
equations={False:[],True:[]}
for number in range(23,67):
 image=root/f'public/cartilla/art/source/workbook/page-{number:03}.jpg';stem=cache/f'page-{number:03}'
 if not stem.with_suffix('.tsv').exists():subprocess.run(['tesseract',str(image),str(stem),'--psm','11','tsv','makebox'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 a=np.array(Image.open(image).convert('RGB')).astype(int);height=a.shape[0]
 chars=[]
 for line in stem.with_suffix('.box').read_text().splitlines():
  fields=line.split()
  if len(fields)!=6:continue
  c,x0,y0,x1,y1,_=fields
  if len(c)!=1 or not c.isalpha():continue
  chars.append((c,int(x0),height-int(y1),int(x1),height-int(y0)))
 regular=[];bold=[]
 for region in layouts[str(number)]['regions']:
  target=bold if region['regionType'] in ['title','syllable-bubble','sentence-line'] else regular
  text=' '.join([region.get('text',''),*region.get('sentences',[])])
  if region['regionType']=='syllable-match':
   bold.extend([region.get('syllable','')]);text+=' '+' '.join(w['word'] for row in region.get('matchRows',[]) for w in row)
  for item in region.get('fillItems',[]):text+=' '+item['wordBox']+' '+' '.join(c['text'] for c in item['choices'])
  if region['regionType']!='writing-line':target.extend(letters(w) for w in re.split(r'[\s·]+',text) if letters(w))
 boldnorms={normal(w) for w in bold}
 bold.extend(w for w in regular if normal(w) in boldnorms)
 lookup={False:{},True:{}}
 for weight,words in [(False,regular),(True,bold)]:
  for w in words:lookup[weight].setdefault(normal(w),[]).append(w)
 for row in csv.DictReader(stem.with_suffix('.tsv').open(),delimiter='\t'):
  if row['level']!='5' or float(row['conf'])<65:continue
  word=letters(row['text']);x0,y0,w,h=map(int,[row['left'],row['top'],row['width'],row['height']]);cx=x0+w/2;cy=y0+h/2
  family=(number-23)%4
  isbold=(family==2 and cy<320) or (family==2 and 600<cy<760) or (family==1 and cx<300 and cy>180)
  if family==0 and not(cy<170 or 550<cy<690):continue
  if family==2 and cy>730 and normal(word) in boldnorms:isbold=True
  matches=lookup[isbold].get(normal(word),[])
  expected=next((w for w in matches if w==word),None)
  if not expected:expected=next((w for w in matches if len(w)==len(word) and all(a.isupper()==b.isupper() for a,b in zip(w,word))),None)
  if not expected or len(word)!=len(expected):continue
  if row['text']!=word or (len(word)<2 and word not in ['y','Y']):continue
  patch=a[y0:y0+h,x0:x0+w]
  ink=(patch.max(axis=2)<155)&(patch.max(axis=2)-patch.min(axis=2)<45)
  if isbold:
   pr,pg,pb=patch.transpose(2,0,1)
   ink|=(pg-pr>25)&(pb-pr>15)&(pg<220)
  from scipy import ndimage
  labels,_=ndimage.label(ink);sizes=np.bincount(labels.ravel());sizes[0]=0;ink&=sizes[labels]>=3
  columns=ink.any(axis=0);d=np.diff(np.r_[False,columns,False].astype(int));starts=np.where(d==1)[0];ends=np.where(d==-1)[0]
  glyph_pieces=None
  if len(starts)!=len(expected):
   if expected!='Yo':continue
   parts=[]
   for label,sl in enumerate(ndimage.find_objects(labels),1):
    if sl and sizes[label]>12 and sl[0].stop-sl[0].start>8 and sl[1].stop-sl[1].start>3:parts.append((sl,labels==label))
   if len(parts)!=2:continue
   parts.sort(key=lambda p:p[0][1].start)
   boxes=[(c,sl[1].start+x0,sl[0].start+y0,sl[1].stop+x0,sl[0].stop+y0) for c,(sl,m) in zip(expected,parts)]
   glyph_pieces=[m for sl,m in parts]
  else:
   boxes=[]
   for c,left,right in zip(expected,starts,ends):
    yy,xx=np.where(ink[:,left:right]);boxes.append((c,int(left+x0),int(yy.min()+y0),int(right+x0),int(yy.max()+y0+1)))
  baseline_values=[b[4] for c,b in zip(expected,boxes) if c.lower() not in 'gjpqy']
  xheight_values=[b[4]-b[2] for c,b in zip(expected,boxes) if c in 'aemnorsuvxz']
  if not baseline_values and expected in ['y','Y']:
   baseline_values=[boxes[0][2]+(boxes[0][4]-boxes[0][2])*(.77 if expected=='y' else 1)]
   xheight_values=[(boxes[0][4]-boxes[0][2])*.77]
  if not baseline_values:continue
  if not xheight_values:xheight_values=[(b[4]-b[2])*.75 for c,b in zip(expected,boxes) if c.isupper()]
  if not xheight_values:continue
  baseline=statistics.median(baseline_values);xh=statistics.median(xheight_values)
  if xh<10:continue
  scale=600/xh
  equations[isbold].append((expected,(boxes[-1][3]-boxes[0][1]+2)*scale))
  for index,(c,bbox) in enumerate(zip(expected,boxes)):
   _,left,top,right,bottom=bbox
   if bottom-top<5:continue
   if c.lower() in 'abdegmnopquv' and (right-left)/(xh)<.65:continue
   glyph_ink=glyph_pieces[index] if glyph_pieces else ink
   mask=glyph_ink[top-y0:bottom-y0,left-x0:right-x0].copy()
   # Reject samples whose ink is clipped or belongs to a neighbouring word.
   if mask.sum()<8:continue
   score=float(row['conf'])+min(xh,45)*2-len(expected)*.15
   samples[isbold].setdefault(c,[]).append({'score':score,'page':number,'word':expected,'box':[left,top,right,bottom],'baseline':baseline,'scale':scale,'mask':mask,'advance':(right-left+2)*scale})
# The page-25 sight frame is a verified two-letter word in the canonical data.
# It is too small/boxed for OCR, so use its two ink components directly.
assert next(r['text'] for r in layouts['25']['regions'] if r['regionType']=='sentence-line')=='yo'
a=np.array(Image.open(root/'public/cartilla/art/source/workbook/page-025.jpg').convert('RGB')).astype(int)
patch=a[640:760,280:540];ink=(patch.max(axis=2)<155)&(patch.max(axis=2)-patch.min(axis=2)<45)
labels,_=ndimage.label(ink);sizes=np.bincount(labels.ravel());sizes[0]=0
parts=[]
for label,sl in enumerate(ndimage.find_objects(labels),1):
 if sl and sizes[label]>20 and sl[0].stop-sl[0].start>10 and sl[1].stop-sl[1].start>3:parts.append((sl,labels==label))
if len(parts)==2:
 parts.sort(key=lambda p:p[0][1].start);baseline=parts[1][0][0].stop+640;xh=parts[1][0][0].stop-parts[1][0][0].start;scale=600/xh
 for c,(sl,m) in zip('yo',parts):
  box=[sl[1].start+280,sl[0].start+640,sl[1].stop+280,sl[0].stop+640]
  samples[True].setdefault(c,[]).append({'score':200,'page':25,'word':'yo','box':box,'baseline':baseline,'scale':scale,'mask':m[sl].copy(),'advance':(box[2]-box[0]+2)*scale})
for weight,isbold in [(400,False),(700,True)]:
 chosen={c:max(candidates,key=lambda x:x['score']) for c,candidates in samples[isbold].items()}
 # Learn advance widths from whole source words, rather than guessing tracking.
 from scipy.optimize import lsq_linear
 alphabet=sorted(chosen);matrix=[];widths=[]
 for word,width in equations[isbold]:
  if all(c in chosen for c in word):matrix.append([word.count(c) for c in alphabet]);widths.append(width)
 advance={c:chosen[c]['advance'] for c in alphabet}
 if len(matrix)>len(alphabet):
  a=np.array(matrix,dtype=float);b=np.array(widths)
  initial=np.array([advance[c] for c in alphabet])
  minimum=np.array([(chosen[c]['box'][2]-chosen[c]['box'][0]+1)*chosen[c]['scale'] for c in alphabet])
  bounds=(minimum,np.maximum(initial*1.2,minimum+1))
  fit=lsq_linear(a,b,bounds=bounds)
  for c,value in zip(alphabet,fit.x):advance[c]=float(value)
  residual=np.abs(a@fit.x-b)/b
  print(weight,'word_width_median_error',round(float(np.median(residual)),4),'words',len(widths))
 glyphs={'.notdef':TTGlyphPen(None).glyph(),'space':TTGlyphPen(None).glyph()};metrics={'.notdef':(500,0),'space':(300,0)};cmap={32:'space'};manifest={}
 for c,sample in sorted(chosen.items()):
  name=f'uni{ord(c):04X}';pen=TTGlyphPen(None);left,top,right,bottom=sample['box'];scale=sample['scale'];baseline=sample['baseline']
  transform=TransformPen(pen,(scale,0,0,-scale,scale,(baseline-top)*scale))
  parse_path(mask_path(sample['mask']),transform)
  glyphs[name]=pen.glyph();metrics[name]=(round(advance[c]),round(scale));cmap[ord(c)]=name
  manifest[c]={key:sample[key] for key in ['page','word','box','baseline','scale']}
 fb=FontBuilder(1000,isTTF=True);fb.setupGlyphOrder(list(glyphs));fb.setupCharacterMap(cmap);fb.setupGlyf(glyphs);fb.setupHorizontalMetrics(metrics);fb.setupHorizontalHeader(ascent=1000,descent=-300)
 fb.setupNameTable({'familyName':'Cartilla Source','styleName':'Regular' if weight==400 else 'Bold','uniqueFontIdentifier':f'CartillaSource-{weight}-source-scans','fullName':f'Cartilla Source {weight}','psName':f'CartillaSource-{weight}','version':'Version 1.0'})
 fb.setupOS2(sTypoAscender=1000,sTypoDescender=-300,usWinAscent=1100,usWinDescent=350,sxHeight=600,sCapHeight=800,usWeightClass=weight,fsSelection=0x20 if weight==700 else 0x40);fb.setupHead(macStyle=1 if weight==700 else 0);fb.setupPost();fb.setupMaxp();fb.font.flavor='woff';fb.save(root/f'public/fonts/cartilla-source-{weight}.woff')
 (root/f'src/data/workbook-source-font-{weight}.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 print(weight,len(chosen),''.join(sorted(chosen)))
