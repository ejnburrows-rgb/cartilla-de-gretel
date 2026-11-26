"""One frozen complete unit check with durable results and explicit reservations."""
import datetime
import hashlib
import importlib.util
import json
import os
import platform
import subprocess
import sys
from pathlib import Path

REPO = Path('D:/Downloads/cartilla-1247-continuation-work/integration')
PLUGIN = Path('C:/Users/EJN/.codex/plugins/cache/openai-curated-remote/agent-churn-control/0.1.4')
STATE = Path('C:/Users/EJN/Documents/Codex/2026-11-03/continue-la-cartilla-de-gretel-from/work/churn-receipts.ndjson')
OUTPUT = Path(__file__).resolve().parent / 'combined-unit-gate'
NODE = Path('C:/Program Files/nodejs/node.exe')
AUDIT = REPO/'docs/proofs/m7-m8-m9-verification/continuation/runner-repair/unit-bootstrap-probes/audit-vitest-fork.cjs'

def sha(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def utc():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def git(*args):
    return subprocess.check_output(['git', *args], cwd=REPO)

def write_json(path, value):
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(value, indent=2)+'\n', encoding='utf8', newline='\n')
    temporary.replace(path)

OUTPUT.mkdir(exist_ok=False)
head = git('rev-parse', 'HEAD').decode().strip()
node_version = subprocess.check_output([str(NODE), '--version'], text=True).strip()
source_paths = ['src', 'tests', 'scripts', 'vite.config.ts', 'package.json', 'pnpm-lock.yaml', 'tsconfig.json', 'playwright.config.ts']
source_before = git('diff', '--binary', 'HEAD', '--', *source_paths)
untracked_before = git('ls-files', '--others', '--exclude-standard', '--', 'src', 'tests', 'scripts').decode().splitlines()
cli = [sys.executable, str(PLUGIN/'scripts/churn_control.py')]
policy = json.dumps(json.loads((PLUGIN/'assets/core-policy.json').read_text()), sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()
event = json.loads((PLUGIN/'assets/sample-event.json').read_text())
event.update(schema_version='1.0', event_id='combined-unit-'+head, task_id='cartilla1247-combined-qualification', attempt_id='combined-unit-'+head,
             action_kind='broad_test', action_scope_digest=sha(b'one complete policy/assets/typecheck/unit gate; default isolated forks maxWorkers1; safe startup audit; unchanged assertions and limits; discovery reconciliation'),
             requirements_digest=sha((REPO/'AGENTS.md').read_bytes()+(REPO/'PROJECT_FINISH_DEFINITION.md').read_bytes()),
             candidate_digest=sha(head.encode()+source_before), dependency_digest=sha((REPO/'pnpm-lock.yaml').read_bytes()),
             policy_digest=sha(policy), evaluator_digest=sha(Path(__file__).read_bytes()+AUDIT.read_bytes()+(REPO/'vite.config.ts').read_bytes()),
             environment_digest=sha((platform.platform()+node_version+str(NODE)).encode()))
event.pop('environment_independent', None)
write_json(OUTPUT/'event.json', event)
decision = subprocess.run([*cli,'decide','--event',str(OUTPUT/'event.json'),'--state',str(STATE),'--output',str(OUTPUT/'reservation.json')], capture_output=True, text=True)
(OUTPUT/'reservation-command.txt').write_text(decision.stdout+decision.stderr, encoding='utf8', newline='\n')
decision.check_returncode()
reservation = json.loads((OUTPUT/'reservation.json').read_text())
subprocess.run([*cli,'verify','--receipt',str(OUTPUT/'reservation.json')],check=True,stdout=subprocess.DEVNULL)
spec = importlib.util.spec_from_file_location('churn_core', PLUGIN/'scripts/churn_control.py')
core = importlib.util.module_from_spec(spec)
spec.loader.exec_module(core)
if (reservation.get('decision') not in ('allow','allow_reexecution') or reservation.get('outcome')!='pending'
    or reservation.get('evidence_accepted') is not False or (OUTPUT/'accepted.json').exists()
    or reservation.get('work_key')!=core.work_key(event)
    or reservation.get('event_fingerprint')!=core.event_fingerprint(event)):
    raise RuntimeError('No valid pending reservation for this exact work')

record = {'head':head,'nodeVersion':node_version,'startedUtc':utc(),'status':'running','sourceDiffBeforeSha256':sha(source_before),'untrackedSourceBefore':untracked_before,'checks':[]}
completion = OUTPUT/'completion.json'
write_json(completion,record)

def run_check(name, command, extra_env=None):
    item={'name':name,'command':command,'startedUtc':utc(),'status':'running'}
    record['checks'].append(item)
    environment=dict(os.environ)
    if extra_env:
        environment.pop('VITEST_STARTUP_AUDIT_OWNER',None)
        environment.update(extra_env)
    write_json(completion,record)
    with (OUTPUT/(name+'.stdout.txt')).open('xb') as out, (OUTPUT/(name+'.stderr.txt')).open('xb') as err:
        process=subprocess.Popen(command,cwd=REPO,env=environment,stdout=out,stderr=err)
        item['pid']=process.pid
        write_json(completion,record)
        item['exitCode']=process.wait()
    item.update(status='finished',finishedUtc=utc())
    write_json(completion,record)
    print(name+' exit='+str(item['exitCode']),flush=True)
    return item

try:
    run_check('policy-tests',[str(NODE),'--test','scripts/__tests__/check-merge-policy.test.mjs'])
    run_check('policy-docs',[str(NODE),'scripts/check-merge-policy.mjs','--docs'])
    run_check('assets',[str(NODE),'scripts/verify-production-assets.mjs'])
    run_check('typecheck',[str(NODE),'node_modules/typescript/bin/tsc','--noEmit'])
    discovery=run_check('unit-discovery',[str(NODE),'node_modules/vitest/vitest.mjs','list','--filesOnly','--json'])
    if discovery['exitCode']!=0:
        raise RuntimeError('Discovery failed; complete unit suite was not launched')
    discovery_rows=json.loads((OUTPUT/'unit-discovery.stdout.txt').read_text(encoding='utf-8-sig'))
    if not isinstance(discovery_rows,list) or not discovery_rows:
        raise RuntimeError('Unexpected discovery format; complete unit suite was not launched')
    discovered=[item if isinstance(item,str) else item.get('file') if isinstance(item,dict) else None for item in discovery_rows]
    if not all(isinstance(item,str) and item for item in discovered):
        raise RuntimeError('Unexpected discovery row; complete unit suite was not launched')
    write_json(OUTPUT/'discovered-files.json',discovered)
    run_check('complete-unit',[str(NODE),'--require',str(AUDIT),'node_modules/vitest/vitest.mjs','run','--pool','forks','--maxWorkers','1','--reporter=default','--reporter=json','--outputFile',str(OUTPUT/'results.json')],
              {'VITEST_STARTUP_AUDIT_FILE':str(OUTPUT/'fork-events.ndjson')})
    if not (OUTPUT/'results.json').exists():
        raise RuntimeError('Complete unit result missing')
    result=json.loads((OUTPUT/'results.json').read_text(encoding='utf-8-sig'))
    def normalize(value):
        path=Path(value)
        return str((path if path.is_absolute() else REPO/path).resolve()).replace('\\','/').lower()
    expected={normalize(path) for path in discovered}
    actual={normalize(item['name']) for item in result.get('testResults',[])}
    record['coverage']={'discoveredFiles':len(expected),'reportedFiles':len(actual),'missingFiles':sorted(expected-actual),'unexpectedFiles':sorted(actual-expected)}
    record['tests']={key:result.get(key) for key in ('numTotalTests','numPassedTests','numFailedTests','numPendingTests','success')}
    record['resultsSha256']=sha((OUTPUT/'results.json').read_bytes())
    record['unitComplete']=bool(result.get('success') is True and result.get('numTotalTests',0)>0 and result.get('numFailedTests')==0 and result.get('numPendingTests')==0 and expected==actual)
    record['status']='finished'
except BaseException as error:
    record.update(status='wrapper-error',error=repr(error))
finally:
    record['headAfter']=git('rev-parse','HEAD').decode().strip()
    record['sourceDiffAfterSha256']=sha(git('diff','--binary','HEAD','--',*source_paths))
    record['frozenSourcePreserved']=record['headAfter']==head and record['sourceDiffAfterSha256']==record['sourceDiffBeforeSha256']
    record['finishedUtc']=utc()
    record['passed']=bool(record.get('unitComplete') and record['frozenSourcePreserved'] and all(item.get('exitCode')==0 for item in record['checks']))
    write_json(completion,record)
subprocess.run([*cli,'accept','--event',str(OUTPUT/'event.json'),'--reservation',str(OUTPUT/'reservation.json'),'--evidence-digest',sha(completion.read_bytes()),'--outcome','pass' if record['passed'] else 'local_failure','--state',str(STATE),'--output',str(OUTPUT/'accepted.json')],check=True,stdout=subprocess.DEVNULL)
subprocess.run([*cli,'verify','--receipt',str(OUTPUT/'accepted.json')],check=True)
print(json.dumps(record,indent=2),flush=True)
sys.exit(0 if record['passed'] else 1)
