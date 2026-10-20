"""Measure original printed activity fields; keep grading and gestures in React."""
import csv,re
from pathlib import Path
import numpy as np
from scipy import ndimage
from scipy.signal import find_peaks
from scipy.spatial import ConvexHull
from lane_b_source_contours import mask_path, simplify

def measure_activities(n,im,regions,word_bounds):
 h,w=im.shape[:2];r,g,b=im.transpose(2,0,1);yy=np.arange(h)[:,None];xx=np.arange(w)[None,:]
 neutral=(im.max(2)<160)&(im.max(2)-im.min(2)<48)&~((g-r>12)&(b-r>2))
 green=(g-r>14)&(b-r>4)&(im.max(2)-im.min(2)<110)
 ocr=[row for row in csv.DictReader((Path('/tmp/lane-b-font-analysis')/f'page-{n:03}.tsv').open(),delimiter='\t') if row['level']=='5' and row['text'].strip()]
 out={'staticRegions':[]}
 def bbox(mask):
  y,x=np.where(mask);assert len(x),(n,'empty source field');return [int(x.min()),int(y.min()),int(x.max()+1),int(y.max()+1)]
 def place(text,box,weight=400):
  left,top,right,bottom=box;a,b0,c,d=word_bounds(text,weight);px=(bottom-top)/(d-b0)*1000;sx=(right-left)/((c-a)/1000*px)
  return {'text':text,'left':round((left-a/1000*px*sx)/w*100,5),'top':round((top-(1-d/1000)*px)/h*100,5),'fontSize':round(px/w*100,5),'scaleX':round(sx,5),'width':round((c-a)/1000*px*sx/w*100+1,5),'height':round(px*1.3/h*100,5),'sourceBox':box}
 def static(id,mask,colored=False):
  layers=[]
  if colored:
   # Retain the source's three original green ink/tint levels.
   for lo,hi in (list(zip([0,155,190,205,215,225,235,242,248],[155,190,205,215,225,235,242,248,253])) if id=='reading-title-halo' else [(0,155),(155,205),(205,245)]):
    m=mask&(g>=lo)&(g<hi)
    if m.any():
     color=np.median(im[m],axis=0).astype(int);layers.append({'d':mask_path(m),'fill':'#'+''.join(f'{v:02x}' for v in color)})
  else:
   m=mask&(neutral|(im.max(2)<120))
   if m.any():layers.append({'d':mask_path(m),'fill':'#343a31'})
  if layers:out['staticRegions'].append({'region':id,'layers':layers})
 for i,region in enumerate(regions):
  if region['regionType']!='instruction':continue
  first=region['text'].split()[0].lower()
  found=[row for row in ocr if re.sub(r'[^a-z]','',row['text'].lower())==first and ((int(row['top'])<200) if i==0 else 500<int(row['top'])<830)]
  if not found and n==47 and i==0:
   # The scan's Escribe is misread as Bec; the following printed con/tu/mejor/letra verifies this line.
   found=[row for row in ocr if int(row['left'])<120 and 80<int(row['top'])<110]
  assert found,(n,region['id'],'instruction anchor')
  anchor=min(found,key=lambda row:int(row['top']));top=int(anchor['top'])-12
  bottom=min(top+80, next((int(row['top'])-10 for row in ocr if row['text']=='---'),top+80))
  # Only the instruction block, not the next model, helper frame or ruled field.
  if i==0:bottom=min(bottom,145) if n%4==3 else int(anchor['top'])+int(anchor['height'])+12
  mask=(yy>=top)&(yy<bottom)&(xx>15)&(xx<835)
  static(region['id'],mask);static(region['id']+'-green',mask&green,True)
 if (n-23)%4==1:
  matches=[reg for reg in regions if reg['regionType']=='syllable-match'];words=[e['word'] for reg in matches for row in reg['matchRows'] for e in row]
  candidates=[row for row in ocr if 180<int(row['top'])<1120 and int(row['left'])>300 and float(row['conf'])>35]
  lefts=np.array([int(row['left']) for row in candidates]);centers=np.quantile(lefts,[.1,.5,.9])
  for _ in range(12):
   labels=np.abs(lefts[:,None]-centers[None,:]).argmin(1);centers=np.array([np.median(lefts[labels==i]) for i in range(3)])
  order=centers.argsort();groups=[[row for row,label in zip(candidates,labels) if label==i] for i in order]
  bounds=[min(int(row['left']) for row in groups[0])-3]+[int((max(int(row['left'])+int(row['width']) for row in groups[i])+min(int(row['left']) for row in groups[i+1]))/2) for i in range(2)]+[900]
  out['circles']={reg['id']:[None]*6 for reg in matches}
  for column,(x0,x1) in enumerate(zip(bounds[:-1],bounds[1:])):
   band=neutral[180:1130,x0:x1];active=ndimage.binary_closing(band.sum(1)>2,structure=np.ones(7));labs,_=ndimage.label(active)
   rows=[sl[0] for sl in ndimage.find_objects(labs) if sl and sl[0].stop-sl[0].start>8]
   assert len(rows)==10,(n,column,'circle rows',[(s.start,s.stop) for s in rows])
   for row,sl in enumerate(rows):
    top=sl.start+170;bottom=sl.stop+184;mask=neutral&(yy>=top)&(yy<bottom)&(xx>=x0)&(xx<x1)
    index=row//2;item=(row%2)*3+column;text=matches[index]['matchRows'][row%2][column]['word']
    out['circles'][matches[index]['id']][item]=place(text,bbox(mask))
  static('circle-targets',((g-r>14)&(b-r>4))&(yy>180)&(yy<1130)&(xx>125)&(xx<300),True)
  branch_right=max(word['sourceBox'][0] for words0 in out['circles'].values() for word in words0[::3])-8
  branch_mask=(im.max(2)<220)&(im.max(2)-im.min(2)<50)&~((g-r>12)&(b-r>2))&(yy>180)&(yy<1130)&(xx>250)&(xx<branch_right)
  labels_b,_=ndimage.label(ndimage.binary_closing(branch_mask,iterations=2))
  branches=[(label,sl) for label,sl in enumerate(ndimage.find_objects(labels_b),1) if sl and sl[1].stop-sl[1].start>50 and sl[0].stop-sl[0].start<50]
  assert len(branches)==10,(n,'source branches',len(branches))
  for index,(label,sl) in enumerate(branches):
   ys,xs=np.where(branch_mask&(labels_b==label));a_line,b_line=np.polyfit(xs,ys,1)
   for _ in range(3):
    keep=abs(ys-(a_line*xs+b_line))<2.5;a_line,b_line=np.polyfit(xs[keep],ys[keep],1)
   left,right=int(xs.min()),int(xs.max())
   path=f'M{left},{a_line*left+b_line-.65:.2f} L{right},{a_line*right+b_line-.65:.2f} L{right},{a_line*right+b_line+.65:.2f} L{left},{a_line*left+b_line+.65:.2f} Z'
   out['staticRegions'].append({'region':f'circle-branch-{index}','layers':[{'d':path,'fill':'#343a31'}]})
 if (n-23)%4==2:
  def panel(id,mask,min_width):
   colored=(g-r>7)&(b-r>1)&mask
   lab,_=ndimage.label(ndimage.binary_closing(colored,iterations=4))
   candidates=[(label,sl) for label,sl in enumerate(ndimage.find_objects(lab),1) if sl and sl[1].stop-sl[1].start>min_width and 25<sl[0].stop-sl[0].start<100]
   assert len(candidates)==(2 if id=='reading-strips' else 1),(n,id,'panel outlines',[(sl[1].start,sl[0].start,sl[1].stop,sl[0].stop) for _,sl in candidates])
   for index,(label,sl) in enumerate(candidates):
    filled=ndimage.binary_fill_holes(lab==label)
    pixels=filled&(im.max(2)>185)&(im.min(2)>160)
    color=np.median(im[pixels],axis=0).astype(int)
    edge=filled&(ndimage.distance_transform_edt(filled)<3)&colored&(im.max(2)<215)
    stroke=np.median(im[edge],axis=0).astype(int)
    cleaned=ndimage.binary_opening(filled,iterations=2)
    py,px=np.where(cleaned);points=np.column_stack([px,py]);hull=ConvexHull(points);vertices=points[hull.vertices].tolist();vertices=simplify(vertices+[vertices[0]],1)
    outline='M'+' L'.join(f'{x},{y}' for x,y in vertices)+' Z'
    out['staticRegions'].append({'region':f'{id}-panel-{index}','layers':[{'d':outline,'fill':'#'+''.join(f'{v:02x}' for v in color),'stroke':'#'+''.join(f'{v:02x}' for v in stroke),'strokeWidth':1.2}]})
   interiors=np.zeros((h,w),bool)
   for label,_ in candidates:interiors|=ndimage.binary_erosion(ndimage.binary_fill_holes(lab==label),iterations=6)
   static(id+'-ink',mask&interiors)
  panel('reading-strips',(yy>90)&(yy<320)&(xx>255)&(xx<825),450)
  static('reading-title-halo',((g-r>3)&(b-r>0)&(g<253))&(yy>90)&(yy<330)&(xx>15)&(xx<255),True)
  # The original sight-word frame is below the vocabulary and above the story.
  story=[row for row in ocr if 740<int(row['top'])<1120 and 0<int(row['left'])<800 and float(row['conf'])>45]
  first=min(int(row['top']) for row in story)
  vocab=[row for row in ocr if 335<int(row['top'])<650 and 0<int(row['left'])<800 and float(row['conf'])>40]
  start=max(int(row['top'])+int(row['height']) for row in vocab)+10
  mask=(yy>=start)&(yy<first-20)&(xx>5)&(xx<825)
  panel('reading-sight',mask,100)
  sentences=next(reg['sentences'] for reg in regions if reg['regionType']=='reading-sentences')
  sight=next(reg.get('text','') for reg in regions if reg['regionType']=='sentence-line').lower().split()
  rows=[row for row in ocr if 735<int(row['top'])<1125 and int(row['left'])<820 and row['text'].strip()]
  lines=[]
  for row in sorted(rows,key=lambda row:int(row['top'])):
   group=next((line for line in lines if abs(np.mean([int(a['top']) for a in line])-int(row['top']))<19),None)
   if group is None:lines.append([row])
   else:group.append(row)
  lines=[sorted(line,key=lambda row:int(row['left'])) for line in lines]
  assert len(lines)==len(sentences),(n,'story line count',len(lines),len(sentences))
  out['readingWords']=[]
  for line_index,(sentence,rows0) in enumerate(zip(sentences,lines)):
   words=sentence.split()
   if n==57 and line_index==2:rows0=[row for row in rows0 if row['text']!='.']
   boxes0=[[int(row['left']),int(row['top']),int(row['left'])+int(row['width']),int(row['top'])+int(row['height'])] for row in rows0]
   # Two scan words are merged by OCR. Split only their geometry at the actual blank gap.
   if (n,line_index) in [(25,2),(61,2)]:
    index=2;box=boxes0[index];left,top,right,bottom=box
    band=neutral[top-3:bottom+4,left-2:right+3];columns=band.any(0);gaps,_=ndimage.label(~columns)
    candidates=[sl[0] for sl in ndimage.find_objects(gaps) if sl and sl[0].stop-sl[0].start>=3 and sl[0].start>3 and sl[0].stop<len(columns)-3]
    a0,b0,c0,d0=word_bounds(words[index]);a1,b1,c1,d1=word_bounds(words[index+1]);fraction=(c0-a0)/(c0-a0+c1-a1)
    gap=min(candidates,key=lambda sl:abs((sl.start+sl.stop)/2/len(columns)-fraction))
    split=int((gap.start+gap.stop)/2)+left-2
    boxes0[index:index+1]=[[left,top,split,bottom],[split,top,right,bottom]]
   assert len(boxes0)==len(words),(n,line_index,'story word count',len(boxes0),len(words))
   placements=[]
   for index,(word,box) in enumerate(zip(words,boxes0)):
    left,top,right,bottom=box
    x0=left-2 if index==0 else max(left-2,int((boxes0[index-1][2]+left)/2))
    x1=right+3 if index==len(words)-1 else min(right+3,int((right+boxes0[index+1][0])/2))
    region=neutral&(xx>=x0)&(xx<x1)&(yy>=top-4)&(yy<bottom+4)
    weight=700 if re.sub(r'[^\w]','',word).lower() in sight else 400
    position=place(word,bbox(region),weight);position['fontWeight']=weight;placements.append(position)
   out['readingWords'].append(placements)

 if (n-23)%4==3:
  fill=next(reg for reg in regions if reg['regionType']=='fill-in-blank')
  boxmask=green&(xx>120)&(yy>120)&(yy<650)
  boxes=[]
  for row,(top,bottom) in enumerate([(120,245),(390,535)]):
   for x0,x1 in [(135,370),(370,650),(650,920)]:
    field=boxmask&(xx>=x0)&(xx<x1)&(yy>=top)&(yy<bottom)
    left,t,right,bottom0=bbox(field)
    assert 90<right-left<240 and 25<bottom0-t<80,(n,'helper frame bounds',left,t,right,bottom0)
    boxes.append((field,(slice(t,bottom0),slice(left,right))))
  centers=[(sl[1].start+sl[1].stop)/2 for _,sl in boxes[:3]];bounds=[125]+[int((centers[i]+centers[i+1])/2) for i in range(2)]+[920]
  out['fills']=[]
  for i,((field,sl),item) in enumerate(zip(boxes,fill['fillItems'])):
   x0,x1=bounds[i%3:i%3+2];y0,y1=sl[0].start,sl[0].stop
   anchors=[row for row in ocr if sl[1].start+3<int(row['left'])+int(row['width'])/2<sl[1].stop-3 and y0+3<int(row['top'])+int(row['height'])/2<y1-3]
   if len(anchors)==1:
    anchor=anchors[0];left,top=int(anchor['left']),int(anchor['top']);right,bottom=left+int(anchor['width']),top+int(anchor['height'])
    mask=neutral&(xx>=left-2)&(xx<right+3)&(yy>=top-2)&(yy<bottom+3)
   else:
    mask=neutral&(xx>sl[1].start+10)&(xx<sl[1].stop-10)&(yy>y0+10)&(yy<y1-10)
   label_pos=place(item['wordBox'],bbox(mask))
   source_frame=field;static(f'fill-frame-{i}',source_frame,True)
   # Original blank line is the longest thin horizontal component in this field.
   zone=(im.max(2)<220)&(im.max(2)-im.min(2)<50)&(xx>=x0)&(xx<x1)&(yy>y1+35)&(yy<y1+135)
   score=ndimage.gaussian_filter1d(zone.sum(1).astype(float),1);peak=int(score.argmax());assert score[peak]>20,(n,i,'blank rule')
   line=zone&(abs(yy-peak)<7);ll,_=ndimage.label(ndimage.binary_closing(line,structure=np.ones((1,5))))
   segments=[s for s in ndimage.find_objects(ll) if s and s[1].stop-s[1].start>35 and s[0].stop-s[0].start<20]
   assert segments,(n,i,'blank segment')
   segment=max(segments,key=lambda s:s[1].stop-s[1].start);a0,a1=segment[1].start,segment[1].stop
   line_points=np.array([(x,y) for y,x in zip(*np.where(line&(xx>=a0)&(xx<a1)))])
   a_line,b_line=np.polyfit(line_points[:,0],line_points[:,1],1)
   for _ in range(3):
    keep=abs(line_points[:,1]-(a_line*line_points[:,0]+b_line))<2
    a_line,b_line=np.polyfit(line_points[keep,0],line_points[keep,1],1)
   path=f'M{a0},{a_line*a0+b_line-.6:.2f} L{a1},{a_line*a1+b_line-.6:.2f} L{a1},{a_line*a1+b_line+.6:.2f} L{a0},{a_line*a0+b_line+.6:.2f} Z'
   out['staticRegions'].append({'region':f'fill-underline-{i}','layers':[{'d':path,'fill':'#687165'}]})
   prefix,suffix=item['blank'].split('___');parts=[]
   # Separate letter ink from the ruling before locating either printed word part.
   textmask=neutral&(xx>=x0)&(xx<x1)&(yy>peak-37)&(yy<peak+15)&(abs(yy-(a_line*xx+b_line))>2)
   left_part=right_part=None
   if prefix.strip() and suffix.strip():
    cols=textmask.any(0);present=np.flatnonzero(cols);gap_labels,_=ndimage.label(~cols[present.min():present.max()+1])
    gaps=[s[0] for s in ndimage.find_objects(gap_labels) if s]
    gap=max(gaps,key=lambda s:s.stop-s.start);split=int(present.min()+(gap.start+gap.stop)/2)
    left_part=bbox(textmask&(xx<split));right_part=bbox(textmask&(xx>=split))
   elif prefix.strip():left_part=bbox(textmask)
   elif suffix.strip():right_part=bbox(textmask)
   if left_part:parts.append(place(prefix.strip(),left_part));a0=max(a0,left_part[2]+2)
   if right_part:parts.append(place(suffix.strip(),right_part));a1=min(a1,right_part[0]-2)
   # The hit area is the original gap only, including when a descender touches its line.
   assert a1-a0>30,(n,i,'blank gap',a0,a1)
   out['staticRegions'][-1]['layers'][0]['d']=f'M{a0},{a_line*a0+b_line-.6:.2f} L{a1},{a_line*a1+b_line-.6:.2f} L{a1},{a_line*a1+b_line+.6:.2f} L{a0},{a_line*a0+b_line+.6:.2f} Z'
   # Choices are separated by their printed dash; exclude the long grid rule.
   cm=(im.max(2)<185)&(im.max(2)-im.min(2)<50)&(xx>=x0)&(xx<x1)&(yy>y1+135)&(yy<y1+225)
   labs1,_=ndimage.label(cm)
   for label1,sl1 in enumerate(ndimage.find_objects(labs1),1):
    if sl1 and sl1[1].stop-sl1[1].start>70 and sl1[0].stop-sl1[0].start<12:cm[labs1==label1]=False
   lab1,_=ndimage.label(cm);dashes=[s for s in ndimage.find_objects(lab1) if s and s[1].stop-s[1].start>=4 and s[0].stop-s[0].start<=7]
   assert dashes,(n,i,'choice separator')
   pair_box=bbox(cm);mid=(pair_box[0]+pair_box[2])/2
   dash=min(dashes,key=lambda s:abs((s[1].start+s[1].stop)/2-mid));d0,d1=dash[1].start,dash[1].stop
   static(f'fill-choice-dash-{i}',cm&(xx>=d0)&(xx<d1))
   assert (cm&(xx<d0-2)).any() and (cm&(xx>=d1+2)).any(),(n,i,'choice halves',d0,d1,bbox(cm))
   choices=[place(choice['text'],bbox(cm&(xx<a))) if j==0 else place(choice['text'],bbox(cm&(xx>=a))) for j,(choice,a) in enumerate(zip(item['choices'],[d0-2,d1+2]))]
   out['fills'].append({'wordBox':label_pos,'parts':parts,'choices':choices,'blank':{'left':a0/w*100,'top':(peak-34)/h*100,'width':(a1-a0)/w*100,'height':40/h*100,'fontSize':3.2}})
  # Original two long grid separators, retaining scan tilt.
  grid=neutral&(xx>125)&(xx<925)&(yy>300)&(yy<750)
  score=ndimage.gaussian_filter1d(grid.sum(1).astype(float),2);windows=[(max(sl[0].stop for _,sl in boxes[row*3:row*3+3])+170,max(sl[0].stop for _,sl in boxes[row*3:row*3+3])+235) for row in range(2)];peaks=np.array([int(score[a:b].argmax())+a for a,b in windows])
  assert all(score[p]>30 for p in peaks),(n,'grid rules',peaks)
  for index,peak in enumerate(peaks):
   line=grid&(abs(yy-peak)<14);ys,xs=np.where(line);a_line,b_line=np.polyfit(xs,ys,1)
   for _ in range(3):
    keep=abs(ys-(a_line*xs+b_line))<2.5;a_line,b_line=np.polyfit(xs[keep],ys[keep],1)
   left,right=int(xs.min()),int(xs.max())
   path=f'M{left},{a_line*left+b_line-.7:.2f} L{right},{a_line*right+b_line-.7:.2f} L{right},{a_line*right+b_line+.7:.2f} L{left},{a_line*left+b_line+.7:.2f} Z'
   out['staticRegions'].append({'region':f'fill-grid-{index}','layers':[{'d':path,'fill':'#343a31'}]})
  rulesmask=neutral&(xx>130)&(xx<925)&(yy>810)&(yy<1135)
  # Include pale dashed midlines as well.
  broad=(im.max(2)<200)&(im.max(2)-im.min(2)<65)&(xx>130)&(xx<925)&(yy>810)&(yy<1135)
  score=ndimage.gaussian_filter1d(broad.sum(1).astype(float),2);peaks,_=find_peaks(score,distance=35,prominence=10)
  assert len(peaks)==6,(n,'sentence rules',peaks)
  out['sentenceRules']=[]
  for i,peak in enumerate(peaks):
   points=[]
   for x in range(135,925):
    y=int(np.argmin(im[peak-12:peak+13,x].max(1)))+peak-12
    if im[y,x].max()<200:points.append((x,y))
   points=np.array(points);a,b0=np.polyfit(points[:,0],points[:,1],1)
   for _ in range(3):
    keep=abs(points[:,1]-(a*points[:,0]+b0))<2.5;a,b0=np.polyfit(points[keep,0],points[keep,1],1)
   ends=[]
   for x in range(125,930):
    y=int(round(a*x+b0))
    if np.any((im[y-2:y+3,x].max(1)<200)&(im[y-2:y+3,x].max(1)-im[y-2:y+3,x].min(1)<65)):ends.append(x)
   left,right=min(ends),max(ends)
   out['sentenceRules'].append({'d':f'M{left},{a*left+b0:.2f} L{right},{a*right+b0:.2f}','dashed':i in [1,4],'y':float(a*450+b0),'left':left/w*100,'right':right/w*100})
 static('lesson-footer',(yy>1125)&(yy<1200)&((xx<780) if n%2 else (xx>150)))
 return out
