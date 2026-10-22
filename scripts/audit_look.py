"""Look check: jagged / noisy / posterized art, judged on the file the app serves.
Metrics (all on the served file, scaled so long edge = 512):
 speck  = small separate pieces in the alpha mask (ragged cutout, floating dots) per 1000 edge px
 noise  = small colour islands after quantising to 6 levels per channel, per megapixel of foreground
 colors = distinct 5-bit colours (very high = dithered/noisy)
 rough  = outline roughness: polygon corners per outline pixel (ragged edges)
A slot trips JAGGED when 2+ of the metrics are above the line drawn from the known bad tree and well-formed controls."""
import json,re,base64,io,os,sys,cv2,numpy as np
from PIL import Image
APPROOT=os.environ.get('APPROOT','')
def load(p):
    if p.endswith('.svg'):
        t=open(p).read();m=re.search(r'base64,([A-Za-z0-9+/=\s]+)',t)
        return Image.open(io.BytesIO(base64.b64decode(re.sub(r"\s","",m.group(1)))))
    return Image.open(p)
def met(p):
    im=load(p).convert('RGBA');w,h=im.size;s=512/max(w,h)
    if s!=1:im=im.resize((max(1,int(w*s)),max(1,int(h*s))),Image.LANCZOS)
    a=np.asarray(im);al=a[...,3]>128;rgb=a[...,:3]
    if not al.any():return dict(speck=0,noise=0,colors=0,rough=0)
    m=al.astype(np.uint8)*255
    n,lab,st,_=cv2.connectedComponentsWithStats(m,connectivity=8)
    area=al.sum();small=sum(1 for i in range(1,n) if st[i,4]<0.004*area)
    cs,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE);L=max(sum(len(c) for c in cs),1)
    ap=sum(len(cv2.approxPolyDP(c,1.0,True)) for c in cs)
    q=(rgb//43).astype(np.uint8);key=q[...,0].astype(np.int32)*49+q[...,1]*7+q[...,2]
    isl=0
    for k in np.unique(key[al]):
        mk=((key==k)&al).astype(np.uint8);nn,_,ss,_=cv2.connectedComponentsWithStats(mk,connectivity=4)
        isl+=int((ss[1:,4]<12).sum())
    c5=len({tuple(x) for x in (rgb[al]//8)[::5]})
    return dict(speck=round(1000*small/L,2),noise=round(isl/(area/1e6),0),colors=c5,rough=round(ap/L,3))
if __name__=="__main__":
    from multiprocessing import Pool
    a=json.load(open('docs/art-inventory/app-loaded.json'))['slots']
    ids=list(a)
    def f(s):
        p=a[s]['app_loads'];p=(APPROOT+p[len('public/'):]) if APPROOT else p
        return s,met(p)
    with Pool(4) as pool:res=dict(pool.map(f,ids,chunksize=8))
    out={s:dict(m,jagged=bool(m['speck']>=3.4 or m['rough']>=0.15)) for s,m in res.items()};json.dump(out,open('docs/art-inventory/look.json','w'),indent=0)
    print(len(res))
