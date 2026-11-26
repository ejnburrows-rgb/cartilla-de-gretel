"""Historical-content search for the seven Workbook pictures with no HD source.

Scans the tree of every fetched remote branch (refs/remotes/allbr/*, fetched with
--filter=blob:none, so only file listings) plus main's full history for any image path
whose name matches one of the seven words, and lists each distinct blob that differs
from the file on main. Writes PROOF/owner-intake-reconciliation/history-search.json.
"""
import json, os, re, subprocess
from _paths import PROOF, ROOT

WORDS = {"nino": r"ni(n|ñ)o", "pajaro": r"p(a|á)jaro", "pera": r"pera", "taza": r"taza",
         "ola": r"ola", "aguila": r"(a|á)guila", "ardilla": r"ardilla"}
MAIN = {"nino": "leccion-14-n/nino", "pajaro": "leccion-1/pajaro", "pera": "leccion-1/pera", "taza": "leccion-1/taza",
        "ola": "vocal-o/ola", "aguila": "leccion-1/aguila", "ardilla": "vocal-a/ardilla"}
IMG = re.compile(r"\.(png|jpe?g|webp|svg)$", re.I)

def git(*a):
    return subprocess.run(["git", *a], cwd=ROOT, capture_output=True, text=True, check=True).stdout

main_blob = {w: git("rev-parse", f"origin/main:public/cartilla/art/faithful/{p}.webp").strip() for w, p in MAIN.items()}
refs = git("for-each-ref", "refs/remotes/allbr", "--format=%(refname:short)").split()
pat = {w: re.compile(r"(^|[/_-])" + rx + r"([._-]|$)", re.I) for w, rx in WORDS.items()}
found = {w: {} for w in WORDS}

def scan(listing, where):
    for line in listing.splitlines():
        meta, _, path = line.partition("\t")
        parts = meta.split()
        if len(parts) < 3 or parts[1] != "blob" or not IMG.search(path):
            continue
        name = os.path.basename(path)
        for w, p in pat.items():
            if p.search(name) and parts[2] != main_blob[w]:
                found[w].setdefault(parts[2], {"paths": set(), "where": set()})
                found[w][parts[2]]["paths"].add(path)
                found[w][parts[2]]["where"].add(where)

for r in refs:
    scan(git("ls-tree", "-r", r), r)
# main's own history (deleted or replaced versions)
for w, p in MAIN.items():
    for c in git("log", "origin/main", "--format=%H", "--", f"public/cartilla/art/faithful/{p}.webp").split():
        try:
            scan(git("ls-tree", c, f"public/cartilla/art/faithful/{p}.webp").replace(" ", " ", 1), f"main@{c[:8]}")
        except subprocess.CalledProcessError:
            pass

out = {"branchesScanned": len(refs), "mainBlob": main_blob,
       "otherVersions": {w: [{"blob": b, "paths": sorted(v["paths"]), "where": sorted(v["where"])[:6], "refCount": len(v["where"])}
                             for b, v in found[w].items()] for w in WORDS}}
json.dump(out, open(os.path.join(PROOF, "owner-intake-reconciliation", "history-search.json"), "w"), indent=1, ensure_ascii=False)
for w, v in out["otherVersions"].items():
    print(w, len(v), [x["paths"][0] for x in v][:8])
