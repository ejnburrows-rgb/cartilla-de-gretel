"""Export authoring material. Audio bytes and private sources are never copied."""
import argparse
import csv
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / 'docs/tutor/dialogue'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('output', type=Path, help='New or empty output directory')
out = parser.parse_args().output
out.mkdir(parents=True, exist_ok=True)
if any(out.iterdir()):
    parser.error('Choose an empty output directory.')

def load(path):
    return json.loads(path.read_text())

def table(name, rows):
    with (out / name).open('w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=rows[0])
        writer.writeheader()
        writer.writerows(rows)

def write_json(name, value):
    (out / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def clean(text):
    return re.sub(r'\s*\(reuse: [^)]*\)$', '', text.removeprefix('[DRAFT — owner to approve] ')).strip()

manifest = load(ROOT / 'src/content/tutor-lines.json')
authored = [json.loads(line) for path in sorted(CATALOG.glob('draft-*.jsonl'))
            for line in path.read_text().splitlines()]
ids = [r['lineId'] for r in authored + manifest['approved'] + manifest['pending']]
if len(set(ids)) != len(ids):
    raise ValueError('Duplicate stable line ID')

installed = {}
inventory = []
for line in manifest['approved']:
    audio = ROOT / 'public' / line['src'].lstrip('/')
    duration = subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries',
        'format=duration', '-of', 'csv=p=0', audio], text=True).strip()
    entry = dict(**line, bytes=audio.stat().st_size, durationSeconds=float(duration),
                 sha256=hashlib.sha256(audio.read_bytes()).hexdigest())
    inventory.append(entry)
    installed.setdefault(line['text'], []).append(line['lineId'])
write_json('approved-inventory.json', inventory)
legacy = {}
for line in manifest['pending']:
    legacy.setdefault(clean(line['text']), []).append(line['lineId'])
write_json('legacy-pending.json', manifest['pending'])

# A single recording of identical wording serves all eligible contexts.
# Prefer previously installed speech or a pre-existing pending ID on an exact match.
clips = {}
index = []
matrix = []
extended = []
for row in authored:
    text = row['text']
    if not text or text != clean(text) or text.count('¿') > 1 or len(text.split()) >= 75:
        raise ValueError(f'Invalid recording text for {row["lineId"]}')
    name = row['lineId']
    if name.startswith('dialogue-universal'):
        group = 'universal'
    elif name.startswith('dialogue-technical'):
        group = 'technical'
    else:
        group = 'lessons'
    if text not in clips:
        recording_id = (installed.get(text) or legacy.get(text) or [name])[0]
        clip = dict(recordingId=recording_id, filename=f'{recording_id}.mp3',
                    batch=None, sequence=None, status='pending original-source reconciliation')
        if text in installed:
            clip.update(filename=next(r['src'] for r in inventory if r['lineId']==recording_id),
                        status='existing approved')
        else:
            index.append(dict(group=group, text=text, purpose=row['intent'], scope=row['lesson'] or group,
                              **clip))
        clips[text] = clip
    matrix.append(dict(lineId=name, intent=row['intent'], teachingFunction=row['role'],
        lesson=row['lesson'], objective=row['intent'], flipchartSheet=row['flipchartSheet'],
        relatedFlipchartSheets=row['relatedFlipchartSheets'], workbookPage=row['workbookPage'],
        workbookPdfSheet=row['workbookPdfSheet'], workbookActivity=row['activity'],
        commonError=row['commonError'], hintLevel=row['hintLevel'], expectedResponse=row['expectedResponse'],
        answer=row['answer'], applicationAction='proposed only' if row['activity'] else 'none',
        eligibility=row['eligibility'], existingApprovedAudio='|'.join(installed.get(text, []))))
    extended.append(dict(**row, variationGroup=row['intent'], expression='warm', gesture=None,
        presentationAction=None, cueTiming=None, cooldownTurns=5, priority=1,
        sourceChecksum=None, verifiedDuration=None, visemePath=None,
        validationStatus='draft', approvalStatus='pending', requiresEarReview=True))

for group in ('universal','technical','lessons'):
    scoped = [r for r in index if r['group']==group]
    batch_count = (len(scoped)+39)//40
    for b in range(batch_count):
        start,end = b*len(scoped)//batch_count,(b+1)*len(scoped)//batch_count
        batch=f'{group}-{b+1:02}'
        lines=scoped[start:end]
        for seq,record in enumerate(lines,1):
            record.update(batch=batch, sequence=seq)
            clips[record['text']].update(batch=batch,sequence=seq)
        (out/f'{batch}.txt').write_text('\n'.join(r['text'] for r in lines)+'\n')
for row in extended:
    row.update(clips[row['text']])
write_json('dialogue-manifest.json', dict(approved=inventory,pending=manifest['pending'],draft=extended))
table('recording-index.csv',index)
table('coverage-matrix.csv',matrix)
sheets=load(ROOT/'src/data/teacher-flipchart.json')['pages']
counts=[]
for lesson in range(25):
    rows=[r for r in extended if (r['lesson'] or 0)==lesson]
    unique={r['text'] for r in rows if r['status']!='existing approved'}
    words=sum(len(t.split()) for t in unique)
    seconds=words*60/115
    counts.append(dict(lesson=lesson or 'shared',contexts=len(rows),distinctDraftTexts=len(unique),
        printedPages=' '.join(map(str,sorted({r['workbookPage'] for r in rows if r['workbookPage']}))),
        flipchartSheets=' '.join(str(s['flipchartPage']) for s in sheets if s['lesson']==lesson and lesson),
        existingAudioIds=sum(r['lesson']==lesson for r in inventory),
        estimatedSpeechMinutes=round(seconds/60,1),estimatedAudioMB=round(seconds*.008,2),
        officialAssessmentSource='full master pending' if 0<lesson<7 else 'full text listed in SOURCE_STATUS' if lesson else None,
        runtimeAssessment='unverified'))
table('lesson-coverage.csv',counts)
print(f"{len(authored)} proposed contexts; {len(index)} distinct draft utterances; "
      f"{len(inventory)} approved records; {len(legacy)} distinct legacy pending texts.")
print(f"Estimated speech {sum(len(r['text'].split()) for r in index)/115:.1f} minutes at 115 words/minute.")
