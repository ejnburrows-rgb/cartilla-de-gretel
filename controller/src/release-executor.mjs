import {createHash} from 'node:crypto';

// Official Cloud Sandbox + RemoteWorkspace APIs. No LLM or deployment is used.
// https://github.com/OpenHands/software-agent-sdk/blob/main/openhands-sdk/openhands/sdk/workspace/remote/remote_workspace_mixin.py
const quote=s=>"'"+s.replaceAll("'","'\\''")+"'";
export function releaseCommand({repo,head,jobId,files=[],ui=false}){
 if(!/^[\w.-]+\/[\w.-]+$/.test(repo??'')||!/^[a-f0-9]{40}$/.test(head??'')||!/^[-a-f0-9]{36}$/.test(jobId??''))throw Error('INVALID_RELEASE_SCOPE');
 const tests=files.filter(p=>/\.(test|spec)\.[cm]?[jt]sx?$/.test(p)&&!p.startsWith('tests/e2e/'));
 if(!tests.length)throw Error('TARGETED_TEST_PLAN_REQUIRED');
 if(tests.some(p=>!/^[-\w./]+$/.test(p)||p.startsWith('/')||p.split('/').includes('..')))throw Error('INVALID_TEST_PATH');
 const marker='CARTILLA_RELEASE_PASS:'+jobId+':'+head;
 const nodeTests=tests.filter(p=>p.startsWith('controller/test/'));const vitestTests=tests.filter(p=>!p.startsWith('controller/test/'));
 const command=[
  'set -eu', 'umask 077', 'root=$(mktemp -d /tmp/cartilla-release.XXXXXX)',
  'git clone --no-checkout '+quote('https://github.com/'+repo+'.git')+' "$root/repo"',
  'cd "$root/repo"', 'git fetch origin '+quote(head), 'git checkout --detach '+quote(head),
  '[ "$(git rev-parse HEAD)" = '+quote(head)+' ]', 'pnpm install --frozen-lockfile',
  ...(vitestTests.length?['pnpm exec vitest run '+vitestTests.map(quote).join(' ')]:[]),
  ...(nodeTests.length?['(cd controller && npm ci --ignore-scripts && node --test '+nodeTests.map(p=>quote(p.slice('controller/'.length))).join(' ')+' && npm run build)']:[]),
  'pnpm verify:worker',
  'pnpm verify:release', ...(ui?['pnpm test:visual']:[]),
  '[ "$(git rev-parse HEAD)" = '+quote(head)+' ]',
  // Build/art outputs are isolated and never exported as implementation changes.
  'printf "%s\\n" '+quote(marker),
 ].join('\n');
 return {command,hash:createHash('sha256').update(command).digest('hex'),marker,head,ui};
}
export class OpenHandsReleaseExecutor{
 constructor({key,fetcher=fetch}){this.key=key;this.fetcher=fetcher;}
 async cloud(path,method='GET'){
  if(!this.key)throw Error('OPENHANDS_API_KEY_REQUIRED');
  const r=await this.fetcher('https://app.all-hands.dev/api/v1'+path,{method,headers:{'X-Access-Token':this.key},signal:AbortSignal.timeout(20000)});
  if(!r.ok)throw Error('VERIFIER_CLOUD_HTTP_'+r.status);return r.json();
 }
 async create(){const s=await this.cloud('/sandboxes','POST');if(typeof s.id!=='string')throw Error('VERIFIER_SANDBOX_RESPONSE_INVALID');return {sandbox_id:s.id,status:s.status};}
 async sandbox(id){
  const rows=await this.cloud('/sandboxes?id='+encodeURIComponent(id));const s=rows?.[0];
  if(!s||s.id!==id)throw Error('VERIFIER_SANDBOX_MISSING');
  if(s.status!=='RUNNING')return {status:s.status};
  const urls=(s.exposed_urls??[]).filter(u=>/agent/i.test(u.name));
  if(urls.length!==1||!s.session_api_key)throw Error('VERIFIER_RUNTIME_UNAVAILABLE');
  const u=new URL(urls[0].url);
  if(u.protocol!=='https:'||u.username||u.password||u.hostname==='localhost'||/^\d/.test(u.hostname))throw Error('VERIFIER_RUNTIME_URL_REJECTED');
  return {status:s.status,url:u.origin,key:s.session_api_key};
 }
 async runtime(s,path,body){
  const r=await this.fetcher(s.url+'/api'+path,{method:body?'POST':'GET',headers:{'X-Session-API-Key':s.key,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});
  if(!r.ok)throw Error('VERIFIER_RUNTIME_HTTP_'+r.status);return r.json();
 }
 async start(sandboxId,plan){
  const s=await this.sandbox(sandboxId);if(s.status!=='RUNNING')return {ready:false,status:s.status};
  const r=await this.runtime(s,'/bash/start_bash_command',{command:plan.command,timeout:3600});
  if(typeof r.id!=='string'||!r.id)throw Error('VERIFIER_COMMAND_OUTCOME_UNKNOWN');
  return {ready:true,command_id:r.id,payload_hash:plan.hash};
 }
 async poll(sandboxId,commandId,plan){
  const s=await this.sandbox(sandboxId);if(s.status!=='RUNNING')return {terminal:false,status:s.status};
  const query=new URLSearchParams({kind__eq:'BashOutput',command_id__eq:commandId,sort_order:'TIMESTAMP_DESC',limit:'100'});
  const page=await this.runtime(s,'/bash/bash_events/search?'+query);
  const items=page.items??[];
  if(items.some(e=>e.kind!=='BashOutput'||e.command_id!==commandId))throw Error('VERIFIER_OUTPUT_ID_MISMATCH');
  const e=items.find(e=>e.exit_code!=null);if(!e)return {terminal:false};
  const passed=e.exit_code===0&&items.some(e=>String(e.stdout??'').split('\n').includes(plan.marker));
  // Neither runtime credentials nor arbitrary command stdout enter the ledger.
  return {terminal:true,passed,exit_code:e.exit_code,command_id:commandId,payload_hash:plan.hash,head:plan.head,ui:plan.ui,event_id:e.id??null,reason:passed?null:'RELEASE_COMMAND_OR_PROOF_FAILED'};
 }
 async pause(id){
  if((await this.sandbox(id)).status==='PAUSED')return {success:true,status:'PAUSED'};
  const r=await this.cloud('/sandboxes/'+encodeURIComponent(id)+'/pause','POST');
  if(r.success!==true)throw Error('VERIFIER_PAUSE_UNCONFIRMED');
  if((await this.sandbox(id)).status!=='PAUSED')throw Error('VERIFIER_PAUSE_PENDING');
  return {success:true,status:'PAUSED'};
 }
}
