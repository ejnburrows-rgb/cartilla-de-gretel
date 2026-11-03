"""Run selected E2E checks with immutable, checkout-anchored evidence."""
from pathlib import Path
import datetime, hashlib, json, os, re, subprocess, sys

def checkout_root():
    root = Path(__file__).resolve().parents[5]
    if not (root / '.git').exists() or Path.cwd().resolve() != root:
        raise ValueError('Run from the checkout containing this script')
    return root

def create_run_directory(root, label):
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]{0,63}', label):
        raise ValueError('Use a simple unique run label')
    root = root.resolve()
    base = (root / 'docs/proofs/m7-m8-m9-verification/continuation/runner-repair/runs').resolve()
    target = (base / label).resolve()
    if not base.is_relative_to(root) or not target.is_relative_to(base):
        raise ValueError('Evidence directory leaves the checkout')
    target.mkdir(parents=True, exist_ok=False)
    return target

def main(argv):
    root = checkout_root()
    if len(argv) < 2:
        raise ValueError('Provide a unique run label and selected test arguments')
    directory = create_run_directory(root, argv[0])
    command = ['pnpm.cmd' if os.name == 'nt' else 'pnpm', 'exec', 'playwright', 'test', *argv[1:], '--workers=1', '--reporter=line,json', '--output=' + str(directory / 'artifacts')]
    env = dict(os.environ, PLAYWRIGHT_JSON_OUTPUT_FILE=str(directory / 'results.json'))
    record = {'startedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'wrapperPid': os.getpid(), 'head': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(), 'command': command, 'status': 'running'}
    receipt = directory / 'completion.json'
    def save():
        temporary = receipt.with_suffix('.tmp')
        temporary.write_text(json.dumps(record, indent=2), encoding='utf-8')
        temporary.replace(receipt)
    save()
    try:
        with (directory / 'stdout.txt').open('x', encoding='utf-8') as out, (directory / 'stderr.txt').open('x', encoding='utf-8') as err:
            process = subprocess.Popen(command, stdout=out, stderr=err, cwd=root, env=env)
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
    return record.get('exitCode', 1)

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
