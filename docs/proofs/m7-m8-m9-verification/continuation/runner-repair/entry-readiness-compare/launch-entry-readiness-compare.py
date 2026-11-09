from pathlib import Path
import datetime,hashlib,importlib.util,json,os,subprocess,sys
root=Path(__file__).resolve().parents[1]
base=root/'docs/proofs/m7-m8-m9-verification/continuation/runner-repair'
directory=base/'entry-readiness-compare';directory.mkdir(exist_ok=False)
plugin=Path(r'C:\Users\EJN\.codex\plugins\cache\openai-curated-remote\agent-churn-control\0.1.4')
manifest=Path(r'D:\Downloads\cartilla-1247-continuation-work\integration\docs\proofs\m7-m8-m9-verification\continuation\unit-runner-repair\complete-gate-324b1383\post-build-dist-manifest.json')
sha=lambda content:'sha256:'+hashlib.sha256(content).hexdigest()
assert sha(manifest.read_bytes())=='sha256:a5491bc6557dd693e2ffa5d5abc157c4afada7690f10f061e91c5b40cfc9df83'
event=json.loads((plugin/'assets/sample-event.json').read_text())
event.update(event_id='entry-readiness-compare',task_id='1247-test-repairs',attempt_id='entry-readiness-compare',action_scope_digest=sha(b'approved sequential phone entry-only built324 and dev visibility comparison; same5s assertion; no backend; no full journey'),requirements_digest=sha((root/'AGENTS.md').read_bytes()),candidate_digest=sha(manifest.read_bytes()),dependency_digest=sha((root/'pnpm-lock.yaml').read_bytes()),evaluator_digest=sha((root/'work/entry-readiness-compare.cjs').read_bytes()+(base/'run-bounded.py').read_bytes()),environment_digest=sha(b'Windows Node26.2.0 Playwright1.63 full Chromium fresh profiles390x844; servers sequential; existing productiondist no rebuild'))
event.pop('environment_independent',None)
(directory/'event.json').write_text(json.dumps(event,indent=2))
cli=[sys.executable,str(plugin/'scripts/churn_control.py')]
result=subprocess.run([*cli,'decide','--event',str(directory/'event.json'),'--state','work/runner-repair-receipts.ndjson','--output',str(directory/'reservation.json')],capture_output=True,text=True)
(directory/'reservation-command.txt').write_text(result.stdout+result.stderr);result.check_returncode()
spec=importlib.util.spec_from_file_location('bounded',base/'run-bounded.py');bounded=importlib.util.module_from_spec(spec);spec.loader.exec_module(bounded)
bounded.require_pending_reservation(directory/'reservation.json')
command=[r'C:\Program Files\nodejs\node.exe',str(root/'work/entry-readiness-compare.cjs')]
record={'startedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'scope':'entry-only diagnostic packet, no full CRM phone journey','command':command,'status':'running'}
def save(): (directory/'completion.json').write_text(json.dumps(record,indent=2))
save()
try:
    with (directory/'stdout.txt').open('x',encoding='utf-8') as out,(directory/'stderr.txt').open('x',encoding='utf-8') as err:
        process=bounded.launch_reserved(directory/'reservation.json',command,cwd=root,stdout=out,stderr=err)
        record['pid']=process.pid;save();record['exitCode']=process.wait()
    record['status']='finished'
finally:
    record['finishedUtc']=datetime.datetime.now(datetime.timezone.utc).isoformat();save()
subprocess.run([*cli,'accept','--event',str(directory/'event.json'),'--reservation',str(directory/'reservation.json'),'--evidence-digest',sha((directory/'completion.json').read_bytes()),'--outcome','pass' if record.get('exitCode')==0 else 'local_failure','--state','work/runner-repair-receipts.ndjson','--output',str(directory/'accepted.json')],check=True,stdout=subprocess.DEVNULL)
subprocess.run([*cli,'verify','--receipt',str(directory/'accepted.json')],check=True)
print(json.dumps(record,indent=2))
sys.exit(record.get('exitCode',1))
