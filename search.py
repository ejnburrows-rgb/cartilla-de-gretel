import json
layouts = json.load(open('src/data/page-layouts.json', encoding='utf-8'))
for pid, p in layouts['pages'].items():
    for r in p.get('regions', []):
        rt = r.get('regionType')
        if 'frecuente' in str(r).lower() or 'palabras' in r.get('id', '').lower() or 'sight' in str(r).lower():
            print(f"Page {pid}, Region {rt}, id {r.get('id')}, text/words: {r.get('text', '')} {r.get('words', '')}")
