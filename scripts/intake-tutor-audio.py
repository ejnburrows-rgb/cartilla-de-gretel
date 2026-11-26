"""Private, local intake of owner recordings. Outputs are for listening review."""
import argparse
import csv
import hashlib
import json
import math
import os
import re
import shutil
import subprocess
import tempfile
import unicodedata
import wave
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = '239e3518f364adfcefab39f4220a4b2b85a6e3987679af823d7ef0f26f76935d'
os.umask(0o077)

def digest(path):
    with path.open('rb') as f:
        return hashlib.file_digest(f, 'sha256').hexdigest()

def tokens(text):
    return tuple(re.findall(r'[^\W_]+', unicodedata.normalize('NFC', text.lower())))

def save(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')

def command(*args):
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout

def decode(path, wav):
    command('ffmpeg','-nostdin','-v','error','-xerror','-protocol_whitelist','file,pipe',
            '-i',path,'-map','0:a:0','-vn','-ac','1','-ar','16000','-c:a','pcm_s16le',wav)

def recognize(wav, model):
    from vosk import KaldiRecognizer
    recognizer = KaldiRecognizer(model, 16000)
    recognizer.SetWords(True)
    words = []
    with wave.open(str(wav),'rb') as f:
        while chunk := f.readframes(8000):
            if recognizer.AcceptWaveform(chunk):
                words.extend(json.loads(recognizer.Result()).get('result', []))
    return words + json.loads(recognizer.FinalResult()).get('result', [])

def align(words, index, duration):
    # Compare heard words in observed order with any complete script line.
    # Only cut in gaps between recognized words; ambiguous boundaries need a human.
    by_first = defaultdict(list)
    for row in index:
        phrase = tokens(row['text'])
        if phrase:
            by_first[phrase[0]].append((phrase,row))
    heard = [w['word'] for w in words]
    found = []
    cursor = 0
    while cursor < len(words):
        candidates = [(phrase,row) for phrase,row in by_first[heard[cursor]]
                      if tuple(heard[cursor:cursor+len(phrase)]) == phrase]
        if len(candidates)!=1:
            found.append(dict(status='ambiguous' if candidates else 'unmatched',
                              **words[cursor]))
            cursor+=1
            continue
        phrase,row = candidates[0]
        end=cursor+len(phrase)
        start_time,last=words[cursor]['start'],words[end-1]['end']
        previous=words[cursor-1]['end'] if cursor else 0
        following=words[end]['start'] if end < len(words) else duration
        gaps_ok=(cursor==0 or start_time-previous>=0.25) and (end==len(words) or following-last>=0.25)
        confident=all(w.get('conf',0)>=0.85 for w in words[cursor:end])
        found.append(dict(recordingId=row['recordingId'],batch=row['batch'],
            sequence=int(row['sequence']),text=row['text'],
            start=0 if cursor==0 else (previous+start_time)/2,
            end=duration if end==len(words) else (following+last)/2,
            status='candidate' if gaps_ok and confident else 'review boundaries or transcript'))
        cursor=end
    return found

def inspect_media(path):
    result=json.loads(command('ffprobe','-v','error','-protocol_whitelist','file,pipe',
        '-show_entries','format=format_name,duration:stream=codec_type','-of','json',path))
    allowed={'mp3','wav','mov','mp4','m4a','matroska','webm','avi','ogg','flac','mpeg','mpegts'}
    if not allowed.intersection(result['format']['format_name'].split(',')):
        raise ValueError('Unsupported recording container')
    if not any(s.get('codec_type')=='audio' for s in result['streams']):
        raise ValueError('No audio stream')

def intake(src, vault, approved, index, load_model, expected):
    source_hash=digest(src)
    original=vault/'originals'/source_hash
    original.parent.mkdir(exist_ok=True)
    if not original.exists():
        with tempfile.NamedTemporaryFile(dir=original.parent, delete=False) as tmp:
            with src.open('rb') as stream:
                shutil.copyfileobj(stream,tmp)
        temp=Path(tmp.name)
        if digest(temp)!=source_hash:
            temp.unlink()
            raise ValueError('Source changed during copy')
        temp.replace(original)
    if digest(original)!=source_hash:
        raise ValueError('Private original failed checksum')
    report=dict(sourceSha256=source_hash, approvedOriginalMaster=source_hash==ORIGINAL,
                findings=[],activation='none',auditoryReview='required for new mappings')
    # Each pass uses a private, unique directory so retries preserve prior evidence.
    review=Path(tempfile.mkdtemp(prefix=source_hash[:12]+'-',dir=vault))
    inspect_media(original)
    with tempfile.TemporaryDirectory(dir=review) as temporary:
        wav=Path(temporary)/'source.wav'
        decode(original,wav)
        with wave.open(str(wav),'rb') as stream:
            duration=stream.getnframes()/stream.getframerate()
        report['decodedSeconds']=duration
        if source_hash in approved:
            for entry in approved[source_hash]:
                cues=json.loads((ROOT/'public'/entry['visemes'].lstrip('/')).read_text())
                report['findings'].append(dict(lineId=entry['lineId'],text=entry['text'],
                    status='identical to approved installed bytes',visemePath=entry['visemes'],
                    cueCount=len(cues if isinstance(cues,list) else cues['mouthCues'])))
        else:
            model=load_model()
            if model is None:
                report['findings'].append(dict(status='local alignment model unavailable'))
            else:
                words=recognize(wav,model)
                found=align(words,index,duration)
                report['findings']=found
                hits=[r for r in found if 'recordingId' in r]
                counts=Counter(r['recordingId'] for r in hits)
                report['matchedBatches']=sorted({r['batch'] for r in hits})
                report['repeated']=[name for name,n in counts.items() if n>1]
                report['outOfOrder']=any(b['sequence']<a['sequence'] for a,b in zip(hits,hits[1:]) if a['batch']==b['batch'])
                batches={expected} if expected else set(report['matchedBatches'])
                report['missing']=[r['recordingId'] for r in index if r['batch'] in batches and not counts[r['recordingId']]]
                for pos,r in enumerate(found):
                    if r['status']!='candidate': continue
                    clip=review/f'candidate-{pos+1:04}.wav'
                    command('ffmpeg','-nostdin','-v','error','-i',wav,'-ss',str(r['start']),
                            '-t',str(r['end']-r['start']),'-c:a','pcm_s16le',clip)
                    r['privateCandidate']=clip.name
                    with wave.open(str(clip),'rb') as f:
                        import array
                        samples=array.array('h',f.readframes(f.getnframes()))
                    r['fullScaleSamples']=sum(x>=32767 or x<=-32768 for x in samples)
                    r['rmsDbfs']=round(10*math.log10(max(sum(x*x for x in samples)/max(len(samples),1),1)/32768**2),1)
                    r['musicNoiseStutter']='requires listening review'
    save(review/'report.json', report)
    return review/'report.json'

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('recordings',nargs='+',type=Path)
    p.add_argument('--private-directory',type=Path,required=True)
    p.add_argument('--recording-index',type=Path,required=True)
    p.add_argument('--model',type=Path,help='Unpacked offline Spanish Vosk model')
    p.add_argument('--expected-batch',help='Optional expected batch for a missing-line report')
    a=p.parse_args()
    vault=a.private_directory.resolve()
    if vault.is_relative_to(ROOT) or any((parent/'.git').exists() for parent in (vault,*vault.parents)):
        p.error('Use a private directory outside every repository')
    if vault.exists() and (vault.stat().st_mode & 0o077):
        p.error('Private directory must have owner-only permissions')
    vault.mkdir(parents=True,exist_ok=True)
    with a.recording_index.open() as f: index=list(csv.DictReader(f))
    if a.expected_batch and a.expected_batch not in {r['batch'] for r in index}:
        p.error('Unknown expected batch')
    known=defaultdict(list)
    for r in json.loads((ROOT/'src/content/tutor-lines.json').read_text())['approved']:
        known[digest(ROOT/'public'/r['src'].lstrip('/'))].append(r)
    model=None
    def load_model():
        nonlocal model
        if a.model and model is None:
            from vosk import Model
            model=Model(str(a.model.resolve()))
        return model
    failed=False
    for recording in a.recordings:
        try: print(intake(recording.resolve(),vault,known,index,load_model,a.expected_batch))
        except (OSError,ValueError,ImportError,subprocess.CalledProcessError) as exc:
            print(f'Intake failed for {recording.name}: {exc}',file=__import__('sys').stderr)
            failed=True
    raise SystemExit(int(failed))
if __name__=='__main__': main()
