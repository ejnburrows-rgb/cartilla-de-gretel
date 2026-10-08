import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GitHub,instructionPaths} from '../src/github.mjs';
import {fixture} from './helpers.mjs';
test('GitHub quota denial persists reset and restarted clients avoid further network reads',async()=>{
 const f=await fixture();let calls=0;const reset=Math.floor(Date.now()/1000)+600;
 const fetcher=async()=>{calls++;return {ok:false,status:403,headers:new Headers({'x-ratelimit-remaining':'0','x-ratelimit-reset':String(reset)}),json:async()=>({message:'API rate limit exceeded'})};};
 const client=new GitHub({repo:'owner/repo',ledger:f.ledger,fetcher,sleeper:async()=>{}});
 await assert.rejects(client.main(),e=>e.message==='GITHUB_RATE_LIMITED'&&!!e.retryAt);
 await assert.rejects(new GitHub({repo:'owner/repo',ledger:f.ledger,fetcher,sleeper:async()=>{}}).main(),/GITHUB_RATE_LIMITED/);
 assert.equal(calls,1);assert.equal((await f.ledger.jobs())[0].owner_action,'Nothing');await f.p.close();
});
test('successive GitHub quota windows reuse a single durable budget gate',async()=>{
 const f=await fixture();let calls=0;
 const client=new GitHub({repo:'owner/repo',ledger:f.ledger,fetcher:async()=>{
  calls++;return {ok:false,status:429,headers:new Headers({'x-ratelimit-remaining':'0','x-ratelimit-reset':String(Math.floor(Date.now()/1000)+calls*600)}),json:async()=>({message:'API rate limit exceeded'})};
 },sleeper:async()=>{}});
 await assert.rejects(client.main(),/GITHUB_RATE_LIMITED/);
 await f.db.query("UPDATE jobs SET retry_at=now()-interval '1 second' WHERE source->>'lane'='github_read_budget'");
 await assert.rejects(client.main(),/GITHUB_RATE_LIMITED/);
 const rows=(await f.db.query("SELECT idempotency_key,status FROM jobs WHERE source->>'lane'='github_read_budget'")).rows;
 assert.equal(rows.length,1);
 assert.equal(rows[0].idempotency_key,'github-read-budget');
 assert.equal(rows[0].status,'retrying');
 assert.equal(calls,2);
 await f.p.close();
});
test('secondary quota observes retry-after without blind HTTP retries',async()=>{
 let calls=0;const client=new GitHub({repo:'owner/repo',fetcher:async()=>{calls++;return {ok:false,status:429,headers:new Headers({'retry-after':'120'}),json:async()=>({})};},sleeper:async()=>{}});
 await assert.rejects(client.main(),e=>e.message==='GITHUB_RATE_LIMITED'&&new Date(e.retryAt)>new Date(Date.now()+110000));assert.equal(calls,1);
});
test('permission denial is not falsely represented as an expiring quota',async()=>{
 let calls=0;const client=new GitHub({repo:'owner/repo',fetcher:async()=>{calls++;return {ok:false,status:403,headers:new Headers(),json:async()=>({message:'Resource not accessible'})};},sleeper:async()=>{}});
 await assert.rejects(client.main(),/GITHUB_HTTP_403/);assert.equal(calls,1);
});
test('exact-main immutable instructions are cached while issues and PRs remain fresh',async()=>{
 const f=await fixture(),sha='a'.repeat(40),texts=Object.fromEntries(instructionPaths.map(p=>[p,'Pinned instruction '+p]));
 await f.db.query('INSERT INTO project_snapshots(id,main_sha,data) VALUES($1,$2,$3)',['00000000-0000-4000-8000-000000000001',sha,JSON.stringify({instruction_texts:texts})]);
 const calls=[];const client=new GitHub({repo:'owner/repo',ledger:f.ledger,fetcher:async url=>{calls.push(url);return {ok:true,json:async()=>url.endsWith('/commits/main')?{sha,commit:{}}:[]};}});
 const snapshot=await client.snapshot();assert.deepEqual(snapshot.instructions,texts);assert.equal(calls.some(u=>u.includes('/contents/')),false);assert.equal(calls.some(u=>u.includes('/issues?')),true);assert.equal(calls.some(u=>u.includes('/pulls?')),true);await f.p.close();
});

test('outbound GitHub reads restrict host, path and redirects',async()=>{
 const seen=[];const client=new GitHub({repo:'owner/repo',fetcher:async(url,options)=>{seen.push({url,options});return {ok:true,json:async()=>({ok:true})};}});
 for(const path of ['//example.com','/issues/../admin','/issues/%2e%2e/admin','/issues\\admin','/unknown/7'])await assert.rejects(client.request(path),/INVALID_GITHUB_ENDPOINT/);
 assert.equal(seen.length,0);
 await client.request('/pulls?state=open&per_page=100');assert.equal(seen.length,1);
 assert.equal(seen[0].url,'https://api.github.com/repos/owner/repo/pulls?state=open&per_page=100');
 assert.equal(seen[0].options.redirect,'error');
});

test('legitimate GitHub three-dot comparison is not rejected as traversal',async()=>{
 const calls=[];const client=new GitHub({repo:'owner/repo',fetcher:async url=>{calls.push(url);return {ok:true,json:async()=>({status:'ahead'})};}});
 const path='/compare/'+('a'.repeat(40))+'...'+('b'.repeat(40));
 await client.request(path);
 assert.equal(calls.length,1);
 assert.equal(calls[0],'https://api.github.com/repos/owner/repo'+path);
});

test('Jules GitHub dispatch adds the jules label and tracks trusted bot task/PR comments',async()=>{
 const seen=[];let phase='running';
 const client=new GitHub({repo:'owner/repo',token:'mock',fetcher:async(url,init={})=>{
  seen.push({url,method:init.method??'GET',body:init.body});
  if(url.includes('/issues/7/comments'))return {ok:true,json:async()=>phase==='running'?
   [{user:{login:'google-labs-jules[bot]'},created_at:'2026-10-08T15:00:01Z',body:'Jules is [on it](https://jules.google.com/task/123456). When finished, you will see another comment and be able to review a PR.'}]:
   [{user:{login:'google-labs-jules[bot]'},created_at:'2026-10-08T15:00:01Z',body:'Jules is [on it](https://jules.google.com/task/123456). When finished, you will see another comment and be able to review a PR.'},{user:{login:'google-labs-jules[bot]'},created_at:'2026-10-08T15:01:00Z',body:'Ready for a review! A [PR](https://github.com/owner/repo/pull/99) has been created.'}]};
  if(url.endsWith('/issues/7'))return {ok:true,json:async()=>({labels:[]})};
  if(url.endsWith('/issues/7/labels')&&init.method==='POST')return {ok:true,json:async()=>[{name:'jules'}]};
  if(url.endsWith('/pulls/99'))return {ok:true,json:async()=>({number:99,state:'open',html_url:'https://github.com/owner/repo/pull/99',head:{sha:'b'.repeat(40),ref:'jules-task',repo:{full_name:'owner/repo'}},body:'References #7'})};
  throw Error('unexpected '+url);
 }});
 const started=await client.startJules(7,'2026-10-08T15:00:00Z');
 assert.equal(started.task_id,'123456');assert.equal(started.terminal,false);
 phase='finished';const done=await client.julesStatus(7,'2026-10-08T15:00:00Z');
 assert.equal(done.task_id,'123456');assert.equal(done.pr_number,99);assert.equal(done.terminal,true);
 assert.ok(seen.some(c=>c.url.endsWith('/issues/7/labels')&&c.method==='POST'));
});

test('Jules API dispatch uses the configured key and AUTO_CREATE_PR instead of the GitHub label path',async()=>{
 const seen=[];
 const client=new GitHub({repo:'owner/repo',token:'github-token',julesKey:'jules-key',fetcher:async(url,init={})=>{
  seen.push({url,method:init.method??'GET',headers:init.headers??{},body:init.body});
  if(url==='https://jules.googleapis.com/v1alpha/sources')return {ok:true,json:async()=>({sources:[{name:'sources/github/owner/repo',githubRepo:{owner:'owner',repo:'repo'}}]})};
  if(url==='https://jules.googleapis.com/v1alpha/sessions'&&init.method==='POST')return {ok:true,json:async()=>({id:'314159',state:'QUEUED'})};
  throw Error('unexpected '+url);
 }});
 const started=await client.startJules(7,'2026-10-08T15:00:00Z','Fix issue #7','main');
 assert.equal(started.task_id,'314159');
 const create=seen.find(c=>c.url.endsWith('/sessions'));
 assert.equal(create.headers['X-Goog-Api-Key'],'jules-key');
 const body=JSON.parse(create.body);
 assert.equal(body.automationMode,'AUTO_CREATE_PR');
 assert.equal(body.sourceContext.source,'sources/github/owner/repo');
 assert.equal(body.sourceContext.githubRepoContext.startingBranch,'main');
 assert.equal(seen.some(c=>c.url.includes('/issues/7/labels')),false);
});

test('Jules API status returns the PR from the same durable session',async()=>{
 const client=new GitHub({repo:'owner/repo',julesKey:'jules-key',fetcher:async(url)=>{
  if(url==='https://jules.googleapis.com/v1alpha/sessions/314159')return {ok:true,json:async()=>({id:'314159',state:'COMPLETED',outputs:[{pullRequest:{url:'https://github.com/owner/repo/pull/99'}}]})};
  throw Error('unexpected '+url);
 }});
 const done=await client.julesStatus(7,'2026-10-08T15:00:00Z','314159');
 assert.equal(done.task_id,'314159');
 assert.equal(done.pr_number,99);
 assert.equal(done.terminal,true);
});

test('Jules API follow-up reuses the same session instead of creating a duplicate task',async()=>{
 const seen=[];
 const client=new GitHub({repo:'owner/repo',julesKey:'jules-key',fetcher:async(url,init={})=>{
  seen.push({url,method:init.method??'GET',body:init.body});
  if(url==='https://jules.googleapis.com/v1alpha/sessions/314159:sendMessage'&&init.method==='POST')return {ok:true,status:200,json:async()=>({})};
  throw Error('unexpected '+url);
 }});
 assert.equal(await client.continueJules('314159','Fix the exact failed review finding; update the existing PR.'),true);
 assert.equal(seen.length,1);
 assert.deepEqual(JSON.parse(seen[0].body),{prompt:'Fix the exact failed review finding; update the existing PR.'});
});
