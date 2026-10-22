"""Rigid source-pixel motion. No displacement maps or redrawn artwork.

Masks select existing pixels. Unrecoverable hidden surfaces are held still,
not inpainted. Every SVG includes the exact still for reduced motion.
"""
import base64, io, os
import numpy as np
from PIL import Image, ImageDraw
from build import STILLS, ROOT, still_png

NAMES = ['abanico','vocal-a-abanico','leccion-1-carro','leccion-1-maiz','leccion-1-ojos',
         'vocal-a-aguja','vocal-a-alas','vocal-a-ardilla','vocal-e-estrella',
         'vocal-o-oruga','vocal-u-unicornio','fc_p015_sopa','fc_p024_lala',
         'vocal-i-iman','vocal-e-escoba']
HELD = {'leccion-1-ojos':'No separate eyelids. Keep original until closed-eye art is supplied.',
        'vocal-a-aguja':'Thread crosses the needle eye. Need isolated red thread and needle layers for a pull.',
        'vocal-o-oruga':'Body segments overlap and contain painted ground. Need separate segments and ground for inching.',
        'fc_p024_lala':'Need closed eyelids and clean tail/body overlap; no squash or pixel warp.',
        'vocal-e-escoba':'Broom is painted into the green scene. Need clean background behind broom for sweeping.'}

def uri(im):
    b=io.BytesIO(); im.save(b,'PNG'); return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()

def build(name):
    path=STILLS[name]; base=still_png(os.path.join(ROOT,path)); W,H=base.size
    ext=os.path.splitext(path)[1][1:]; source='data:image/'+('svg+xml' if ext=='svg' else ext)+';base64,'+base64.b64encode(open(os.path.join(ROOT,path),'rb').read()).decode()
    css=['.reduced{display:none}@media(prefers-reduced-motion:reduce){.moving{display:none}.reduced{display:inline}}']
    layers=[]; defs=[]; remaining=np.array(base).copy()
    def img(href,extra=''):
        return f'<image x="0" y="0" width="{W}" height="{H}" href="{href}" {extra}/>'
    def part(poly, anim, pivot, dur, effect='', mask_test=None):
        m=Image.new('L',(W,H)); ImageDraw.Draw(m).polygon(poly,fill=255)
        sel=np.array(m)>0
        if mask_test is not None: sel &= mask_test
        a=np.array(base).copy(); a[...,3]=np.where(sel,a[...,3],0)
        remaining[...,3]=np.where(sel,0,remaining[...,3])
        key='part'+str(len(layers)); css.append('@keyframes '+key+'{'+anim+'}')
        layers.append(f'<g style="transform-origin:{pivot[0]}px {pivot[1]}px;animation:{key} {dur}s ease-in-out infinite;{effect}">{img(uri(Image.fromarray(a)))}</g>')
    def swing(poly,pivot,angle,dur=3):
        part(poly,f'0%,100%{{transform:rotate(0deg)}}25%{{transform:rotate({angle}deg)}}75%{{transform:rotate({-angle}deg)}}',pivot,dur)
    if name in ('abanico','vocal-a-abanico'):
        # All fan pixels rotate rigidly about the lower corner. Extra clearance
        # comes from the outer viewbox, not a ripple or a canvas rotation.
        swing([(0,0),(W,0),(W,H),(0,H)],(.13*W,.91*H),6,2.8)
    elif name=='vocal-a-alas':
        swing([(0,0),(420,0),(420,H),(0,H)],(386,207),-6,2.6)
        swing([(430,0),(W,0),(W,H),(430,H)],(455,207),6,2.6)
    elif name=='leccion-1-maiz':
        swing([(62,319),(247,319),(263,383),(247,428),(204,439),(150,485),(63,510)],(256,398),3,3.8)
    elif name=='vocal-a-ardilla':
        swing([(0,0),(400,0),(400,401),(320,434),(285,470),(270,510),(240,530),(174,530),(120,505),(120,447),(170,400),(227,372),(216,360),(0,385)],(235,520),2,3.4)
    elif name=='vocal-u-unicornio':
        swing([(279,24),(304,41),(328,86),(340,126),(332,164),(314,184),(286,188),(255,181),(248,157),(251,104),(261,60)],(291,188),-4,3.8)
    elif name=='fc_p015_sopa':
        # The three pink steam shapes already exist. Move those exact pixels.
        # White background remains as source white; no generated steam.
        a=np.array(base); pink=(a[...,0]>a[...,1]*1.15)&(a[...,2]>a[...,1]*1.05)
        part([(100,45),(210,45),(210,125),(100,125)],'0%,100%{transform:translateY(0);opacity:1}70%{transform:translateY(-15px);opacity:.3}95%{transform:translateY(-18px);opacity:0}',(160,120),3.4,mask_test=pink)
    elif name=='vocal-e-estrella':
        css.append('@keyframes twinkle{0%,100%{opacity:0}50%{opacity:.55}}')
        defs.append('<filter id="glow"><feGaussianBlur stdDeviation="12"/></filter>')
        layers.append('<g style="animation:twinkle 3.6s ease-in-out infinite" filter="url(#glow)">'+img(source)+'</g>')
    elif name=='vocal-i-iman':
        # Source has sparks, not loose metal. Pull the existing external marks
        # toward the pole, then release. No invented clips.
        part([(640,390),(W,390),(W,H),(625,640),(610,455)], '0%,100%{transform:translate(0,0)}55%{transform:translate(-20px,-12px)}', (620,442), 2.8)
    elif name=='leccion-1-carro':
        # Wheel centers are source-cropped. Rotate the existing blue spokes
        # inside fixed elliptical apertures, not the whole painted canvas.
        for i,(cx,cy,rx,ry) in enumerate([(126,444,29,46),(467,568,40,58)]):
            key='wheel'+str(i); defs.append(f'<clipPath id="{key}"><ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}"/></clipPath>')
            css.append('@keyframes '+key+'{0%,100%{transform:rotate(0deg)}50%{transform:rotate(18deg)}}')
            layers.append(f'<g clip-path="url(#{key})"><g style="transform-origin:{cx}px {cy}px;animation:{key} 2.4s ease-in-out infinite">'+img(source)+'</g></g>')
    margin=round(max(W,H)*.10) if name in ('abanico','vocal-a-abanico','vocal-a-alas') else 0
    static=img(source)
    if layers:
        stationary=static if name in ('vocal-e-estrella','leccion-1-carro') else img(uri(Image.fromarray(remaining)))
        if name=='fc_p015_sopa':
            # Restore only the exact source's white backing under the steam.
            # This is a white scan, not a scene needing hidden-surface invention.
            bg=np.array(base); bg[remaining[...,3]==0]=np.array(base)[0,0]
            stationary=img(uri(Image.fromarray(bg)))
        if name=='vocal-e-estrella': layers=[layers[0],static]; stationary=''
        body='<g class="moving">'+stationary+''.join(layers)+'</g>'
    else: body='<g class="moving">'+static+'</g>'
    s=f'<svg xmlns="http://www.w3.org/2000/svg" width="{W+2*margin}" height="{H+2*margin}" viewBox="{-margin} {-margin} {W+2*margin} {H+2*margin}">\n<style>'+''.join(css)+'</style>\n<defs>'+''.join(defs)+'</defs>\n'+body+'<g class="reduced">'+static+'</g></svg>'
    out=os.path.join(os.environ['LIVING_OUT'],name+'-alive.svg');open(out,'w').write(s);return len(s)

for _name in NAMES:
    globals()[_name.replace('-','_')]=(lambda n=_name:build(n))
