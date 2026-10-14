import collections, hashlib, json, re
from pathlib import Path
p=Path(__file__).parent
a=json.loads((p/'availability-inventory.json').read_text())
assert len(a['groups'])==201 and len(a['placements'])==330
assert len({r['artwork_id'] for r in a['placements']})==330
assert collections.Counter(g['availability'] for g in a['groups'])==a['counts']['drawing_groups']
assert sorted(x for g in a['groups'] for x in g['placements'])==sorted(r['artwork_id'] for r in a['placements'])
assert len(a['withheld_files'])==50 and all(w['affected_artwork_ids'] is None for w in a['withheld_files'])
for r in a['placements']:
 assert not r['production_mapping_changed']
 if r['availability']=='OPTIMIZATION NEEDED': assert (p/r['missing_original_reference']).exists()
for name in ['availability-inventory.md','missing-originals.md','withheld-associations.md']:
 for link in re.findall(r'\]\(([^)]+)\)',(p/name).read_text()):
  if not link.startswith(('https:','#')): assert (p/link.split('#')[0]).exists(),link
for r in json.loads((p/'missing-originals/provenance.json').read_text()):
 assert hashlib.sha256((p/'missing-originals'/(r['artwork_id']+'.png')).read_bytes()).hexdigest()==r['sha256']
print('PASS: 201 groups / 330 memberships; exact counts; 50 explicit unknown associations; gallery links and new crop hashes; no production-mapping edits')

# Check the canonical readable and per-placement masters (no status inference from filenames).
import csv
master=list(csv.DictReader((p/'MASTER-MAPPING.csv').open(encoding='utf-8-sig',newline='')))
assert len(master)==330 and len({r['artwork_id'] for r in master})==330
placements={r['artwork_id']:r for r in a['placements']}
assert set(placements)=={r['artwork_id'] for r in master}
groups={g['group_id']:g for g in a['groups']}
assert len(groups)==201
for r in master:
 original=placements[r['artwork_id']]
 assert r['drawing_group']==original['drawing_group_id']
 assert r['label']==groups[r['drawing_group']]['label']
 assert r['selected_sha256']==((original.get('selected_match') or {}).get('sha256') or '')
 assert r['group_availability']=={'OPTIMIZED VERSION EXISTS':'READY','OPTIMIZATION NEEDED':'NEEDS OPTIMIZATION','UNRESOLVED':'UNRESOLVED'}[groups[r['drawing_group']]['availability']]
 assert r['original_placement_crop']==original['source_crop']
assert groups['DRAW-WB-10-1']['label']=='avión'  # visually established despite PEZ IDs
assert all(r['label']=='avión' for r in master if r['drawing_group']=='DRAW-WB-10-1')
assert (p/'MASTER-MAPPING.md').exists()
print('PASS: MASTER-MAPPING 201 groups / 330 unique placement records, source/destination SHA and airplane identity')
