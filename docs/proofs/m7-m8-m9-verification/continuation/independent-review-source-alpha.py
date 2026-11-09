"""Quantify p006 scene foreground removed by alpha; never edits source artwork."""
import argparse, hashlib, io, json, subprocess
from pathlib import Path
from evidence_cli_guard import checked_repo, checked_head, checked_git, checked_destination, write_report, read_lesson4_source
import numpy as np
import pymupdf
from PIL import Image

p = argparse.ArgumentParser()
p.add_argument('--pdf', required=True)
p.add_argument('--repo', required=True)
p.add_argument('--head', required=True)
p.add_argument('--output', required=True)
p.add_argument('--git-executable', required=True)
a = p.parse_args()
a.repo = checked_repo(a.repo)
a.head = checked_head(a.head)
git = checked_git(a.git_executable)
checked_destination(a.output)
if Path(a.output).exists():
    raise FileExistsError('report already exists')
pdf_bytes = read_lesson4_source(a.pdf)
doc = pymupdf.open(stream=pdf_bytes, filetype='pdf')
xref = doc[5].get_images(full=True)[0][0]
original = Image.open(io.BytesIO(doc.extract_image(xref)['image'])).convert('RGB')
crop = original.crop((100, 100, 1050, 1350))
jpeg = io.BytesIO()
crop.save(jpeg, format='JPEG', quality=95)
source = np.asarray(Image.open(io.BytesIO(jpeg.getvalue())).convert('RGB'))
asset = 'public/cartilla/art/optimized/flipchart-native/p006-scene.png'
raw = subprocess.check_output([str(git), 'show', '--end-of-options', f'{a.head}:{asset}'], cwd=a.repo)
candidate = np.asarray(Image.open(io.BytesIO(raw)).convert('RGBA'))
y, x = np.indices(source.shape[:2])
removed = (y > 950) & (candidate[:, :, 3] == 0) & (source[:, :, 0] > 160) & (source[:, :, 1] > 150) & (source[:, :, 2] < 180) & ((source[:, :, 0].astype(int) - source[:, :, 2].astype(int)) > 40)
ys, xs = np.where(removed)
samples = []
for xx, yy in [(575, 1056), (638, 1074), (221, 1102), (192, 1129)]:
    samples.append(dict(x=xx, y=yy, sourceRgb=source[yy, xx].tolist(), candidateRgba=candidate[yy, xx].tolist()))
result = dict(head=a.head, sourcePdfSha256=hashlib.sha256(pdf_bytes).hexdigest(), sourceJpegIntermediateSha256=hashlib.sha256(jpeg.getvalue()).hexdigest(), candidatePath=asset, candidateSha256=hashlib.sha256(raw).hexdigest(), sceneCropLTRB=[100, 100, 1050, 1350], removedSaturatedGroundPixelCount=int(removed.sum()), removedSaturatedGroundBBoxInclusive=[int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())] if len(xs) else None, samples=samples, bottomBandLTRB=[0, 900, 950, 1250], bottomBandAllOpaque=bool(np.all(candidate[900:, :, 3] == 255)), bottomBandRgbMatchesReconstructedSource=bool(np.array_equal(candidate[900:, :, :3], source[900:])), measurementLimit='Colored-pixel predicate is diagnostic, not an alpha restoration mask. Full visual source inspection is required to identify the complete grass region.')
write_report(a.output, json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
