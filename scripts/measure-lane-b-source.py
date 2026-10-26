"""Measure source sidebar silhouettes; no source image pixels are changed."""
from pathlib import Path
import json,hashlib,csv,re
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
import numpy as np
from PIL import Image
from scipy import ndimage
from scipy.signal import find_peaks
root=Path(__file__).resolve().parents[1]
from lane_b_source_contours import simplify, mask_path
from lane_b_source_activities import measure_activities

layouts=json.loads((root/'src/data/page-layouts.json').read_text())['pages']
fonts={weight:TTFont(root/f'public/fonts/cartilla-source-{weight}.woff') for weight in [400,700]}
fallbacks={400:TTFont(root/'public/fonts/source/URWGothic-Book.otf'),700:TTFont(root/'public/fonts/source/URWGothic-Demi.otf')}
def word_bounds(text,weight=400):
 x=0;bounds=[]
 for c in text:
  font=fonts[weight] if ord(c) in fonts[weight].getBestCmap() else fallbacks[weight]
  name=font.getBestCmap().get(ord(c),'space');pen=BoundsPen(font.getGlyphSet());font.getGlyphSet()[name].draw(pen)
  if pen.bounds:
   a,b,c0,d=pen.bounds;bounds.append((a+x,b,c0+x,d))
  x+=font['hmtx'].metrics[name][0]
 return (min(b[0] for b in bounds),min(b[1] for b in bounds),max(b[2] for b in bounds),max(b[3] for b in bounds))
pages={}
for n in range(23,67):
 file=root/f'public/cartilla/art/source/workbook/page-{n:03}.jpg'
 im=np.array(Image.open(file).convert('RGB')).astype(int);h,w=im.shape[:2];r,g,b=im.transpose(2,0,1)
 side=np.arange(w)[None,:]>(w*.84) if n%2 else np.arange(w)[None,:]<(w*.16)
 mask=(g-r>24)&(b-r>15)&(g<220)&side
 labels,count=ndimage.label(mask);sizes=np.bincount(labels.ravel());sizes[0]=0;component=labels==sizes.argmax()
 ys=np.where(component.any(axis=1))[0];left=[];right=[]
 for y in ys:
  xs=np.where(component[y])[0];left.append([int(xs.min()),int(y)]);right.append([int(xs.max()),int(y)])
 points=simplify(left)+simplify(right[::-1]);path='M'+' L'.join(f'{x},{y}' for x,y in points)+' Z'
 color=np.median(im[component],axis=0).astype(int);color='#'+''.join(f'{v:02x}' for v in color)
 # Original page-number diamond, restricted to the footer/edge region.
 pale=(g-r>7)&(r>125)&(g>150)&(b>130)&side&(np.arange(h)[:,None]>h*.92)
 labs,_=ndimage.label(pale);sizes=np.bincount(labs.ravel());sizes[0]=0
 yy,xx=np.where(labs==sizes.argmax());diamond={'x':round(float((xx.min()+xx.max())/2/w*100),3),'y':round(float((yy.min()+yy.max())/2/h*100),3),'size':round(float(max(xx.max()-xx.min(),yy.max()-yy.min())/w*100/2**.5),3)}
 entry={'wavePath':path,'waveColor':color,'diamond':diamond,'scanSha256':hashlib.sha256(file.read_bytes()).hexdigest()}
 if (n-23)%4==0:
  neutral=((im.max(axis=2)-im.min(axis=2)<23)&(im.max(axis=2)<210))|((im.max(axis=2)<140)&(im.max(axis=2)-im.min(axis=2)<55))
  core_labels,core_count=ndimage.label(im.max(axis=2)<105)
  protected=np.zeros((h,w),bool)
  for label,slice_ in enumerate(ndimage.find_objects(core_labels),1):
   if slice_ and slice_[1].start<180 and slice_[1].stop<190 and slice_[0].start>140 and slice_[0].stop<550 and slice_[0].stop-slice_[0].start>18:
    protected|=core_labels==label
  protected=ndimage.binary_dilation(protected,iterations=2)
  score=ndimage.gaussian_filter1d(neutral[:,200:780].sum(axis=1).astype(float),3)
  peaks,_=find_peaks(score[135:550],distance=40,prominence=6);peaks=peaks+135
  # Dark solid lines are interleaved with lighter dashed midlines.
  if len(peaks)!=6:
   # Dashed rules can be too chromatic for the neutral-ink classifier.
   broad=(im.max(axis=2)<170)&(im.max(axis=2)-im.min(axis=2)<40)
   score=ndimage.gaussian_filter1d(broad[:,200:780].sum(axis=1).astype(float),3)
   peaks,_=find_peaks(score[135:550],distance=40,prominence=6);peaks=peaks+135
  assert len(peaks)==6,(n,peaks)
  rules=[]
  for i,peak in enumerate(peaks):
   xs=[];ys=[]
   for x in range(180,800):
    lo=max(0,int(peak)-18);hi=int(peak)+19
    values=im[lo:hi,x].max(axis=1)
    y=int(values.argmin())+lo
    if values.min()<195:xs.append(x);ys.append(y)
   xs=np.array(xs);ys=np.array(ys);a,b0=np.polyfit(xs,ys,1)
   for _ in range(3):
    keep=np.abs(ys-(a*xs+b0))<2.5;a,b0=np.polyfit(xs[keep],ys[keep],1)
   ends=[]
   for x in range(10,850):
    y=int(round(a*x+b0))
    if np.any((im[y-2:y+3,x].max(axis=1)<200)&(im[y-2:y+3,x].max(axis=1)-im[y-2:y+3,x].min(axis=1)<23)):ends.append(x)
   x1,x2=min(ends),max(ends)
   rules.append({'d':f'M{x1},{a*x1+b0:.2f} L{x2},{a*x2+b0:.2f}','dashed':i in [1,4],'y':round(float(a*450+b0),2)})
   yy=np.arange(h)[:,None];xx=np.arange(w)[None,:]
   neutral&=(np.abs(yy-(a*xx+b0))>2.5)|protected
  models=[]
  for index,(top,bottom) in enumerate([(peaks[0]-45,peaks[2]+40),(peaks[3]-45,peaks[5]+40)]):
   region=np.zeros((h,w),bool);region[max(0,top):bottom,10:180]=True
   mask=neutral&region
   lab,_=ndimage.label(mask);sizes=np.bincount(lab.ravel());mask&=sizes[lab]>=3
   layers=[]
   value=im.mean(axis=2)
   # Cumulative tonal contours retain arrows/numbers without antialias seams.
   for ceiling,tone in [(210,202),(194,183),(176,165),(152,140),(128,114),(96,80),(64,49)]:
    m=mask&(value<ceiling)
    if m.any():layers.append({'fill':f'#{tone:02x}{tone:02x}{tone:02x}','d':mask_path(m)})
   models.append({'layers':layers,'region':f'p{n}-write-'+('U' if index==0 else 'l'),'top':int(top),'bottom':int(bottom)})
  entry['rules']=rules;entry['models']=models
  boxmask=(g-r>14)&(b-r>4)&(im.max(axis=2)-im.min(axis=2)<110)&(np.arange(h)[:,None]>590)&(np.arange(w)[None,:]<820)
  boxlabels,_=ndimage.label(ndimage.binary_closing(boxmask,iterations=2))
  boxes=[(label,sl) for label,sl in enumerate(ndimage.find_objects(boxlabels),1) if sl and sl[1].stop-sl[1].start>600 and sl[0].stop-sl[0].start>250]
  assert len(boxes)==1,(n,boxes)
  label,sl=boxes[0];by,bx=np.where(boxlabels==label)
  x0,x1,y0,y1=bx.min(),bx.max(),by.min(),by.max()
  original_box=boxmask&ndimage.binary_dilation(boxlabels==label,iterations=2)
  color0=np.median(im[original_box],axis=0).astype(int)
  entry['drawing']={'d':mask_path(original_box),'color':'#'+''.join(f'{v:02x}' for v in color0),'left':round(float(x0/w*100),3),'top':round(float(y0/h*100),3),'width':round(float((x1-x0)/w*100),3),'height':round(float((y1-y0)/h*100),3)}

 if (n-23)%4==2:
  title=(im.max(axis=2)<180)&(im.max(axis=2)-im.min(axis=2)<30)
  title&=(np.arange(w)[None,:]>40)&(np.arange(w)[None,:]<255)&(np.arange(h)[:,None]>100)&(np.arange(h)[:,None]<300)
  labs,_=ndimage.label(title);sizes=np.bincount(labs.ravel());sizes[0]=0;title&=sizes[labs]>=4
  entry['titlePath']=mask_path(title)
  words=[w.strip() for w in next(r['text'] for r in layouts[str(n)]['regions'] if r['regionType']=='vocab-grid').split('·')]
  row_count=len(words)//3;placements=[None]*len(words)
  neutral=(im.max(axis=2)<155)&(im.max(axis=2)-im.min(axis=2)<45)
  cached=Path('/tmp/lane-b-font-analysis')/f'page-{n:03}.tsv'
  with cached.open() as f:ocr=list(csv.DictReader(f,delimiter='\t'))
  vocabulary_rows=[row for row in ocr if row['level']=='5' and float(row['conf'])>40 and 335<int(row['top'])<650 and 20<int(row['left'])<790]
  lefts=np.array([int(row['left']) for row in vocabulary_rows]);centres=np.array([np.quantile(lefts,p) for p in [.1,.5,.9]])
  for _ in range(10):
   labels0=np.abs(lefts[:,None]-centres[None,:]).argmin(axis=1)
   centres=np.array([np.median(lefts[labels0==column]) for column in range(3)])
  order=centres.argsort();groups0=[[row for row,label in zip(vocabulary_rows,labels0) if label==column] for column in order]
  boundaries=[30]+[int((max(int(row['left'])+int(row['width']) for row in groups0[column])+min(int(row['left']) for row in groups0[column+1]))/2) for column in range(2)]+[810]
  for column,(x0,x1) in enumerate(zip(boundaries[:-1],boundaries[1:])):
   band=neutral[335:655,x0:x1];active=ndimage.binary_closing(band.sum(axis=1)>2,structure=np.ones(7));labels,_=ndimage.label(active)
   groups=[sl[0] for sl in ndimage.find_objects(labels) if sl and sl[0].stop-sl[0].start>8]
   assert len(groups)==row_count,(n,column,len(groups),row_count)
   for row,sl in enumerate(groups):
    top=sl.start+335-10;bottom=sl.stop+335+4;yy,xx=np.where(neutral[top:bottom,x0:x1])
    left=int(xx.min()+x0);right=int(xx.max()+x0+1);ymin=int(yy.min()+top);ymax=int(yy.max()+top+1)
    index=row*3+column;text=words[index];a0,b0,c0,d0=word_bounds(text)
    font_px=(ymax-ymin)/(d0-b0)*1000;scale_x=(right-left)/((c0-a0)/1000*font_px)
    placements[index]={'text':text,'left':round((left-a0/1000*font_px*scale_x)/w*100,5),'top':round((ymin-(1-d0/1000)*font_px)/h*100,5),'fontSize':round(font_px/w*100,5),'scaleX':round(scale_x,5),'sourceBox':[left,ymin,right,ymax]}
  entry['vocabulary']=placements
  cached=Path('/tmp/lane-b-font-analysis')/f'page-{n:03}.tsv'
  if cached.exists():
   text_rows=[r for r in csv.DictReader(cached.open(),delimiter='\t') if r['level']=='5' and float(r['conf'])>45 and 740<int(r['top'])<1120 and 0<int(r['left'])<800]
   anchors=sorted([r for r in text_rows if int(r['left'])<200],key=lambda r:int(r['top']))
   first=anchors[0];tops=[]
   for r in anchors:
    top0=int(r['top'])
    if not tops or top0-tops[-1]>22:tops.append(top0)
   leading=float(np.median(np.diff(tops))) if len(tops)>1 else 49
   story=next(r['sentences'] for r in layouts[str(n)]['regions'] if r['regionType']=='reading-sentences')
   first_word=story[0].split()[0];sight=next(r.get('text','') for r in layouts[str(n)]['regions'] if r['regionType']=='sentence-line').lower().split()
   weight=700 if re.sub(r'[^\w]','',first_word).lower() in sight else 400
   xa,ya,xb,yb=word_bounds(first_word,weight);font_px=w*.033
   baseline=font_px*.35+leading*.5
   entry['story']={'left':round((int(first['left'])-xa/1000*font_px)/w*100,5),'top':round((int(first['top'])-(baseline-yb/1000*font_px))/h*100,5),'leading':round(leading/w*100,5)}

 entry.update(measure_activities(n,im,layouts[str(n)]['regions'],word_bounds))
 pages[str(n)]=entry
(root/'src/data/workbook-middle-source-geometry.json').write_text(json.dumps({'width':935,'height':1210,'pages':pages},separators=(',',':'))+'\n')
print(json.dumps({'pages':len(pages),'vertices':sum(x['wavePath'].count('L')+1 for x in pages.values()),'drawing_boxes':sum('drawing' in v for v in pages.values()),'reading_titles':sum('titlePath' in v for v in pages.values()),'measured_words':sum(len(v.get('vocabulary',[])) for v in pages.values())},indent=2))
