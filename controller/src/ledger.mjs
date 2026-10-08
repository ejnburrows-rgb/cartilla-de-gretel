import {randomUUID} from 'node:crypto';
import {transaction} from './db.mjs';
import {safeText} from './security.mjs';
export class Ledger {
 constructor(db){this.db=db;}
 async get(id){return (await this.db.query('SELECT * FROM jobs WHERE id=$1',[id])).rows[0];}
 async jobs({scope='all',limit=200,offset=0,statuses=[]}={}){
  const bounded=Math.min(200,Math.max(1,Number(limit)||200)),skip=Math.max(0,Number(offset)||0);
  const project="(kind='issue_implementation' OR coalesce(source->>'lane','') IN('release_verifier','release_request'))";
  const clauses=[];const args=[];
  if(scope==='project')clauses.push(project);else if(scope==='system')clauses.push(`NOT ${project}`);else if(scope!=='all')throw Error('INVALID_JOB_SCOPE');
  if(statuses.length){args.push(statuses);clauses.push(`status=ANY($${args.length}::text[])`);}
  args.push(bounded,skip);
  return (await this.db.query(`SELECT * FROM jobs${clauses.length?' WHERE '+clauses.join(' AND '):''} ORDER BY created_at DESC LIMIT $${args.length-1} OFFSET $${args.length}`,args)).rows;
 }
 async countJobs({scope='all',statuses=[]}={}){
  const project="(kind='issue_implementation' OR coalesce(source->>'lane','') IN('release_verifier','release_request'))";
  const clauses=[];const args=[];
  if(scope==='project')clauses.push(project);else if(scope==='system')clauses.push(`NOT ${project}`);else if(scope!=='all')throw Error('INVALID_JOB_SCOPE');
  if(statuses.length){args.push(statuses);clauses.push(`status=ANY($${args.length}::text[])`);}
  return (await this.db.query(`SELECT count(*)::int AS n FROM jobs${clauses.length?' WHERE '+clauses.join(' AND '):''}`,args)).rows[0].n;
 }
 async create({key,kind,source,spec={},issue=null,delivery=null},c=this.db){
  const r=await c.query(`INSERT INTO jobs(id,idempotency_key,kind,source,spec,issue_number,delivery_id) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(idempotency_key) DO NOTHING RETURNING *`,[randomUUID(),key,kind,JSON.stringify(source),JSON.stringify(spec),issue,delivery]);
  return r.rows[0]??(await c.query('SELECT * FROM jobs WHERE idempotency_key=$1',[key])).rows[0];
 }
 async receive(delivery,type,raw,payload){
  return transaction(this.db,async c=>{
   const r=await c.query('INSERT INTO webhook_events(delivery_id,event_type,raw_body,payload) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING delivery_id',[delivery,type,raw.toString('utf8'),JSON.stringify(payload)]);
   return {delivery,duplicate:r.rows.length===0};
  });
 }
 async recoverOrphans(){
  // Webhook events are durable facts. The minute reconcile reads current GitHub
  // state, so a failed queue wakeup needs no second owner-facing job row.
  return 0;
 }
 async set(id,status,reason=null,extra={}){
  const allowed=['deadline','retry_at','lease_until','starting_sha','worker','external_id','next_action','owner_action'];
  const keys=Object.keys(extra);if(keys.some(k=>!allowed.includes(k)))throw new Error('INVALID_UPDATE');
  if(status==='verified')throw new Error('USE_VALIDATION_GATE');
  const values=[id,status,reason?safeText(reason):null,...keys.map(k=>extra[k])];
  const changed=['status IS DISTINCT FROM $2','failure_reason IS DISTINCT FROM $3',...keys.map((k,i)=>`${k} IS DISTINCT FROM $${i+4}`)].join(' OR ');
  return (await this.db.query(`UPDATE jobs SET status=$2,failure_reason=$3,updated_at=now()${keys.map((k,i)=>`,${k}=$${i+4}`).join('')} WHERE id=$1 AND status NOT IN('verified','cancelled') AND (${changed}) RETURNING *`,values)).rows[0];
 }
 async receipt(job,kind,data,attempt=null,c=this.db){
  await c.query('INSERT INTO evidence_receipts(id,job_id,attempt_id,kind,data) VALUES($1,$2,$3,$4,$5)',[randomUUID(),job,attempt,kind,JSON.stringify(data)]);
 }
 async validate(job,name,passed,details,attempt=null,c=this.db){
  await c.query('INSERT INTO validations(id,job_id,attempt_id,name,passed,details) VALUES($1,$2,$3,$4,$5,$6)',[randomUUID(),job,attempt,name,passed,JSON.stringify(details)]);
 }
 async verify(job,attempt,name,details){
  return transaction(this.db,async c=>{
   const j=(await c.query('SELECT * FROM jobs WHERE id=$1 FOR UPDATE',[job])).rows[0];
   if(!j||j.status==='cancelled'||j.attempt_count!==attempt.attempt_number)throw new Error('VALIDATION_STALE');
   const a=(await c.query('SELECT * FROM job_attempts WHERE id=$1 AND job_id=$2',[attempt.id,job])).rows[0];
   const e=(await c.query("SELECT id FROM evidence_receipts WHERE job_id=$1 AND attempt_id=$2 AND kind='github_validation' AND recorded_at>= $3",[job,attempt.id,a?.dispatched_at])).rows;
   if(!a||a.state!=='finished'||!e.length||details.passed!==true)throw new Error('COMPLETION_DENIED');
   await this.validate(job,name,true,details,attempt.id,c);
   await c.query("UPDATE jobs SET status='verified',failure_reason=NULL,next_action='Rescan and refill available capacity',owner_action='Nothing',lease_until=NULL,updated_at=now() WHERE id=$1",[job]);
  });
 }
 // Reopen only unmerged implementation evidence whose new mandatory gates are pending.
 async supersedeVerification(id,context){
  if(!/^[a-f0-9]{40}$/.test(context.head??'')||!Number.isSafeInteger(context.pr))throw Error('FRESH_VERIFICATION_CONTEXT_REQUIRED');
  return transaction(this.db,async c=>{
   const j=(await c.query("SELECT * FROM jobs WHERE id=$1 AND kind='issue_implementation' AND status='verified' FOR UPDATE",[id])).rows[0];if(!j)return false;
   await this.validate(id,'verification_superseded',false,context,null,c);
   await c.query("UPDATE jobs SET status='waiting',failure_reason='INDEPENDENT_RELEASE_VERIFICATION_REQUIRED',lease_until=NULL,next_action='Await current independent review and exact-head release proof',owner_action='Nothing',updated_at=now() WHERE id=$1",[id]);return true;
  });
 }
 async fail(id,reason){
  return transaction(this.db,async c=>{
   const j=(await c.query('SELECT * FROM jobs WHERE id=$1 FOR UPDATE',[id])).rows[0];
   if(!j||['verified','cancelled'].includes(j.status))return;
   const dead=j.attempt_count>=j.max_attempts;
   await c.query(`UPDATE jobs SET status=$2,failure_reason=$3,retry_at=now()+($4 * interval '1 second'),lease_until=NULL,next_action=$5,owner_action=$6,updated_at=now() WHERE id=$1`,[id,dead?'dead_letter':'retrying',safeText(reason),Math.min(3600,60*2**j.attempt_count),dead?'Admin review then explicit retry':'Retry at durable deadline',dead?'Review failure':'Nothing']);
   if(dead)await c.query('INSERT INTO dead_letters(id,job_id,reason) VALUES($1,$2,$3)',[randomUUID(),id,safeText(reason)]);
  });
 }
 async claimLocal(id){
  return transaction(this.db,async c=>{
   const j=(await c.query("SELECT * FROM jobs WHERE id=$1 AND kind='reconcile' AND (status IN('received','queued') OR (status='retrying' AND retry_at<=now())) FOR UPDATE",[id])).rows[0];
   if(!j)return null;
   const a={id:randomUUID(),attempt_number:j.attempt_count+1};
   await c.query("INSERT INTO job_attempts(id,job_id,attempt_number,worker,payload_hash,starting_sha,state,deadline) VALUES($1,$2,$3,'controller','local','pending','running',now()+interval '5 minutes')",[a.id,id,a.attempt_number]);
   await c.query("UPDATE jobs SET status='running',attempt_count=$2,deadline=now()+interval '5 minutes',lease_until=now()+interval '5 minutes',worker='controller',updated_at=now() WHERE id=$1",[id,a.attempt_number]);
   return {...a,job:j};
  });
 }
 async attempt(id){return (await this.db.query('SELECT * FROM job_attempts WHERE job_id=$1 ORDER BY attempt_number DESC LIMIT 1',[id])).rows[0];}
 async queue(job,send){
  // A new generation per reconciliation allows recovery even after Inngest event-id retention expires.
  const r=(await this.db.query(`UPDATE jobs SET status='queued',queue_generation=queue_generation+1,updated_at=now() WHERE id=$1 AND (status='received' OR (status='retrying' AND retry_at<=now()) OR (status='queued' AND updated_at<now()-interval '10 minutes')) RETURNING *`,[job.id])).rows[0];
  if(!r)return false;
  try{await send({id:`job:${r.id}:${r.queue_generation}`,name:r.kind==='reconcile'?'cartilla/github.received':'cartilla/manual.job',data:{jobId:r.id}});return true;}
  catch{await transaction(this.db,async c=>{
   const failed=(await c.query("UPDATE jobs SET queue_failures=queue_failures+1,status=CASE WHEN queue_failures+1>=max_attempts THEN 'dead_letter' ELSE 'received' END,failure_reason='INNGEST_SEND_FAILED',next_action='Recover durable queue delivery',updated_at=now() WHERE id=$1 AND status='queued' AND queue_generation=$2 RETURNING *",[r.id,r.queue_generation])).rows[0];
   if(failed?.status==='dead_letter')await c.query('INSERT INTO dead_letters(id,job_id,reason) VALUES($1,$2,$3)',[randomUUID(),r.id,'INNGEST_SEND_RETRIES_EXHAUSTED']);
  });return false;}
 }
 async retry(id,resolution){
  return transaction(this.db,async c=>{
   const j=(await c.query('SELECT * FROM jobs WHERE id=$1 FOR UPDATE',[id])).rows[0];
   if(!j)throw new Error('JOB_NOT_FOUND');
   const active=(await c.query("SELECT id FROM job_attempts WHERE job_id=$1 AND state IN('reserved','running','ambiguous','cancel_requested')",[id])).rows;
   if(!['blocked','dead_letter','failed','cancelled'].includes(j.status))throw new Error('RETRY_UNSAFE');
   if(active.length){
    const attempts=(await c.query("SELECT * FROM job_attempts WHERE job_id=$1 AND state IN('reserved','running','ambiguous','cancel_requested')",[id])).rows;
    if(resolution!=='confirmed_not_created'||!attempts.every(a=>a.state==='ambiguous'&&!a.external_id&&!a.start_task_id))throw new Error('RETRY_UNSAFE');
    await this.receipt(id,'admin_dispatch_resolution',{resolution:'confirmed_not_created',authority:'explicit_admin_attestation'},attempts[0].id,c);
    await c.query("UPDATE job_attempts SET state='failed',updated_at=now() WHERE job_id=$1 AND state='ambiguous'",[id]);
   }
   await c.query("UPDATE jobs SET status='received',max_attempts=attempt_count+3,queue_failures=0,retry_at=NULL,failure_reason=NULL,owner_action='Nothing',updated_at=now() WHERE id=$1",[id]);
   await c.query('UPDATE dead_letters SET resolved_at=now() WHERE job_id=$1 AND resolved_at IS NULL',[id]);
  });
 }
 async cancel(id){
  return transaction(this.db,async c=>{
   const j=(await c.query('SELECT * FROM jobs WHERE id=$1 FOR UPDATE',[id])).rows[0];if(!j)throw new Error('JOB_NOT_FOUND');if(j.status==='verified')throw new Error('CANCEL_UNSAFE');
   const r=await c.query("UPDATE job_attempts SET state='cancel_requested',updated_at=now() WHERE job_id=$1 AND state IN('reserved','running','ambiguous') RETURNING id",[id]);
   await c.query("UPDATE jobs SET status='cancelled',next_action=$2,owner_action=$3,updated_at=now() WHERE id=$1",[id,r.rows.length?'Monitor existing external run; retain capacity until terminal':'Rescan available work',r.rows.length?'Stop external run in OpenHands if needed':'Nothing']);
  });
 }
}
