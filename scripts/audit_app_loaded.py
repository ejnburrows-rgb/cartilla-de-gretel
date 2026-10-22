#!/usr/bin/env python3
"""For every slot: which file does the app really load on screen, and is it the same picture the inventory showed?
READ-ONLY. Follows the app's own rule (src/lib/art-delivery.ts): a canonical /cartilla/art/faithful/*.webp is loaded as the
delivery file /cartilla/art/delivery/faithful/<384|768>/... (384 at 1x, 768 at 2x); everything else loads as-is.
Checks: (1) app code/data names the path, (2) delivery file exists, (3) delivery file still matches the canonical picture
(not stale), (4) the picture is not just the raw book crop. Writes docs/art-inventory/app-loaded.json
Needs: Pillow, numpy, ripgrep."""
import json, os, re, subprocess, collections, csv, datetime
import numpy as np
from PIL import Image
OUT="docs/art-inventory/app-loaded.json"
slots=json.load(open("docs/art-inventory/slots-327.json"))
cmap={r["artwork_id"]:r for r in csv.DictReader(open("docs/artwork-reconciliation/mapping/MASTER-MAPPING.csv"))}
# 1. every art path the app code or app data names (tests and docs excluded)
out=subprocess.run(["rg","-o","--no-heading","-n","/cartilla/art/[A-Za-z0-9_./-]+\\.(png|webp|jpg|jpeg|svg)","src","-g","!**/__tests__/**","-g","!*.test.*","-g","*.ts","-g","*.tsx","-g","*.json"],capture_output=True,text=True).stdout
refs=collections.defaultdict(set)
for line in out.splitlines():
    f,_,rest=line.split(":",2)[0],None,line.split(":",2)[2]
    refs["public"+rest].add(line.split(":",1)[0])
import io, base64
def openimg(path):
    if path.lower().endswith(".svg"):
        m=re.search(r'href="data:image/[a-z+]+;base64,([^"]+)"',open(path,errors="ignore").read())
        return Image.open(io.BytesIO(base64.b64decode(m.group(1)))) if m else None
    return Image.open(path)
def comp(path):
    im=openimg(path).convert("RGBA"); bg=Image.new("RGBA",im.size,(255,255,255,255)); bg.alpha_composite(im); return bg.convert("RGB")
def sig(im,n=48): return np.asarray(im.convert("L").resize((n,n),Image.BILINEAR)).astype(np.float32)
def crop_of(x):
    try:
        if x["crop_box_940x1308"]:
            im=Image.open(x["scan_source"]).convert("RGB"); X,Y,W,H=x["crop_box_940x1308"]; sx=im.width/940; sy=3458/1308
            return im.crop((int(X*sx),int(Y*sy),int((X+W)*sx),int((Y+H)*sy)))
        c=cmap.get(x["artwork_id"])
        if c and os.path.isfile(c["source_crop_path"]): return Image.open(c["source_crop_path"]).convert("RGB")
    except Exception: pass
    return None
FAITH="public/cartilla/art/faithful/"
res={}; cnt=collections.Counter()
for x in slots:
    p=x["live_picture"]; r={"inventory_showed":p}; ext=os.path.splitext(p)[1].lower()
    refd=sorted(refs.get(p,[]))
    r["named_by_app_code_or_data"]=bool(refd); r["named_in"]=refd[:3]
    if p.startswith(FAITH) and ext==".webp" and not p.startswith(FAITH+"flipchart-native/"):
        rel=p[len(FAITH):]; d384=f"public/cartilla/art/delivery/faithful/384/{rel}"; d768=f"public/cartilla/art/delivery/faithful/768/{rel}"
        r["app_loads"]=d768; r["app_loads_1x"]=d384; r["rule"]="delivery file (art-delivery.ts)"
        r["delivery_exists"]=os.path.isfile(d768) and os.path.isfile(d384)
        if r["delivery_exists"]:
            a=comp(p); b=comp(d768)
            diff=float(np.abs(sig(a)-sig(b)).mean()); r["delivery_vs_canonical_diff"]=round(diff,2); r["delivery_size"]=list(openimg(d768).size)
            r["delivery_stale"]=diff>6
            r["same_file_as_shown"]=False
    else:
        r["app_loads"]=p; r["rule"]="loaded as is"; r["delivery_exists"]=None; r["same_file_as_shown"]=True
    # raw crop test on the file the app loads
    ap=r["app_loads"]
    if os.path.isfile(ap):
        im=openimg(ap)
        if im is None: r["vector_only"]=True; res[x["slot_id"]]=r; continue
        has_a=im.mode in("RGBA","LA") or (im.mode=="P" and "transparency" in im.info)
        cr=crop_of(x)
        if cr is not None:
            d=float(np.abs(sig(comp(ap))-sig(cr)).mean()); r["diff_vs_book_crop"]=round(d,2)
            r["raw_crop_suspect"]=(not has_a) and d<14 and ext in(".png",".jpg",".jpeg")
        else: r["raw_crop_suspect"]=(not has_a) and ext in(".png",".jpg",".jpeg") and None
        r["has_transparency"]=bool(has_a)
    else: r["app_file_missing"]=True
    r["his"]=x["installed_by_him"]=="yes"
    res[x["slot_id"]]=r
    for k,v in dict(not_named=not r["named_by_app_code_or_data"],stale=r.get("delivery_stale"),missing=r.get("app_file_missing"),differs=not r["same_file_as_shown"],raw=r.get("raw_crop_suspect")).items():
        if v: cnt[k]+=1
his=[k for k,v in res.items() if v["his"]]
summary=dict(total=len(slots),his_new=len(his),
  app_file_differs_from_shown=sum(1 for v in res.values() if not v["same_file_as_shown"]),
  not_named_by_app=sum(1 for v in res.values() if not v["named_by_app_code_or_data"]),
  delivery_stale=sum(1 for v in res.values() if v.get("delivery_stale")),
  app_file_missing=sum(1 for v in res.values() if v.get("app_file_missing")),
  raw_crop_suspects=sum(1 for v in res.values() if v.get("raw_crop_suspect")),
  his_new_raw_crop_suspects=[k for k in his if res[k].get("raw_crop_suspect")],
  his_new_not_named=[k for k in his if not res[k]["named_by_app_code_or_data"]],
  his_new_stale_delivery=[k for k in his if res[k].get("delivery_stale")],
  his_new_opaque=[k for k in his if res[k].get("has_transparency") is False])
doc=dict(commit=os.environ.get("AUDIT_COMMIT") or subprocess.check_output(["git","rev-parse","HEAD"],text=True).strip(),built=datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="minutes"),summary=summary,slots=res)
json.dump(doc,open(OUT,"w"),separators=(",",":"))
print(json.dumps(summary,indent=1))
