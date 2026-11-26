from pathlib import Path
import datetime,json,os,re,subprocess,sys
label=sys.argv[1] if len(sys.argv)>1 else 'actual-parent-collection'
if not re.fullmatch(r'[a-z0-9-]{1,64}',label): raise ValueError('Invalid probe label')
directory=Path('docs/proofs/m7-m8-m9-verification/continuation/runner-repair')/label
if (directory/'completion.json').exists(): raise FileExistsError('Prior result must be preserved')
command=[r'C:\Program Files\nodejs\node.exe','--require',str(Path('work/audit-vitest-fork.cjs').resolve()),'node_modules/vitest/vitest.mjs','list','work/vitest-startup-only.test.ts','--json','--maxWorkers=1']
record={'startedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'scope':'default-config collection-only no-app fixture, actual fork instrumentation, original startup limits','command':command,'status':'running'}
receipt=directory/'completion.json'
receipt.write_text(json.dumps(record,indent=2))
try:
    with (directory/'stdout.txt').open('x',encoding='utf-8') as out,(directory/'stderr.txt').open('x',encoding='utf-8') as err:
        child=subprocess.Popen(command,stdout=out,stderr=err,env=dict(os.environ,VITEST_STARTUP_AUDIT_FILE=str((directory/'fork-events.ndjson').resolve())))
        record['pid']=child.pid
        receipt.write_text(json.dumps(record,indent=2))
        record['exitCode']=child.wait()
    record['status']='finished'
finally:
    record['finishedUtc']=datetime.datetime.now(datetime.timezone.utc).isoformat()
    receipt.write_text(json.dumps(record,indent=2))
    print(json.dumps(record,indent=2))
raise SystemExit(record.get('exitCode',1))
