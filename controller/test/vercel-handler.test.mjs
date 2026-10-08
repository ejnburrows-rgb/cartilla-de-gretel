import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import handler from '../api/handler.mjs';
import {rawBody,signatureOK} from '../src/security.mjs';
import {api} from '../src/api.mjs';
test('public board exposes aggregate counts only; details and writes remain authenticated',async()=>{
 const deps={ledger:{db:{query:async sql=>({rows:sql.includes('GROUP BY')?[{status:'running',count:1},{status:'verified',count:9}]:[{latest:'2026-10-08T01:00:00Z'}]})}}};
 const r=await api({url:'/api/overview',method:'GET',headers:{}},deps,{OPENHANDS_ENABLED:'true'});
 assert.equal(r.status,200);assert.deepEqual(Object.keys(r.body).sort(),['last_activity','statuses','worker_enabled']);
 assert.equal(r.body.statuses.running,1);assert.equal(r.body.statuses.verified,9);
 for(const [url,method]of [['/api/jobs','GET'],['/api/status','GET'],['/api/overview','POST']])assert.equal((await api({url,method,headers:{}},deps,{})).status,401);
});
test('Web Standard request preserves exact signed JSON bytes',async()=>{
 const body='{\n "repository": {"full_name":"owner/repo"}, "zen": "hello"\n}';
 const request=new Request('https://controller.test/api/github/webhook',{method:'POST',body,headers:{'Content-Type':'application/json'}});
 const raw=await rawBody(request);assert.equal(raw.toString(),body);
 assert.equal(signatureOK(raw,'sha256='+createHmac('sha256','test-secret').update(body).digest('hex'),'test-secret'),true);
});
test('Web Standard body reader enforces limit',async()=>{
 await assert.rejects(rawBody(new Request('https://controller.test',{method:'POST',body:'12345'}),4),/BODY_TOO_LARGE/);
});
test('Vercel Web Standard handler retains read-only auth and Inngest configuration gate',async()=>{
 const response=await handler.fetch(new Request('https://controller.test/api/jobs'));assert.equal(response.status,401);
 const old=process.env.INNGEST_SIGNING_KEY;delete process.env.INNGEST_SIGNING_KEY;
 try{const r=await handler.fetch(new Request('https://controller.test/api/inngest'));assert.equal(r.status,503);assert.equal((await r.json()).error,'INNGEST_NOT_CONFIGURED');}finally{if(old!==undefined)process.env.INNGEST_SIGNING_KEY=old;}
});

import {configureWorkerKey,configureGitHubKey} from '../src/runtime.mjs';
import {OpenHands} from '../src/openhands.mjs';
import {safeText} from '../src/security.mjs';
test('saved sensitive credential alias preserves canonical key and stays redacted',()=>{
 const env={Myne:'private-existing-credential'};assert.equal(configureWorkerKey(env),true);
 assert.equal(env.OPENHANDS_API_KEY,env.Myne);assert.equal(safeText(env.Myne,env),'[REDACTED]');
 const canonical={OPENHANDS_API_KEY:'canonical',Myne:'alias'};configureWorkerKey(canonical);assert.equal(canonical.OPENHANDS_API_KEY,'canonical');
});
test('OpenHands authentication preflight is GET only and never exposes response secrets',async()=>{
 const calls=[];const worker=new OpenHands({key:'private',fetcher:async(url,options)=>{calls.push({url,method:options.method});return {ok:true,status:200,json:()=>{throw new Error('must not read secret response');}};}});
 assert.deepEqual(await worker.authStatus(),{configured:true,authenticated:true,http_status:200});
 assert.deepEqual(calls,[{url:'https://app.all-hands.dev/api/keys/current',method:'GET'}]);
});
test('saved GitHub credential alias remains server-side, redacted and preserves canonical token',()=>{
 const env={Ejn:'private-github-credential'};assert.equal(configureGitHubKey(env),true);
 assert.equal(env.GITHUB_TOKEN,env.Ejn);assert.equal(safeText(env.Ejn,env),'[REDACTED]');
 const canonical={GITHUB_TOKEN:'canonical-token',Ejn:'alias'};configureGitHubKey(canonical);
 assert.equal(canonical.GITHUB_TOKEN,'canonical-token');assert.equal(configureGitHubKey({}),false);
});


test('read-only history explains repository, owner attention, transitions, evidence and validations',async()=>{
 const {fixture}=await import('./helpers.mjs');const f=await fixture();
 const j=await f.ledger.create({key:'history-view',kind:'issue_implementation',issue:77,source:{issue:77,url:'https://github.com/owner/repo/issues/77'},spec:{action:'Fix the existing lesson defect'}});
 await f.ledger.set(j.id,'blocked','INDEPENDENT_RELEASE_VERIFICATION_REQUIRED',{next_action:'Run exact-head independent verification',owner_action:'Review failure'});
 await f.ledger.receipt(j.id,'github_validation',{passed:false,head:'a'.repeat(40)});
 await f.ledger.validate(j.id,'controller_independent_review',false,{summary:'Current exact-head review has not passed.'});
 const env={CONTROLLER_READ_TOKEN:'r'.repeat(40),CONTROLLER_ADMIN_TOKEN:'a'.repeat(40),GITHUB_REPO:'owner/repo'};
 const deps={ledger:f.ledger};
 const list=await api({url:'/api/jobs',method:'GET',headers:{authorization:'Bearer '+env.CONTROLLER_READ_TOKEN}},deps,env);
 assert.equal(list.status,200);assert.equal(list.body.jobs[0].repository,'owner/repo');assert.equal(list.body.jobs[0].needs_owner_attention,true);
 const history=await api({url:'/api/jobs/'+j.id+'/history',method:'GET',headers:{authorization:'Bearer '+env.CONTROLLER_READ_TOKEN}},deps,env);
 assert.equal(history.status,200);assert.equal(history.body.job.repository,'owner/repo');assert.equal(history.body.job.needs_owner_attention,true);
 assert.ok(history.body.transitions.length>=2);assert.equal(history.body.evidence[0].kind,'github_validation');assert.equal(history.body.validations[0].name,'controller_independent_review');
 await f.p.close();
});
