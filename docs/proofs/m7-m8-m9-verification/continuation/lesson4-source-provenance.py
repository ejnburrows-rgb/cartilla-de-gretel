"""Replay the recovered original-PDF -> JPEG95 crop -> visible PNG RGB chain.

python lesson4-source-provenance.py --pdf ORIGINAL.pdf --repo CHECKOUT --head SHA --output result.json
Requires Pillow, numpy and PyMuPDF. Does not modify production files.
"""
import argparse,hashlib,io,json,subprocess
from pathlib import Path
from evidence_cli_guard import checked_repo, checked_head, checked_git, checked_destination, write_report
import numpy as np
import pymupdf
from PIL import Image

CROPS={
 'scene':(100,100,1050,1350),'elefante':(80,1380,650,1920),
 'espejo':(780,1380,1300,1920),'ema':(1550,1380,2050,1920),
 'estrella':(80,2100,680,2750),'erizo':(780,2100,1300,2750),
 'escalera':(1500,2100,2050,2750),
}

def digest(data):return hashlib.sha256(data).hexdigest()

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--pdf',required=True);parser.add_argument('--repo',required=True);parser.add_argument('--head',required=True);parser.add_argument('--output',required=True);parser.add_argument('--git-executable',required=True);args=parser.parse_args()
 args.repo=checked_repo(args.repo);args.head=checked_head(args.head);git=checked_git(args.git_executable);checked_destination(args.output)
 if Path(args.output).exists():raise FileExistsError('report already exists')
 pdf=Path(args.pdf);doc=pymupdf.open(pdf);page=doc[5];xref=page.get_images(full=True)[0][0]
 raw=doc.extract_image(xref)['image'];source=Image.open(io.BytesIO(raw)).convert('RGB');records=[]
 for name,box in CROPS.items():
  path=f'public/cartilla/art/optimized/flipchart-native/p006-{name}.png'
  data=subprocess.check_output([str(git),'show','--end-of-options',f'{args.head}:{path}'],cwd=args.repo)
  candidate=Image.open(io.BytesIO(data)).convert('RGBA');arr=np.asarray(candidate);alpha=arr[:,:,3];rgb=arr[:,:,:3]
  crop=source.crop(box);original=np.asarray(crop);encoded=io.BytesIO();crop.save(encoded,format='JPEG',quality=95)
  intermediate=np.asarray(Image.open(io.BytesIO(encoded.getvalue())).convert('RGB'))
  visible=alpha>0;opaque=alpha==255;delta=np.abs(rgb.astype(int)-original.astype(int))
  record=dict(destination=path,sha256=digest(data),dimensions=list(candidate.size),sourcePdfPage=6,sourceCropLTRB=list(box),intermediateJpegQuality=95,intermediateJpegSha256=digest(encoded.getvalue()),rgbMatchVisibleToIntermediate=bool(np.array_equal(rgb[visible],intermediate[visible])),visibleRgbDifferencesToIntermediate=int(np.any(rgb!=intermediate,axis=2)[visible].sum()),rgbMatchAllPixelsToOriginal=bool(np.array_equal(rgb,original)),visibleRgbDifferencesToOriginal=int(np.any(rgb!=original,axis=2)[visible].sum()),meanAbsoluteRgbDeltaOpaqueToOriginal=float(delta[opaque].mean()),maxAbsoluteRgbDeltaOpaqueToOriginal=int(delta[opaque].max()),transparentPixels=int((alpha==0).sum()),partialAlphaPixels=int(((alpha>0)&(alpha<255)).sum()),opaquePixels=int(opaque.sum()),zeroAlphaRgbAllWhite=bool(np.all(rgb[alpha==0]==255)))
  records.append(record)
 result=dict(candidateHead=args.head,sourcePdfSha256=digest(pdf.read_bytes()),sourcePdfPage=6,embeddedImageXref=xref,embeddedImageSha256=digest(raw),sourceRasterDimensions=list(source.size),method='Decode original embedded JPEG with Pillow RGB, crop exact native rectangle, encode JPEG quality=95 with Pillow defaults, decode that intermediate, compare every RGB channel at every output pixel with alpha>0. Alpha is inspected separately, not certified by this RGB check.',allSevenVisibleRgbChainsMatch=all(r['rgbMatchVisibleToIntermediate'] for r in records),originalRgbPreservedExactly=False,assets=records)
 write_report(args.output,json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
 if not result['allSevenVisibleRgbChainsMatch']:raise SystemExit(1)

if __name__=='__main__':main()
