import json
layouts = json.load(open('src/data/page-layouts.json', encoding='utf-8'))
for pid in ['19', '20', '21', '22']:
    print(f'=== Page {pid} ===')
    for r in layouts['pages'].get(pid, {}).get('regions', []):
        rt = r.get('regionType')
        text = r.get('text', '')
        print(f'{rt} | {text}')
