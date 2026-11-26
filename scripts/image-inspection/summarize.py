"""Merge per-surface inspection results into one CSV + summary counts.
usage: python3 scripts/image-inspection/summarize.py RESULTS_DIR OUT_DIR"""
import csv, json, os, sys, glob
from collections import Counter, defaultdict
from _paths import safe_dir, arg
src, out = safe_dir(arg(1)), safe_dir(arg(2))
os.makedirs(out, exist_ok=True)
rows, notes, views = [], [], Counter()
for f in sorted(glob.glob(os.path.join(src, "*", "results.json"))):
    for r in json.load(open(f))["results"]:
        if "records" not in r:
            notes.append(r); continue
        views[(r["surface"], r["viewport"])] += 1
        if not r["records"]:
            rows.append({"surface": r["surface"], "view": r["id"], "viewport": r["viewport"], "src": "(no pictures on this view)", "result": "NO PICTURES"})
        for x in r["records"]:
            rows.append({"surface": r["surface"], "view": r["id"], "viewport": r["viewport"], "src": x["src"], "kind": x["kind"],
                         "natural": x["natural"], "box": x["box"], "fit": x["fit"], "upscale": x.get("upscale", ""),
                         "clipped": x.get("clipped", ""), "distortion": x.get("distortion", ""), "fitCrop": x.get("fitCrop", ""),
                         "result": ";".join(x["issues"]) or "PASS"})
fields = ["surface", "view", "viewport", "src", "kind", "natural", "box", "fit", "upscale", "clipped", "distortion", "fitCrop", "result"]
with open(os.path.join(out, "inspection-results.csv"), "w", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=fields); w.writeheader(); w.writerows(rows)
summary = defaultdict(Counter)
unique = defaultdict(set)
for r in rows:
    if r["result"] == "NO PICTURES": continue
    summary[(r["surface"], r["viewport"])][r["result"]] += 1
    unique[r["surface"]].add(r["src"])
flagged = defaultdict(set)
for r in rows:
    if r["result"] not in ("PASS", "NO PICTURES"):
        flagged[(r["surface"], r["src"].split("?")[0], r["result"])].add(f'{r["view"]}@{r["viewport"]}')
res = {"views": {f"{k[0]}/{k[1]}": v for k, v in views.items()},
       "pictureChecks": {f"{k[0]}/{k[1]}": dict(v) for k, v in summary.items()},
       "uniquePictures": {k: len(v) for k, v in unique.items()},
       "flagged": [{"surface": k[0], "src": k[1], "result": k[2], "where": sorted(v)} for k, v in sorted(flagged.items())],
       "notes": notes}
json.dump(res, open(os.path.join(out, "inspection-summary.json"), "w"), indent=1, ensure_ascii=False)
print(json.dumps({k: res[k] for k in ("views", "pictureChecks", "uniquePictures")}, indent=1))
for f in res["flagged"]:
    print(f["surface"], f["result"], f["src"], len(f["where"]), f["where"][:3])
