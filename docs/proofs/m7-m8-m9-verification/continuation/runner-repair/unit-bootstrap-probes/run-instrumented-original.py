from pathlib import Path
import datetime,hashlib,importlib.util,json,os,platform,subprocess,sys
root=Path(r'D:\Downloads\cartilla-1247-continuation-work\integration')
own=Path(__file__).resolve().parents[1]
base=own/'docs/proofs/m7-m8-m9-verification/continuation/runner-repair/instrumented-original-p24'
base.mkdir(exist_ok=False)
plugin=Path(r'C:\Users\EJN\.codex\plugins\cache\openai-curated-remote\agent-churn-control\0.1.4')
state=Path(r'C:\Users\EJN\Documents\Codex\2026-11-03\continue-la-cartilla-de-gretel-from\work\churn-receipts.ndjson')
old=root/'docs/proofs/m7-m8-m9-verification/continuation/unit-runner-repair/node24-isolated'
node=r'C:\Program Files\nodejs\node.exe'
preload=own/'work/audit-vitest-fork.cjs'
command=[node,'--require',str(preload),'node_modules/vitest/vitest.mjs','run','src/lib/__tests__/page-completion-gate.test.tsx','--pool','forks','--maxWorkers','1','--reporter=default','--reporter=json','--outputFile',str(base/'results.json')]
sha=lambda value:'sha256:'+hashlib.sha256(value).hexdigest()
event=json.loads((old/'event.json').read_text())
event.pop('invalidation',None)
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
event.update(event_id='instrumented-original-p24',attempt_id='instrumented-original-p24',candidate_digest=sha(head.encode()),evaluator_digest=sha((root/'src/lib/__tests__/page-completion-gate.test.tsx').read_bytes()+preload.read_bytes()+json.dumps(command).encode()),environment_digest=sha((platform.platform()+sys.version+node+subprocess.check_output([node,'--version'],text=True).strip()).encode()))
prior=json.loads((old/'accepted.json').read_text())
changes=[{'field':field,'before':prior[field],'after':event[field]} for field in ['candidate_digest','evaluator_digest','environment_digest'] if prior[field]!=event[field]]
invalidation={'schema_version':'1.0','invalidates':[prior['receipt_id']],'action_scope_digest':prior['action_key_scope_digest'],'reason_code':'evaluator_changed','changes':changes,'evidence':[{'kind':row['field'],'digest':row['after']} for row in changes]}
spec=importlib.util.spec_from_file_location('core',plugin/'scripts/churn_control.py');core=importlib.util.module_from_spec(spec);spec.loader.exec_module(core)
invalidation['invalidation_id']=core.invalidation_fingerprint(invalidation)
event['invalidation']=invalidation
(base/'event.json').write_text(json.dumps(event,indent=2))
cli=[sys.executable,str(plugin/'scripts/churn_control.py')]
result=subprocess.run([*cli,'decide','--event',str(base/'event.json'),'--state',str(state),'--output',str(base/'reservation.json')],capture_output=True,text=True)
(base/'reservation-command.txt').write_text(result.stdout+result.stderr)
result.check_returncode()
reservation=json.loads((base/'reservation.json').read_text())
assert reservation.get('decision') in ('allow','allow_reexecution'),reservation.get('decision')
record={'head':head,'command':command,'startedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'running','scope':'instrumented original p24; no limits/assertions/pool changes'}
def save(): (base/'completion.json').write_text(json.dumps(record,indent=2))
save()
try:
    with (base/'stdout.txt').open('x',encoding='utf-8') as out,(base/'stderr.txt').open('x',encoding='utf-8') as err:
        child=subprocess.Popen(command,cwd=root,stdout=out,stderr=err,env=dict(os.environ,VITEST_STARTUP_AUDIT_FILE=str(base/'fork-events.ndjson')))
        record['pid']=child.pid;save();record['exitCode']=child.wait()
    record['status']='finished'
    if (base/'results.json').exists():
        data=json.loads((base/'results.json').read_text());record['tests']={key:data.get(key) for key in ['numTotalTests','numPassedTests','numFailedTests','numPendingTests','success']}
finally:
    record['finishedUtc']=datetime.datetime.now(datetime.timezone.utc).isoformat();save()
subprocess.run([*cli,'accept','--event',str(base/'event.json'),'--reservation',str(base/'reservation.json'),'--evidence-digest',sha((base/'completion.json').read_bytes()),'--outcome','pass' if record.get('exitCode')==0 else 'local_failure','--state',str(state),'--output',str(base/'accepted.json')],check=True,stdout=subprocess.DEVNULL)
subprocess.run([*cli,'verify','--receipt',str(base/'accepted.json')],check=True)
print(json.dumps(record,indent=2))
sys.exit(record.get('exitCode',1))
