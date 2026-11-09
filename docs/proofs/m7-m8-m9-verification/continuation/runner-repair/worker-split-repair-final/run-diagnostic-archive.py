import hashlib,importlib.util,json,subprocess,sys,datetime
from pathlib import Path
base=Path(__file__).resolve().parent
repo=Path('D:/Downloads/cartilla-1247-continuation-work/test-repairs')
previous=base/'worker-split-check'/'completion.json'
old=json.loads(previous.read_text())
statebase=Path('C:/Users/EJN/Documents/Codex/2026-11-03/continue-la-cartilla-de-gretel-from/work')
identity=hashlib.sha256((old['scope']+old['head']).encode()).hexdigest()[:20]
priorfolder=base/'worker-split-transform-only'
prior=json.loads((priorfolder/'accepted.json').read_text())
event=json.loads((priorfolder/'event.json').read_text())
plugin=Path('C:/Users/EJN/.codex/plugins/cache/openai-curated-remote/agent-churn-control/0.1.4')
spec=importlib.util.spec_from_file_location('core',plugin/'scripts/churn_control.py');core=importlib.util.module_from_spec(spec);spec.loader.exec_module(core)
script=repo/'work/verify-worker-split.mjs'
event.update(event_id='worker-split-transform-terminal-'+old['head'],attempt_id='worker-split-transform-terminal',evaluator_digest='sha256:'+hashlib.sha256(script.read_bytes()+(repo/'vite.config.ts').read_bytes()+previous.read_bytes()).hexdigest())
record={'schema_version':'1.0','invalidates':[prior['receipt_id']],'action_scope_digest':prior['action_key_scope_digest'],'reason_code':'evaluator_changed','changes':[{'field':'evaluator_digest','before':prior['evaluator_digest'],'after':event['evaluator_digest']}],'evidence':[{'kind':'evaluator_digest','digest':event['evaluator_digest']}]}
record['invalidation_id']=core.invalidation_fingerprint(record);event['invalidation']=record
out=base/'worker-split-transform-terminal';out.mkdir(exist_ok=False)
(out/'event.json').write_text(json.dumps(event,indent=2)+'\n',newline='\n')
cli=[sys.executable,str(plugin/'scripts/churn_control.py')]
decision=subprocess.run([*cli,'decide','--event',str(out/'event.json'),'--state',str(statebase/'churn-receipts.ndjson'),'--output',str(out/'reservation.json')],capture_output=True,text=True)
(out/'reservation-command.txt').write_text(decision.stdout+decision.stderr,newline='\n');decision.check_returncode()
reservation=json.loads((out/'reservation.json').read_text())
if reservation.get('decision') not in ('allow','allow_reexecution') or reservation.get('outcome')!='pending' or reservation.get('evidence_accepted') is not False or reservation.get('work_key')!=core.work_key(event):raise RuntimeError('No exact pending reservation')
guardfile=repo/'docs/proofs/m7-m8-m9-verification/continuation/runner-repair/run-bounded.py'
spec=importlib.util.spec_from_file_location('guard',guardfile);guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard)
completion={'head':old['head'],'startedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reusedTypecheck':{'exitCode':next(row['exitCode'] for row in old['checks'] if row['name']=='typecheck'),'source':str(previous),'sourceSha256':hashlib.sha256(previous.read_bytes()).hexdigest()},'status':'running'}
with (out/'stdout.txt').open('xb') as stdout,(out/'stderr.txt').open('xb') as stderr:
 process=guard.launch_reserved(out/'reservation.json',['node',str(script)],cwd=repo,stdout=stdout,stderr=stderr);completion['pid']=process.pid
 (out/'completion.json').write_text(json.dumps(completion,indent=2)+'\n',newline='\n');completion['exitCode']=process.wait()
completion.update(status='finished',finishedUtc=datetime.datetime.now(datetime.timezone.utc).isoformat())
result=repo/'docs/proofs/m7-m8-m9-verification/continuation/runner-repair/worker-split-repair-final/result.json'
completion['passed']=completion['exitCode']==0 and json.loads(result.read_text()).get('passed') is True and completion['reusedTypecheck']['exitCode']==0
output=out/'completion.json';output.write_text(json.dumps(completion,indent=2)+'\n',newline='\n')
subprocess.run([*cli,'accept','--event',str(out/'event.json'),'--reservation',str(out/'reservation.json'),'--evidence-digest','sha256:'+hashlib.sha256(output.read_bytes()).hexdigest(),'--outcome','pass' if completion['passed'] else 'local_failure','--state',str(statebase/'churn-receipts.ndjson'),'--output',str(out/'accepted.json')],check=True,stdout=subprocess.DEVNULL)
subprocess.run([*cli,'verify','--receipt',str(out/'accepted.json')],check=True)
print(json.dumps(completion,indent=2))
sys.exit(0 if completion['passed'] else 1)
