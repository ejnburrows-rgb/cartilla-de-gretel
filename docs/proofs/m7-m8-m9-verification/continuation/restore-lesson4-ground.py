"""Restore the source-painted ground erased by the earlier alpha isolation.

No drawing is inferred: copy the decoded, source-backed JPEG95 crop's complete
bottom band, y=900..1250, as opaque source pixels. The independent review
confirmed that this band contains shoes/grass/paper and no neighboring caption.
"""
import argparse,hashlib,io,json,subprocess
from pathlib import Path
from evidence_cli_guard import checked_repo, checked_git, checked_destination, write_report
from PIL import Image
import numpy as np
import pymupdf

p=argparse.ArgumentParser();p.add_argument('--pdf',required=True);p.add_argument('--repo',required=True);p.add_argument('--git-executable',required=True);a=p.parse_args()
repo=checked_repo(a.repo);git=checked_git(a.git_executable);pdf=Path(a.pdf)
rel='public/cartilla/art/optimized/flipchart-native/p006-scene.png'
asset_root=repo/'public/cartilla/art/optimized/flipchart-native'
outputs=[checked_destination(repo/rel,asset_root),checked_destination((repo/rel).with_suffix('.webp'),asset_root)]
report=checked_destination(repo/'docs/proofs/m7-m8-m9-verification/continuation/lesson4-ground-restoration.json')
if report.exists():raise FileExistsError('restoration report exists; historical replay must not overwrite accepted evidence')
assert hashlib.sha256(pdf.read_bytes()).hexdigest()=='d7fb3dff4e63caf3443226e57a9ef700f8974acd4ad8f08f44e2792e13cc4930'
doc=pymupdf.open(pdf);raw=doc.extract_image(doc[5].get_images(full=True)[0][0])['image']
crop=Image.open(io.BytesIO(raw)).convert('RGB').crop((100,100,1050,1350))
encoded=io.BytesIO();crop.save(encoded,format='JPEG',quality=95)
assert hashlib.sha256(encoded.getvalue()).hexdigest()=='bc88ef24272c5c7f2a84ee32e64610730c9fc15df8bfebdbef3f40e5cbea792b'
source=Image.open(io.BytesIO(encoded.getvalue())).convert('RGBA')
rel='public/cartilla/art/optimized/flipchart-native/p006-scene.png'
oldbytes=subprocess.check_output([str(git),'show','--end-of-options','d613b78ba553c3c5786afdf7d589305a3080f1cf:'+rel],cwd=repo)
if (repo/rel).read_bytes()!=oldbytes:raise ValueError('PNG no longer matches the reviewed pre-restoration baseline')
oldwebp=subprocess.check_output([str(git),'show','--end-of-options','d613b78ba553c3c5786afdf7d589305a3080f1cf:'+rel.replace('.png','.webp')],cwd=repo)
if outputs[1].read_bytes()!=oldwebp:raise ValueError('WebP no longer matches the reviewed pre-restoration baseline')
before=Image.open(io.BytesIO(oldbytes)).convert('RGBA');after=before.copy()
after.paste(source.crop((0,900,950,1250)),(0,900))
old=np.array(before);new=np.array(after);src=np.array(source)
assert np.array_equal(new[:900],old[:900])
assert np.array_equal(new[900:],src[900:])
after.save(repo/rel)
after.save((repo/rel).with_suffix('.webp'),format='WEBP',lossless=True)
decoded=np.array(Image.open((repo/rel).with_suffix('.webp')).convert('RGBA'))
assert np.array_equal(decoded[900:],src[900:])
sha=lambda data:hashlib.sha256(data).hexdigest()
result={'baselineHead':'d613b78ba553c3c5786afdf7d589305a3080f1cf','sourcePdfSha256':sha(pdf.read_bytes()),'sourceCropLTRB':[100,100,1050,1350],'intermediateJpegSha256':sha(encoded.getvalue()),'restoredOpaqueSourceBandLTRB':[0,900,950,1250],'unchangedPixelsAboveBand':True,'restoredBandExactRgbaToSourceIntermediate':True,'webpRestoredBandExactRgbaToSourceIntermediate':True,'previouslyFullyTransparentPixelsRestored':int((old[900:,:,3]==0).sum()),'sourceOriginalRgbExact':False,'reason':'Earlier alpha isolation deleted source-painted pale ground. Opaque source paper blends using existing multiply; no hidden pixels inferred.','outputs':{rel:sha((repo/rel).read_bytes()),rel.replace('.png','.webp'):sha((repo/rel).with_suffix('.webp').read_bytes())}}
write_report(report,json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
