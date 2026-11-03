from pathlib import Path
import hashlib,importlib.util,json,os,subprocess,sys,datetime,zipfile,shutil
base=Path(r'C:/Users/EJN/Documents/Codex/2026-11-03/new-chat-2/work')
repo=Path(r'D:/Downloads/cartilla-1247-continuation-work/integration')
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()
out=base/'production-runtime-gate';out.mkdir(exist_ok=False)
def digest(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
oldmanifest=repo/'docs/proofs/m7-m8-m9-verification/continuation/unit-runner-repair/complete-gate-324b1383/post-build-dist-manifest.json'
old=json.loads(oldmanifest.read_text())
with zipfile.ZipFile(out/'prior-test-runtime-artifact.zip','x',compression=zipfile.ZIP_DEFLATED) as archive:
 for item in old['files']:
  p=repo/'dist'/item['path'];assert digest(p.read_bytes())==item['sha256'];archive.write(p,item['path'])
 archive.write(oldmanifest,'original-manifest.json')
shutil.copy2(oldmanifest,out/'prior-test-runtime-manifest.json')
plugin=Path(r'C:/Users/EJN/.codex/plugins/cache/openai-curated-remote/agent-churn-control/0.1.4')
statebase=Path(r'C:/Users/EJN/Documents/Codex/2026-11-03/continue-la-cartilla-de-gretel-from/work')
helper=statebase/'churn_action.py'
scope='production-runtime fresh performance build and original budgets plus inherited-test-env JSX regression; evaluator '+hashlib.sha256((repo/'scripts/verify-performance-budget.mjs').read_bytes()+(repo/'tests/performance-budget.test.mjs').read_bytes()).hexdigest()
subprocess.run([sys.executable,str(helper),'decide','--scope',scope,'--cwd',str(repo),'--head',head],check=True,stdout=subprocess.DEVNULL)
packet=statebase/'churn'/hashlib.sha256((scope+head).encode()).hexdigest()[:20]
spec=importlib.util.spec_from_file_location('core',plugin/'scripts/churn_control.py');core=importlib.util.module_from_spec(spec);spec.loader.exec_module(core)
event=json.loads((packet/'event.json').read_text());res=json.loads((packet/'reservation.json').read_text())
assert res.get('decision') in ('allow','allow_reexecution') and res.get('outcome')=='pending' and res.get('evidence_accepted') is False and res.get('work_key')==core.work_key(event) and not (packet/'accepted.json').exists()
spec=importlib.util.spec_from_file_location('guard',repo/'docs/proofs/m7-m8-m9-verification/continuation/runner-repair/run-bounded.py');guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard)
command=['node','--require',str(repo/'docs/proofs/m7-m8-m9-verification/continuation/runner-repair/unit-bootstrap-probes/audit-vitest-fork.cjs'),'node_modules/vitest/vitest.mjs','run','tests/performance-budget.test.mjs','--pool','forks','--maxWorkers','1','--reporter=default','--reporter=json','--outputFile',str(out/'results.json')]
record={'head':head,'startedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':command,'status':'running','scope':scope,'sourceDiffBefore':subprocess.check_output(['git','diff','HEAD','--','src','scripts','tests','vite.config.ts'],cwd=repo,text=True)}
output=out/'completion.json'
def save():output.write_text(json.dumps(record,indent=2)+'\n',newline='\n')
save()
env=dict(os.environ,WRITE_PERF_REPORTS='false',VITEST_STARTUP_AUDIT_FILE=str(out/'fork-events.ndjson'));env.pop('VITEST_STARTUP_AUDIT_OWNER',None)
with (out/'stdout.txt').open('xb') as stdout,(out/'stderr.txt').open('xb') as stderr:
 process=guard.launch_reserved(packet/'reservation.json',command,cwd=repo,env=env,stdout=stdout,stderr=stderr);record['pid']=process.pid;save();record['exitCode']=process.wait()
record.update(status='finished',finishedUtc=datetime.datetime.now(datetime.timezone.utc).isoformat(),headAfter=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip(),sourceDiffAfter=subprocess.check_output(['git','diff','HEAD','--','src','scripts','tests','vite.config.ts'],cwd=repo,text=True))
r=out/'results.json';record['resultsSha256']=digest(r.read_bytes()) if r.exists() else None
if r.exists():
 results=json.loads(r.read_text());record['tests']={key:results.get(key) for key in ['numTotalTests','numPassedTests','numFailedTests','numPendingTests','success']}
record['passed']=record['exitCode']==0 and record['headAfter']==head and record['sourceDiffBefore']==record['sourceDiffAfter'] and record.get('tests',{}).get('numPassedTests')==8
save()
subprocess.run([sys.executable,str(helper),'accept','--scope',scope,'--cwd',str(repo),'--head',head,'--evidence',str(output),'--outcome','pass' if record['passed'] else 'local_failure'],check=True,stdout=subprocess.DEVNULL)
for name in ['event.json','reservation.json','accepted.json']:shutil.copy2(packet/name,out/name)
print(json.dumps(record,indent=2));sys.exit(0 if record['passed'] else 1)
