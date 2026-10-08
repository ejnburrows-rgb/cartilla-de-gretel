import {test} from 'node:test';
import assert from 'node:assert/strict';
import {releaseCommand,OpenHandsReleaseExecutor} from '../src/release-executor.mjs';
const scope={repo:'owner/repo',head:'a'.repeat(40),jobId:'00000000-0000-4000-8000-000000000001',files:['src/example.test.ts'],ui:true};
test('fixed clean checkout release plan pins SHA and runs targeted, worker, release and visual tests without deployment',()=>{
 const p=releaseCommand(scope);assert.match(p.command,/sha256sum -c -/);assert.match(p.command,/node-v24.21.0/);assert.match(p.command,/pnpm@10.33.0/);assert.match(p.command,/CARTILLA_RELEASE_PHASE:release/);assert.match(p.command,/git checkout --detach/);assert.match(p.command,/pnpm exec vitest run/);assert.match(p.command,/pnpm verify:worker/);assert.match(p.command,/pnpm verify:release/);assert.match(p.command,/pnpm test:visual/);assert.doesNotMatch(p.command,/vercel|git push|git merge|git clean/);assert.equal(p.hash,releaseCommand(scope).hash);
});
test('release plan rejects arbitrary commands, unsafe paths and missing targeted proof',()=>{
 for(const change of [{repo:'owner/repo; touch /tmp/unsafe'},{head:'HEAD'},{files:[]},{files:['../../example.test.ts']},{files:['test;echo.test.ts']}])assert.throws(()=>releaseCommand({...scope,...change}));
});
test('independent sandbox command is started once and all polls use the same command ID; credentials never escape',async()=>{
 const calls=[],plan=releaseCommand(scope);let finished=false;
 const client=new OpenHandsReleaseExecutor({key:'private-cloud-key',fetcher:async(url,init)=>{
  calls.push({url,method:init.method});let data;
  if(url.includes('/sandboxes?id=')){assert.equal(init.headers['X-Access-Token'],'private-cloud-key');data=[{id:'sandbox',status:'RUNNING',session_api_key:'private-runtime-key',exposed_urls:[{name:'agent-server',url:'https://agent.example.com',port:8000}]}];}
  else if(url.endsWith('/start_bash_command')){assert.equal(init.headers['X-Session-API-Key'],'private-runtime-key');assert.equal(JSON.parse(init.body).command,plan.command);data={id:'same-command'};}
  else data={items:[{id:'output',kind:'BashOutput',command_id:'same-command',exit_code:finished?0:null,stdout:finished?plan.marker+'\n':''}]};
  return {ok:true,json:async()=>data};
 }});
 const started=await client.start('sandbox',plan);assert.equal(started.command_id,'same-command');
 assert.equal((await client.poll('sandbox',started.command_id,plan)).terminal,false);finished=true;
 const result=await client.poll('sandbox',started.command_id,plan);assert.equal(result.passed,true);assert.equal(calls.filter(c=>c.method==='POST').length,1);assert.equal(JSON.stringify(result).includes('private'),false);
});
test('worker success text, missing marker, failed command and other-command output cannot certify release',async()=>{
 const plan=releaseCommand(scope);
 for(const output of [{exit_code:0,stdout:'finished'},{exit_code:1,stdout:plan.marker},{exit_code:0,stdout:plan.marker,command_id:'other'}]){
  const client=new OpenHandsReleaseExecutor({key:'mock'});client.sandbox=async()=>({status:'RUNNING'});client.runtime=async()=>({items:[{kind:'BashOutput',command_id:'same',...output}]});
  if(output.command_id==='other')await assert.rejects(client.poll('sandbox','same',plan),/ID_MISMATCH/);else assert.equal((await client.poll('sandbox','same',plan)).passed,false);
 }
});
