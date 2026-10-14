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
