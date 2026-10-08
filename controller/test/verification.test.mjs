import {test} from 'node:test';
import assert from 'node:assert/strict';
import {verificationGate,verificationChecks,VerificationPipeline,workerVerificationContract,exactHeadSonarAudit,officialSonarHead} from '../src/verification.mjs';
const head='b'.repeat(40),main='a'.repeat(40);
const checks=Object.values(verificationChecks).map((name,id)=>({name,id,head_sha:head,app_id:9,status:'completed',conclusion:'success',started_at:'2026-10-08T01:00:00Z'}));
const base={head,main,verifiedMain:main,files:['src/components/Example.tsx'],checks,appIds:[9],implementationPassed:true};
test('complete exact-head proof passes without a deployment',()=>{const r=verificationGate(base);assert.equal(r.passed,true);assert.equal(r.deployment_required,false);});
test('new commit invalidates all previous proof',()=>assert.equal(verificationGate({...base,head:'c'.repeat(40)}).passed,false));
test('new main baseline invalidates previous release proof',()=>assert.equal(verificationGate({...base,main:'c'.repeat(40)}).reason,'MAIN_CHANGED_REVERIFY'));
test('untrusted check publisher cannot certify completion',()=>assert.equal(verificationGate({...base,appIds:[7]}).passed,false));
for(const key of ['targeted','worker','review','release','browser','visual'])test('missing '+key+' proof blocks completion',()=>assert.equal(verificationGate({...base,checks:checks.filter(c=>c.name!==verificationChecks[key])}).passed,false));
test('failed release blocks completion',()=>assert.equal(verificationGate({...base,checks:checks.map(c=>c.name===verificationChecks.release?{...c,conclusion:'failure'}:c)}).passed,false));
test('later pending rerun invalidates earlier success',()=>assert.equal(verificationGate({...base,checks:[...checks,{...checks[3],id:99,status:'in_progress',started_at:'2026-10-08T02:00:00Z'}]}).passed,false));
test('worker completion without independent material proof is rejected',()=>assert.equal(verificationGate({...base,implementationPassed:false}).passed,false));
test('owner gate is preserved',()=>assert.equal(verificationGate({...base,ownerGated:true}).reason,'OWNER_APPROVAL_REQUIRED'));
test('unconnected verifier fails closed',()=>assert.equal(verificationGate({...base,appIds:[]}).reason,'RELEASE_VERIFIER_NOT_CONNECTED'));
test('worker contract keeps full build and release outside ordinary worker tasks',()=>{const c=workerVerificationContract({ui:true}).join(' ');assert.match(c,/pnpm dev:worker/);assert.match(c,/Do not run pnpm build/);assert.match(c,/No commit/);});
test('durable release request is keyed to parent, exact head and current main',async()=>{
 const created=[];let queued=0;const pipeline=new VerificationPipeline({ledger:{create:async x=>{created.push(x);return {...x,id:'release'};},queue:async()=>queued++},github:{main:async()=>({sha:main}),request:async()=>({status:'ahead'})},send:async()=>{}});
 await pipeline.request({id:'implementation',issue_number:7},{pr:{number:8,head},files:base.files});
 assert.equal(created[0].key,'release:implementation:'+head+':'+main);assert.equal(created[0].source.lane,'release_verifier');assert.equal(queued,1);
});

test('Sonar reconciliation rejects old, untrusted and unresolved reports',()=>{
 const check={started_at:'2026-10-08T09:41:10Z',head_sha:head};
 const good={user:{login:'sonarqubecloud[bot]'},updated_at:'2026-10-08T09:41:15Z',body:'Quality Gate passed; 0 New issues'};
 assert.ok(exactHeadSonarAudit([good],check));
 assert.equal(exactHeadSonarAudit([{...good,updated_at:'2026-10-08T09:41:00Z'}],check),null);
 assert.equal(exactHeadSonarAudit([{...good,user:{login:'intruder'}}],check),null);
 assert.equal(exactHeadSonarAudit([{...good,body:'Quality Gate passed; 2 New issues'}],check),null);
 for(const count of [10,20,100])assert.equal(exactHeadSonarAudit([{...good,body:'Quality Gate passed; '+count+' New issues'}],check),null);
 assert.equal(exactHeadSonarAudit([good],{}),null);
});

test('Sonar Cloud PR head corroboration rejects mismatched SHA, vulnerabilities and unavailable API',async()=>{
 const response=({sha=head,qualityGateStatus='OK',bugs=0,vulnerabilities=0,codeSmells=0}={})=>({ok:true,json:async()=>({pullRequests:[{key:'552',commit:{sha},status:{qualityGateStatus,bugs,vulnerabilities,codeSmells}}]})});
 const fetcher=async(url,init)=>{assert.equal(new URL(url).hostname,'sonarcloud.io');assert.equal(init.redirect,'error');return response();};
 assert.equal(await officialSonarHead('owner/repo',552,head,fetcher),true);
 for(const values of [{sha:main},{qualityGateStatus:'ERROR'},{bugs:1},{vulnerabilities:1},{codeSmells:2}]){
  assert.equal(await officialSonarHead('owner/repo',552,head,async()=>response(values)),false);
 }
 assert.equal(await officialSonarHead('owner/repo',552,head,async()=>({ok:true,json:async()=>({pullRequests:[]})})),false);
 assert.equal(await officialSonarHead('owner/repo',552,head,async()=>{throw Error('offline');}),false);
});
