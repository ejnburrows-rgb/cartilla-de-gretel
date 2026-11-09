from pathlib import Path
import hashlib, importlib.util, json, os, shutil, subprocess,sys,datetime
base=Path(r'C:/Users/EJN/Documents/Codex/2026-11-03/new-chat-2/work')
repo=Path(r'D:/Downloads/cartilla-1247-continuation-work/integration')
proof=repo/'docs/proofs/m7-m8-m9-verification/continuation/runner-repair'
label='crm-phone-images-ready'
out=proof/label
out.mkdir(exist_ok=False)
backup=base/'crm-before-images-ready'
backup.mkdir(exist_ok=False)
manifest=[]
for p in sorted((repo/'docs/proofs/crm-demo').rglob('*')):
 if p.is_file():
  rel=p.relative_to(repo);dest=backup/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
  digest=hashlib.sha256(p.read_bytes()).hexdigest()
  assert hashlib.sha256(dest.read_bytes()).hexdigest()==digest
  manifest.append({'path':rel.as_posix(),'sha256':digest,'bytes':p.stat().st_size})
(out/'preserved-output-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',newline='\n')
plugin=Path(r'C:/Users/EJN/.codex/plugins/cache/openai-curated-remote/agent-churn-control/0.1.4')
spec=importlib.util.spec_from_file_location('core',plugin/'scripts/churn_control.py');core=importlib.util.module_from_spec(spec);spec.loader.exec_module(core)
old=proof/'crm-phone-production-fixed'
event=json.loads((old/'event.json').read_text());prior=json.loads((old/'accepted.json').read_text())
def digest(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
artifactManifest=repo/'docs/proofs/m7-m8-m9-verification/continuation/production-runtime-gate-bfab98b6/production-artifact-manifest.json'
artifact=json.loads(artifactManifest.read_text())
def verifyArtifact():
 for item in artifact['files']:
  assert digest((repo/'dist'/item['path']).read_bytes())==item['sha256']
verifyArtifact()
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()
event.update(event_id=label+'-'+head,attempt_id=label,candidate_digest=digest(head.encode()),evaluator_digest=digest((repo/'vite.config.ts').read_bytes()+(repo/'tests/e2e/crm-local-demo.spec.ts').read_bytes()+(repo/'playwright.config.ts').read_bytes()+(repo/'work/playwright.crm-production.config.ts').read_bytes()+(repo/'docs/proofs/m7-m8-m9-verification/continuation/production-runtime-gate-bfab98b6/production-artifact-manifest.json').read_bytes()))
event['environment_digest']=digest(b'Full Chromium original phone journey, immutable production-runtime artifact bfab98b6, preview5180, one worker, original timeouts')
fields=['candidate_digest','evaluator_digest','environment_digest']
changes=[{'field':field,'before':prior[field],'after':event[field]} for field in fields if prior[field]!=event[field]]
invalidation={'schema_version':'1.0','invalidates':[prior['receipt_id']],'action_scope_digest':prior['action_key_scope_digest'],'reason_code':'evaluator_changed','changes':changes,'evidence':[{'kind':x['field'],'digest':x['after']} for x in changes]}
invalidation['invalidation_id']=core.invalidation_fingerprint(invalidation);event['invalidation']=invalidation
(out/'event.json').write_text(json.dumps(event,indent=2)+'\n',newline='\n')
cli=[sys.executable,str(plugin/'scripts/churn_control.py')]
state=Path(r'D:/Downloads/cartilla-1247-continuation-work/test-repairs/work/runner-repair-receipts.ndjson')
subprocess.run([*cli,'decide','--event',str(out/'event.json'),'--state',str(state),'--output',str(out/'reservation.json')],check=True)
reservation=json.loads((out/'reservation.json').read_text())
if reservation.get('decision') not in ['allow','allow_reexecution'] or reservation.get('outcome')!='pending' or reservation.get('evidence_accepted') is not False or reservation.get('work_key')!=core.work_key(event):raise RuntimeError('No exact pending reservation')
run=proof/'runs'/label
command=[sys.executable,str(proof/'run-bounded.py'),label,'--config=work/playwright.crm-production.config.ts','tests/e2e/crm-local-demo.spec.ts','--project=chromium','--grep=at phone size']
env=dict(os.environ,PLAYWRIGHT_OPEN_ACCESS_ONLY='1',PLAYWRIGHT_CRM_DIAGNOSTICS='1')
with (out/'wrapper-stdout.txt').open('xb') as stdout,(out/'wrapper-stderr.txt').open('xb') as stderr:
 code=subprocess.run(command,cwd=repo,env=env,stdout=stdout,stderr=stderr).returncode
verifyArtifact()
result=run/'completion.json'
completion=json.loads(result.read_text())
assert completion['head']==head
passed=code==0 and completion['exitCode']==0 and completion['stats']['unexpected']==0 and completion['stats']['expected']==1
summary={'head':head,'passed':passed,'wrapperExitCode':code,'runCompletion':str(result.relative_to(repo)),'runCompletionSha256':hashlib.sha256(result.read_bytes()).hexdigest(),'originalTimeoutsPreserved':True,'stats':completion['stats'],'artifactManifestSha256':hashlib.sha256(artifactManifest.read_bytes()).hexdigest(),'artifactFilesUnchanged':len(artifact['files'])}
summarypath=out/'summary.json';summarypath.write_text(json.dumps(summary,indent=2)+'\n',newline='\n')
subprocess.run([*cli,'accept','--event',str(out/'event.json'),'--reservation',str(out/'reservation.json'),'--evidence-digest',digest(summarypath.read_bytes()),'--outcome','pass' if passed else 'local_failure','--state',str(state),'--output',str(out/'accepted.json')],check=True)
subprocess.run([*cli,'verify','--receipt',str(out/'accepted.json')],check=True)
print(json.dumps(summary,indent=2));sys.exit(0 if passed else 1)
