#!/usr/bin/env python3
"""Build the one-page art inventory: original book crop beside the live picture, per slot.
Reads only repo files. Totals are computed here, never typed by hand, and stamped with the commit.
Slot list: docs/art-inventory/slots-327.json (327 slots: 167 flip chart, 160 workbook)
Usage: python3 scripts/build_art_inventory.py [--out docs/art-inventory]
Inputs (all in the repo):
  docs/artwork-reconciliation/mapping/MASTER-MAPPING.csv   slot list + original crop path
  docs/art-inventory/slot-overrides.json (optional)        {slot_id: {"live": path, "status": "...", "note": "..."}}
Needs: Pillow."""
import csv, json, os, sys, base64, io, subprocess, datetime, html, collections
from PIL import Image
root = subprocess.check_output(["git","rev-parse","--show-toplevel"],text=True).strip()
os.chdir(root)
out = "docs/art-inventory"
if "--out" in sys.argv: out = sys.argv[sys.argv.index("--out")+1]
sha = subprocess.check_output(["git","rev-parse","HEAD"],text=True).strip()
branch = subprocess.check_output(["git","rev-parse","--abbrev-ref","HEAD"],text=True).strip()
when = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
slots_in = json.load(open("docs/art-inventory/slots-327.json"))
cmap = {r["artwork_id"]: r for r in csv.DictReader(open("docs/artwork-reconciliation/mapping/MASTER-MAPPING.csv"))}
CREAM=(251,246,232)
def enc(im, w=240):
    im = im.convert("RGBA"); bg = Image.new("RGBA", im.size, CREAM+(255,)); bg.alpha_composite(im)
    im = bg.convert("RGB"); im.thumbnail((w, w*2))
    b = io.BytesIO(); im.save(b, "JPEG", quality=62); return "data:image/jpeg;base64,"+base64.b64encode(b.getvalue()).decode()
def live_thumb(path):
    try: im=Image.open(path); im.load(); return enc(im)
    except Exception: return None
def orig_ref(x):
    """Same choice as orig_thumb, as data the live Command Center page can draw in the browser."""
    try:
        if x["crop_box_940x1308"]:
            im=Image.open(x["scan_source"]); X,Y,W,H=x["crop_box_940x1308"]
            sx=im.width/940; sy=3458/1308; px,py=W*0.08,H*0.10
            L=max(0,int((X-px)*sx));T=max(0,int((Y-py)*sy));R=min(im.width,int((X+W+px)*sx));B=min(im.height,int((Y+H+py)*sy))
            return dict(kind="scan",src=x["scan_source"],sw=im.width,box=[L,T,R-L,B-T])
        c=cmap.get(x["artwork_id"])
        if c and os.path.isfile(c["source_crop_path"]): return dict(kind="image",src=c["source_crop_path"])
        return dict(kind="image",src=x["scan_source"],whole_page=True)
    except Exception: return None
def orig_thumb(x):
    """Original book crop. Flip chart: cut from the real book scan with the recorded box.
    Workbook: the audited crop file when it exists, else the whole book page (marked)."""
    try:
        if x["crop_box_940x1308"]:
            im=Image.open(x["scan_source"]); X,Y,W,H=x["crop_box_940x1308"]
            sx=im.width/940; sy=3458/1308   # scan is 2550 wide, page area 3458 tall (install agent's scale)
            px,py=W*0.08,H*0.10  # small margin so the printed caption is not clipped
            return enc(im.crop((max(0,int((X-px)*sx)),max(0,int((Y-py)*sy)),min(im.width,int((X+W+px)*sx)),min(im.height,int((Y+H+py)*sy))))), "crop from book scan"
        c=cmap.get(x["artwork_id"])
        if c and os.path.isfile(c["source_crop_path"]): return enc(Image.open(c["source_crop_path"])), "audited crop"
        return enc(Image.open(x["scan_source"])), "WHOLE BOOK PAGE (no crop on file)"
    except Exception as e: return None, "no original image"
_sf=json.load(open("docs/art-inventory/still-flagged.json")); still=_sf["still_flagged"]; cnotes=_sf.get("cleaned_notes",{})
def note_for(x, how):
    sid=x["slot_id"]
    if sid in still: return still[sid]
    if x["status"]=="flagged": return cnotes.get(sid) or ("Was: "+x["flag_reason"])
    return x["flag_reason"] or ("" if how in ("crop from book scan","audited crop") else how)
slots=[]
for x in slots_in:
    live=x["live_picture"]; ok=os.path.isfile(live)
    if x["status"]=="flagged": st="FLAGGED" if x["slot_id"] in still else "CLEANED (was flagged)"
    elif x["installed_by_him"]=="yes": st="HIS NEW PICTURE"
    else: st="OK"
    o,how=orig_thumb(x)
    slots.append(dict(id=x["slot_id"], book="Flip Chart" if x["book"]=="flip_chart" else "Workbook", page=f'page {x["page"]}', item=x["role"],
        label=x["object"], live=live, status=st, installed_by_him=x["installed_by_him"], note=note_for(x, how),
        how=how, live_exists=ok, o=o, l=live_thumb(live) if ok else None))
tot = collections.Counter(s["status"] for s in slots)
by_book = collections.Counter(s["book"] for s in slots)
combo = collections.Counter((s["book"],s["status"]) for s in slots)
assert sum(tot.values())==len(slots)==sum(by_book.values())
data = dict(commit=sha, branch=branch, built=when, total=len(slots), by_book=by_book, by_status=tot, by_book_status={f"{k[0]} / {k[1]}":v for k,v in combo.items()},
    slots=[{k:v for k,v in s.items() if k not in("o","l")} for s in slots], missing_live_files=sum(1 for s in slots if not s["live_exists"]))
os.makedirs(out, exist_ok=True)
render=[dict(id=x["slot_id"],artwork_id=x["artwork_id"],book=x["book"],page=x["page"],label=x["object"],role=x["role"],live=x["live_picture"],
  his=x["installed_by_him"]=="yes",was_flagged=x["status"]=="flagged",flag_reason=x["flag_reason"],orig=orig_ref(x)) for x in slots_in]
json.dump(render, open(f"{out}/slots-render.json","w"), separators=(",",":"), ensure_ascii=False)
json.dump(data, open(f"{out}/inventory.json","w"), indent=1, ensure_ascii=False)
chips = "".join(f'<button data-f="{html.escape(k)}">{html.escape(k)} <b>{v}</b></button>' for k,v in tot.most_common())
cards=[]
for s in slots:
    im=lambda t,cap: (f'<figure><img loading="lazy" src="{t}"><figcaption>{cap}</figcaption></figure>' if t else f'<figure class="none"><div>no image</div><figcaption>{cap}</figcaption></figure>')
    cards.append(f'<article data-s="{html.escape(s["status"])}" data-b="{html.escape(s["book"])}"><h3>{html.escape(s["id"])} <small>{html.escape(s["book"])}, {html.escape(s["page"])}</small></h3>'
      f'<p class="lab">{html.escape(s["label"])}</p><div class="pair">{im(s["o"],"ORIGINAL BOOK")}{im(s["l"],"APP NOW")}</div>'
      f'<p class="st">{html.escape(s["status"])}</p>'+(f'<p class="nt">{html.escape(s["note"])}</p>' if s["note"] else "")+'</article>')
page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cartilla art inventory</title><style>
body{{margin:0;background:#fbf6e8;color:#1c1a14;font:18px/1.35 system-ui,sans-serif}}
header{{padding:16px;background:#1c1a14;color:#fbf6e8;position:sticky;top:0;z-index:3}}
h1{{margin:0 0 4px;font-size:26px}}h3{{margin:0;font-size:20px}}small{{font-weight:400;color:#6b6450}}
.tot{{padding:14px 16px;background:#fff8dc;border-bottom:2px solid #1c1a14}}
.tot big{{font-size:34px;font-weight:800}}.how{{font-size:15px;color:#4a4536}}
.chips{{padding:10px 12px;display:flex;flex-wrap:wrap;gap:8px}}
.chips button{{font:16px system-ui;padding:10px 12px;border:2px solid #1c1a14;border-radius:10px;background:#fff}}
.chips button.on{{background:#1c1a14;color:#fbf6e8}}
article{{margin:12px;padding:12px;background:#fff;border:2px solid #d8cfae;border-radius:14px}}
.pair{{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}}
figure{{margin:0;text-align:center}}figure img{{width:100%;height:170px;object-fit:contain;background:{"#fbf6e8"};border:1px solid #d8cfae;border-radius:8px}}
figcaption{{font-size:13px;font-weight:700;letter-spacing:.05em;margin-top:4px}}
.none div{{height:170px;display:grid;place-items:center;border:2px dashed #b33;color:#b33;border-radius:8px}}
.lab{{margin:2px 0;color:#4a4536;font-size:15px}}.st{{margin:4px 0;font-weight:700}}.nt{{margin:0;font-size:15px}}
@page{{size:4.6in 9.2in;margin:.15in}}
@media print{{body{{-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:15px}}header{{position:static}}.chips{{display:none}}article{{break-inside:avoid;margin:8px 0}}figure img{{height:150px}}.none div{{height:150px}}}}
</style></head><body>
<header><h1>Cartilla art inventory</h1><div>Built from commit <code>{sha[:10]}</code> on {when}</div></header>
<section class="tot"><big id="n">{len(slots)}</big> slots &nbsp;|&nbsp; Flip Chart {by_book["Flip Chart"]} &nbsp;|&nbsp; Workbook {by_book["Workbook"]}<br>OK {tot["OK"]} &nbsp;|&nbsp; His new pictures {tot["HIS NEW PICTURE"]} &nbsp;|&nbsp; Cleaned {tot["CLEANED (was flagged)"]} &nbsp;|&nbsp; Flagged {tot["FLAGGED"]}
<p class="how">Every number is counted by the script, one row per slot, from the slot list in the repo. Flip Chart + Workbook = All; OK + His new + Cleaned + Flagged = All (the script stops if not). Same commit gives the same numbers. Rebuild only changes numbers when the repo changes. Showing: <span id="shown">{len(slots)}</span>.</p></section>
<div class="chips"><button class="on" data-f="">All <b>{len(slots)}</b></button>{chips}</div>
<main>{"".join(cards)}</main>
<script>
const bs=[...document.querySelectorAll('.chips button')],ar=[...document.querySelectorAll('article')];
bs.forEach(b=>b.onclick=()=>{{bs.forEach(x=>x.classList.remove('on'));b.classList.add('on');let n=0;
ar.forEach(a=>{{const s=!b.dataset.f||a.dataset.s===b.dataset.f;a.style.display=s?'':'none';if(s)n++}});document.getElementById('shown').textContent=n}});
const h=decodeURIComponent(location.hash.slice(1));if(h){{const b=bs.find(x=>x.dataset.f===h);if(b)b.click()}}
</script></body></html>'''
open(f"{out}/index.html","w").write(page)
print(json.dumps(dict(total=len(slots),by_book=by_book,by_status=tot,html_kb=len(page)//1024)))
