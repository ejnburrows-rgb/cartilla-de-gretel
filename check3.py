import json
layouts = json.load(open('src/data/page-layouts.json', encoding='utf-8'))
for pid in range(56, 92):
    pid = str(pid)
    print(f'=== Page {pid} ===')
    p = layouts['pages'].get(pid, {})
    for r in p.get('regions', []):
        rt = r.get('regionType')
        print(f'{rt} | {r.get("id")}')
