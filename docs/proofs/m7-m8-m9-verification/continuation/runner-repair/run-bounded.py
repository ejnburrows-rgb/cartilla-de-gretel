from pathlib import Path
import datetime, hashlib, json, os, subprocess, sys

root = Path.cwd()
label = sys.argv[1]
directory = root / 'docs/proofs/m7-m8-m9-verification/continuation/runner-repair' / label
directory.mkdir(parents=True, exist_ok=True)
command = ['pnpm.cmd', 'exec', 'playwright', 'test', *sys.argv[2:], '--workers=1', '--reporter=line,json', '--output=' + str(directory / 'artifacts')]
env = dict(os.environ, PLAYWRIGHT_JSON_OUTPUT_FILE=str(directory / 'results.json'))
record = {'startedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'wrapperPid': os.getpid(), 'head': subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip(), 'command': command, 'status': 'running'}
receipt = directory / 'completion.json'
def save():
    temporary = receipt.with_suffix('.tmp')
    temporary.write_text(json.dumps(record, indent=2), encoding='utf-8')
    temporary.replace(receipt)
save()
try:
    with (directory / 'stdout.txt').open('w', encoding='utf-8') as out, (directory / 'stderr.txt').open('w', encoding='utf-8') as err:
        process = subprocess.Popen(command, stdout=out, stderr=err, env=env)
        record['runnerPid'] = process.pid
        save()
        record['exitCode'] = process.wait()
    result = directory / 'results.json'
    record['jsonPresent'] = result.exists()
    if result.exists():
        record['jsonSha256'] = hashlib.sha256(result.read_bytes()).hexdigest()
        record['stats'] = json.loads(result.read_text(encoding='utf-8'))['stats']
    record['status'] = 'finished'
except BaseException as error:
    record['status'] = 'wrapper-error'
    record['error'] = repr(error)
    raise
finally:
    record['finishedUtc'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    save()
    print(json.dumps(record, indent=2))
sys.exit(record.get('exitCode', 1))
