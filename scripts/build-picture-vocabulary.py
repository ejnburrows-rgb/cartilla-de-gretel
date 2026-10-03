"""Build picture names from authored content labels, never image filenames."""
import csv
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
def read(path):
    return json.loads((ROOT / path).read_text())
def key(name):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFC', name).strip()).casefold()

entries = {}
primary_images = set()
def add(src, name, reference, primary=True):
    if not src or not isinstance(name, str) or not name.strip(): return
    identity = key(name)
    entry = entries.setdefault(identity, {'key': identity, 'name': name.strip(), 'images': set(), 'references': set()})
    entry['images'].add(src)
    entry['references'].add(reference)
    if primary: primary_images.add(src)

for page, data in read('src/data/page-layouts.json')['pages'].items():
    for region in data.get('regions', []):
        ref = f'Workbook {page} / {region["id"]}'
        add(region.get('illustrationSrc'), region.get('caption') or region.get('illustrationWord'), ref)
        for field in ['cells', 'fillItems']:
            for item in region.get(field, []): add(item.get('illustrationSrc'), item.get('caption') or item.get('wordBox'), ref)
        for row in region.get('matchRows', []):
            for item in row: add(item.get('illustrationSrc'), item.get('word'), ref)
        for row in region.get('vowelRows', []):
            for item in row.get('cells', []): add(item.get('illustrationSrc'), item.get('caption'), ref)
        for pair in region.get('vowelPairs', []): add(pair.get('illustrationSrc'), pair.get('caption'), ref)
for page, data in read('src/data/flipchart-production-art.json').items():
    for item in data.get('vocab', []) + ([data['scene']] if data.get('scene') else []):
        add(item.get('src'), item.get('word'), f'Flip Chart {page} / production content')
for page, items in read('src/data/flipchart-native-assets.json').items():
    for item in items:
        if item.get('src') not in primary_images: add(item.get('src'), item.get('word'), f'Flip Chart {page} / native content')
for item in read('src/data/optimized-flipchart-exclusive.json'):
    if item.get('src') not in primary_images: add(item.get('src'), item.get('word'), f'Flip Chart {item["flipchartPage"]} / optimized content')
# Legacy art names cannot override corrected page labels. No slug/filename fallback.
for item in read('src/data/faithful-art-manifest.json'):
    if item.get('src') not in primary_images and item.get('word'):
        add(item['src'], item['word'], 'Verified faithful-art content', primary=False)

approved = read('src/content/picture-name-recordings.json')['approved']
recordings = {}
for entry in approved:
    if entry['key'] not in entries: raise ValueError(f'Unknown vocabulary recording: {entry["key"]}')
    if not entry.get('approval'): raise ValueError('An approved recording requires provenance')
    if not (ROOT / 'public' / entry['src'].lstrip('/')).is_file(): raise ValueError(f'Missing approved recording: {entry["src"]}')
    if entry['key'] in recordings: raise ValueError('Duplicate pronunciation recording')
    recordings[entry['key']] = entry['src']

catalog = [dict(key=e['key'], name=e['name'], images=sorted(e['images'])) for e in sorted(entries.values(), key=lambda e: e['key'])]
(ROOT / 'src/content/picture-vocabulary.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
folder = ROOT / 'docs/audio'
folder.mkdir(parents=True, exist_ok=True)
with (folder / 'MISSING_PICTURE_RECORDINGS.csv').open('w', newline='') as output:
    writer = csv.writer(output)
    writer.writerow(['pronunciation_key', 'verified_name', 'suggested_file', 'content_references'])
    for entry in sorted(entries.values(), key=lambda e: e['key']):
        if entry['key'] in recordings: continue
        filename = re.sub(r'[^\wáéíóúüñ-]+', '-', entry['key']).strip('-')
        writer.writerow([entry['key'], entry['name'], f'audio/voz/vocabulario/{filename}.mp3', '; '.join(sorted(entry['references']))])
print(f'{len(catalog)} verified names; {len(recordings)} approved recordings; {len(catalog)-len(recordings)} missing recordings.')
