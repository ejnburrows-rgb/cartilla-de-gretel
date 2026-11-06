import json
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MANIFEST_PATH = os.path.join(ROOT, "docs", "art-board", "physical-page-proofs-manifest.json")
m = json.load(open(MANIFEST_PATH, encoding="utf-8"))

for doc_path in [
    os.path.join(ROOT, "docs", "art-board", "verified-optimized.html"),
    os.path.join(ROOT, "public", "art-board", "verified-optimized.html"),
]:
    if not os.path.exists(doc_path):
        continue
    html = open(doc_path, encoding="utf-8").read()
    needle = "const CATALOG = "
    idx = html.find(needle)
    if idx == -1:
        print("CATALOG not found in", doc_path)
        continue
    end_script = html.find(";\n", idx)
    cat = json.loads(html[idx + len(needle) : end_script])
    updated_count = 0
    for g in cat["groups"]:
        gid = g["group_id"]
        if gid in m:
            g["wb_page_proof"] = m[gid].get("wb_page_proof")
            g["fc_page_proof"] = m[gid].get("fc_page_proof")
            g["book_zoom"] = m[gid].get("book_zoom")
            g["pages_detail"] = m[gid].get("pages_detail", [])
            updated_count += 1
    new_cat_str = json.dumps(cat, ensure_ascii=False)
    new_html = html[: idx + len(needle)] + new_cat_str + html[end_script:]
    open(doc_path, "w", encoding="utf-8").write(new_html)
    print(f"Updated {doc_path}: {updated_count} / {len(cat['groups'])} groups with physical proofs")
