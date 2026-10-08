import {authorized,rawBody,digest} from './security.mjs';
import {webhook} from './webhook.mjs';
import {parseSpec} from './policy.mjs';
export const statuses=['running','waiting','retrying','blocked','failed','dead_letter','verified'];
const viewJob=j=>({id:j.id,kind:j.kind,issue:j.issue_number,status:j.status,requested_action:j.kind==='issue_implementation'?j.spec.action??'Resolve scope':j.kind,worker:j.worker,external_id:j.external_id,starting_sha:j.starting_sha,attempt_number:j.attempt_count,deadline:j.deadline,last_activity:j.updated_at,next_retry:j.retry_at,failure_reason:j.failure_reason,next_action:j.next_action,what_emilio_needs_to_do:j.owner_action});
export function openapi(){
 const paths={};
 for(const p of ['/api/status','/api/jobs','/api/jobs/{id}','/api/jobs/{id}/evidence','/api/jobs/{id}/validations','/api/workers','/api/openapi.json'])paths[p]={get:{security:[{readToken:[]}],responses:{200:{description:'Read-only controller state'},401:{description:'Unauthorized'},503:{description:'Dependency not configured'}}}};
 for(const p of ['/api/jobs','/api/jobs/{id}/retry','/api/jobs/{id}/cancel'])paths[p]={...paths[p],post:{security:[{adminToken:[]}],responses:{202:{description:'Durably stored admin request'},409:{description:'Unsafe state transition'}}}};
 paths['/api/github/webhook']={post:{description:'GitHub HMAC-SHA256 signed raw body; stored before acknowledgment',responses:{202:{description:'Event and canonical job stored'}}}};
 for(const [p,item]of Object.entries(paths))if(p.includes('{id}'))item.parameters=[{name:'id',in:'path',required:true,schema:{type:'string',format:'uuid'}}];
 return {openapi:'3.1.0',info:{title:'Cartilla Controller',version:'1.0.0'},paths,components:{securitySchemes:{readToken:{type:'http',scheme:'bearer'},adminToken:{type:'http',scheme:'bearer'}}}};
}
export async function api(req,deps,env=process.env){
 const url=new URL(req.url,'https://controller.local');const path=url.pathname,method=req.method;
 if(path==='/api/github/webhook'){
  if(method!=='POST')return {status:405,body:{error:'METHOD_NOT_ALLOWED'}};
  return webhook(await rawBody(req),req.headers,{get ledger(){return deps.ledger;},send:deps.send,env});
 }
 // Public operational totals contain no job IDs, requests, evidence, or credentials.
 // Detailed state and every action still require the existing distinct tokens.
 if(path==='/api/overview'&&method==='GET'){
  const groups=(await deps.ledger.db.query('SELECT status,count(*)::int AS count FROM jobs GROUP BY status')).rows;
  const latest=(await deps.ledger.db.query('SELECT max(updated_at) AS latest FROM jobs')).rows[0]?.latest??null;
  return {status:200,body:{statuses:Object.fromEntries(statuses.map(s=>[s,groups.find(g=>g.status===s)?.count??0])),last_activity:latest,worker_enabled:env.OPENHANDS_ENABLED==='true'}};
 }
 const admin=method==='POST';
 if(!['GET','POST'].includes(method))return {status:405,body:{error:'METHOD_NOT_ALLOWED'}};
 if(!authorized(req.headers.authorization,admin?env.CONTROLLER_ADMIN_TOKEN:env.CONTROLLER_READ_TOKEN))return {status:401,body:{error:'UNAUTHORIZED'}};
 if(env.CONTROLLER_ADMIN_TOKEN&&env.CONTROLLER_ADMIN_TOKEN===env.CONTROLLER_READ_TOKEN)return {status:503,body:{error:'DISTINCT_TOKENS_REQUIRED'}};
 if(path==='/api/openapi.json'&&method==='GET')return {status:200,body:openapi()};
 if(path==='/api/status'&&method==='GET'){
  const missing=['DATABASE_URL','GITHUB_REPO','GITHUB_WEBHOOK_SECRET','INNGEST_EVENT_KEY','INNGEST_SIGNING_KEY'].filter(k=>!env[k]);
  if(missing.length)return {status:503,body:{configured:false,missing,worker_enabled:env.OPENHANDS_ENABLED==='true',statuses:Object.fromEntries(statuses.map(s=>[s,null]))}};
  const groups=(await deps.ledger.db.query('SELECT status,count(*)::int AS count FROM jobs GROUP BY status')).rows;
  return {status:200,body:{configured:true,statuses:Object.fromEntries(statuses.map(s=>[s,groups.find(g=>g.status===s)?.count??0])),worker_enabled:env.OPENHANDS_ENABLED==='true',jules_required:false}};
 }
 if(path==='/api/jobs'&&method==='GET')return {status:200,body:{jobs:(await deps.ledger.jobs()).map(viewJob)}};
 if(path==='/api/workers'&&method==='GET'){
  const rows=(await deps.ledger.db.query("SELECT job_id,attempt_number,worker,external_id,start_task_id,state,deadline,dispatched_at,updated_at FROM job_attempts WHERE worker='openhands' ORDER BY dispatched_at DESC LIMIT 100")).rows;
  const count=(await deps.ledger.db.query("SELECT count(*)::int AS n FROM job_attempts WHERE worker='openhands' AND dispatched_at>=date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'")).rows[0].n;
  return {status:200,body:{openhands:{enabled:env.OPENHANDS_ENABLED==='true',daily_limit:Number(env.OPENHANDS_DAILY_START_LIMIT??10),daily_reserved:count,capacity:Number(env.OPENHANDS_CAPACITY??1),runs:rows,...(new URL(req.url,'https://controller.local').searchParams.get('check')==='authentication'?{authentication:await deps.worker.authStatus()}:{})},jules:{enabled:false,required:false,next_action:'Optional adapter not configured'}}};
 }
 const match=path.match(/^\/api\/jobs\/([a-f0-9-]{36})(?:\/(evidence|validations|retry|cancel))?$/);
 if(match){
  const id=match[1],suffix=match[2];const j=await deps.ledger.get(id);if(!j)return {status:404,body:{error:'JOB_NOT_FOUND'}};
  if(method==='GET'&&!suffix){
   const [e,v]=await Promise.all([deps.ledger.db.query('SELECT kind,data,recorded_at FROM evidence_receipts WHERE job_id=$1 ORDER BY recorded_at DESC LIMIT 1',[id]),deps.ledger.db.query('SELECT name,passed,details,recorded_at FROM validations WHERE job_id=$1 ORDER BY recorded_at DESC LIMIT 1',[id])]);
   return {status:200,body:{...viewJob(j),latest_evidence:e.rows[0]??null,validation:v.rows[0]??null}};
  }
  if(method==='GET'&&['evidence','validations'].includes(suffix)){
   const table=suffix==='evidence'?'evidence_receipts':'validations';return {status:200,body:{[suffix]:(await deps.ledger.db.query(`SELECT * FROM ${table} WHERE job_id=$1 ORDER BY recorded_at DESC LIMIT 200`,[id])).rows}};
  }
  if(method==='POST'&&suffix==='retry'){let request;try{const raw=await rawBody(req,1024);request=raw.length?JSON.parse(raw):{};}catch{return {status:400,body:{error:'INVALID_JSON'}};}if(Object.keys(request).some(k=>k!=='dispatch_resolution')||(request.dispatch_resolution&&request.dispatch_resolution!=='confirmed_not_created'))return {status:400,body:{error:'INVALID_RETRY_REQUEST'}};await deps.ledger.retry(id,request.dispatch_resolution);await deps.ledger.queue(await deps.ledger.get(id),deps.send);return {status:202,body:{jobId:id,stored:true}};}
  if(method==='POST'&&suffix==='cancel'){await deps.ledger.cancel(id);try{await deps.send({name:'cartilla/manual.job',data:{jobId:id}});}catch{}return {status:202,body:{jobId:id,stored:true}};}
 }
 if(path==='/api/jobs'&&method==='POST'){
  let body;try{body=JSON.parse((await rawBody(req,16384)).toString('utf8'));}catch{return {status:400,body:{error:'INVALID_JSON'}};}
  if(Object.keys(body).some(k=>!['kind','issue_number','idempotency_key'].includes(k))||typeof body.idempotency_key!=='string'||body.idempotency_key.length<8||body.idempotency_key.length>200)return {status:400,body:{error:'BOUNDED_REQUEST_REQUIRED'}};
  let job;
  if(body.kind==='repo_inspection')job=await deps.ledger.create({key:`admin:${digest(body.idempotency_key)}`,kind:'repo_inspection',source:{admin_request:digest(body.idempotency_key)},spec:{deadline_minutes:30}});
  else if(body.kind==='issue_implementation'&&Number.isInteger(body.issue_number)&&body.issue_number>0){
   const issue=await deps.github.request(`/issues/${body.issue_number}`);const p=parseSpec(issue,env.GITHUB_REPO);if(!p.runnable||issue.state!=='open')return {status:409,body:{error:p.reason??'ISSUE_NOT_OPEN'}};
   job=await deps.ledger.create({key:`issue:${issue.number}:${p.hash}`,kind:body.kind,issue:issue.number,source:{issue:issue.number,url:issue.html_url,scope_hash:p.hash,admin_request:digest(body.idempotency_key)},spec:p.spec});
  }else return {status:400,body:{error:'UNSUPPORTED_JOB_KIND'}};
  const queued=await deps.ledger.queue(job,deps.send);return {status:202,body:{stored:true,queued,jobId:job.id}};
 }
 return {status:404,body:{error:'NOT_FOUND'}};
}
